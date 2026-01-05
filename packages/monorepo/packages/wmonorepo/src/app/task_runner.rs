use crate::components::graph::build_dependency_graph;
use crate::config::WmoRepoConfig;
use crate::error::{AppError, AppResult};
use crate::services::cache::{calculate_workspace_hash, clean_outputs, is_cached, restore_outputs};
use crate::services::plugin::{PluginEvent, PluginManager};
use crate::services::remote_cache::{
    download_remote_cache, remote_cache_exists, upload_remote_cache,
};
use crate::services::task::run_task;
use crate::types::workspace::Workspace;
use serde::Serialize;
use std::time::Instant;

#[derive(Debug, Clone)]
pub struct RunOptions {
    pub concurrency: usize,
    pub explain: bool,
    pub report_json: Option<String>,
    pub dry_run: bool,
    pub print_graph: bool,
    pub no_cache: bool,
    pub force: bool,
    pub strict: bool,
    pub clean: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
enum CacheSource {
    None,
    Local,
    Remote,
}

#[derive(Debug, Clone, Serialize)]
struct WorkspaceRunReport {
    name: String,
    task: String,
    hash: String,
    cache: CacheSource,
    cached: bool,
    duration_ms: u128,
}

#[derive(Debug, Clone, Serialize)]
struct RunReport {
    task: String,
    scope: Option<String>,
    workspaces: Vec<WorkspaceRunReport>,
}

fn write_report_json(path: &str, report: &RunReport) -> AppResult<()> {
    let json = serde_json::to_string_pretty(report)?;
    if path == "-" {
        println!("{}", json);
        return Ok(());
    }

    if let Some(parent) = std::path::Path::new(path).parent() {
        if !parent.as_os_str().is_empty() {
            std::fs::create_dir_all(parent)?;
        }
    }
    std::fs::write(path, json)?;
    Ok(())
}

fn validate_task_config(
    task_name: &str,
    task_config: &crate::types::config::TaskConfig,
) -> AppResult<()> {
    for dep in &task_config.depends_on {
        if dep.is_empty() {
            return Err(AppError::Unknown(format!(
                "Task '{}' has invalid depends_on entry: empty string",
                task_name
            )));
        }
    }
    Ok(())
}

fn print_graph_edges(workspaces: &[Workspace]) {
    for ws in workspaces {
        for dep_name in ws.package_json.dependencies.keys() {
            println!("{} -> {}", dep_name, ws.package_json.name);
        }
    }
}

fn workspace_dependency_names<'a>(
    ws: &Workspace,
    workspaces_map: &'a std::collections::HashMap<String, Workspace>,
) -> Vec<&'a Workspace> {
    let mut deps = vec![];
    for dep_name in ws.package_json.dependencies.keys() {
        if let Some(dep_ws) = workspaces_map.get(dep_name) {
            deps.push(dep_ws);
        }
    }
    deps
}

pub async fn run_task_in_graph(
    config: &WmoRepoConfig,
    workspaces: Vec<Workspace>,
    task: &str,
    scope: Option<&String>,
    options: RunOptions,
) -> AppResult<()> {
    let plugin_manager = std::sync::Arc::new(PluginManager::new(&config.plugins));

    let (graph, node_map) = build_dependency_graph(&workspaces);

    if options.print_graph {
        print_graph_edges(&workspaces);
    }

    let mut a_graph = if let Some(scope_name) = scope {
        let start_node = node_map.get(scope_name).ok_or_else(|| {
            AppError::Unknown(format!("Scope '{}' not found in workspaces.", scope_name))
        })?;

        let mut dfs = petgraph::visit::DfsPostOrder::new(&graph, *start_node);
        let mut subgraph_nodes = std::collections::HashSet::new();
        while let Some(node) = dfs.next(&graph) {
            subgraph_nodes.insert(node);
        }

        graph.filter_map(
            |idx, node| subgraph_nodes.contains(&idx).then(|| node.clone()),
            |_, _edge| Some(()),
        )
    } else {
        graph.map(|_, node| node.clone(), |_, _| ())
    };

    let workspaces_map: std::collections::HashMap<String, Workspace> = workspaces
        .into_iter()
        .map(|ws| (ws.package_json.name.clone(), ws.clone()))
        .collect();

    println!("\nRunning task '{}' for all packages...", task);

    let max_concurrency = if options.concurrency == 0 {
        std::thread::available_parallelism()
            .map(|n| n.get())
            .unwrap_or(1)
    } else {
        options.concurrency
    };
    let semaphore = std::sync::Arc::new(tokio::sync::Semaphore::new(max_concurrency));

    let mut reports: Vec<WorkspaceRunReport> = vec![];

    while a_graph.node_count() > 0 {
        let nodes_to_run = a_graph
            .externals(petgraph::Direction::Incoming)
            .collect::<Vec<_>>();

        if nodes_to_run.is_empty() && a_graph.node_count() > 0 {
            return Err(AppError::CircularDependency(
                "Graph logic error".to_string(),
            ));
        }

        let mut handles = vec![];
        for node_index in nodes_to_run {
            let package_name = a_graph[node_index].clone();
            if let Some(ws) = workspaces_map.get(&package_name).cloned() {
                let task_name = task.to_string();
                let task_config = config.pipeline.get(&task_name).cloned().unwrap_or_default();
                let config = config.clone();
                let workspaces_map = workspaces_map.clone();
                let semaphore = semaphore.clone();
                let options = options.clone();
                let plugin_manager = plugin_manager.clone();

                let permit = semaphore.acquire_owned().await.map_err(|_| {
                    AppError::Unknown("Failed to acquire concurrency permit".to_string())
                })?;

                let handle = tokio::spawn(async move {
                    let _permit = permit;
                    validate_task_config(&task_name, &task_config)?;

                    let started = Instant::now();

                    if options.dry_run {
                        println!("DRY RUN: {} -> {}", ws.package_json.name, task_name);
                        return Ok::<_, AppError>(WorkspaceRunReport {
                            name: ws.package_json.name.clone(),
                            task: task_name,
                            hash: "".to_string(),
                            cache: CacheSource::None,
                            cached: true,
                            duration_ms: started.elapsed().as_millis(),
                        });
                    }

                    // Run per-workspace prerequisites first (e.g. lint depends_on build)
                    for dep_task in &task_config.depends_on {
                        if let Some(upstream_task) = dep_task.strip_prefix('^') {
                            let upstream_task = upstream_task.to_string();
                            let upstream_config = config
                                .pipeline
                                .get(&upstream_task)
                                .cloned()
                                .unwrap_or_default();
                            validate_task_config(&upstream_task, &upstream_config)?;

                            for dep_ws in workspace_dependency_names(&ws, &workspaces_map) {
                                let dep_hash = calculate_workspace_hash(
                                    dep_ws,
                                    &upstream_task,
                                    &upstream_config,
                                )?;
                                if !options.force && !options.no_cache && is_cached(&dep_hash) {
                                    restore_outputs(dep_ws, &dep_hash)?;
                                } else {
                                    if options.clean {
                                        clean_outputs(dep_ws, &upstream_config)?;
                                    }
                                    run_task(
                                        dep_ws,
                                        &upstream_task,
                                        &upstream_config,
                                        &dep_hash,
                                        options.strict,
                                        false,
                                    )?;
                                }
                            }
                            continue;
                        }

                        let dep_config = config.pipeline.get(dep_task).cloned().unwrap_or_default();
                        validate_task_config(dep_task, &dep_config)?;

                        let dep_hash = calculate_workspace_hash(&ws, dep_task, &dep_config)?;
                        if !options.force && !options.no_cache && is_cached(&dep_hash) {
                            restore_outputs(&ws, &dep_hash)?;
                        } else {
                            if options.clean {
                                clean_outputs(&ws, &dep_config)?;
                            }
                            run_task(&ws, dep_task, &dep_config, &dep_hash, options.strict, false)?;
                        }
                    }

                    let hash = calculate_workspace_hash(&ws, &task_name, &task_config)?;

                    if plugin_manager.is_enabled() {
                        let plugin_manager = plugin_manager.clone();
                        let ws_name = ws.package_json.name.clone();
                        let task_name = task_name.clone();
                        let hash = hash.clone();
                        std::mem::drop(tokio::task::spawn_blocking(move || {
                            plugin_manager.emit(PluginEvent::BeforeTask {
                                workspace: &ws_name,
                                task: &task_name,
                                hash: &hash,
                            });
                        }));
                    }

                    if !options.force && !options.no_cache && is_cached(&hash) {
                        println!("LOCAL CACHE HIT: {}", ws.package_json.name);
                        if options.explain {
                            println!("EXPLAIN: local cache hit (hash={})", hash);
                        }

                        if plugin_manager.is_enabled() {
                            let plugin_manager = plugin_manager.clone();
                            let ws_name = ws.package_json.name.clone();
                            let task_name = task_name.clone();
                            let hash = hash.clone();
                            std::mem::drop(tokio::task::spawn_blocking(move || {
                                plugin_manager.emit(PluginEvent::CacheHit {
                                    workspace: &ws_name,
                                    task: &task_name,
                                    hash: &hash,
                                    source: "local",
                                });
                            }));
                        }

                        restore_outputs(&ws, &hash)?;

                        if plugin_manager.is_enabled() {
                            let plugin_manager = plugin_manager.clone();
                            let ws_name = ws.package_json.name.clone();
                            let task_name = task_name.clone();
                            let hash = hash.clone();
                            std::mem::drop(tokio::task::spawn_blocking(move || {
                                plugin_manager.emit(PluginEvent::AfterTask {
                                    workspace: &ws_name,
                                    task: &task_name,
                                    hash: &hash,
                                    success: true,
                                });
                            }));
                        }

                        return Ok::<_, AppError>(WorkspaceRunReport {
                            name: ws.package_json.name.clone(),
                            task: task_name,
                            hash,
                            cache: CacheSource::Local,
                            cached: true,
                            duration_ms: started.elapsed().as_millis(),
                        });
                    }

                    if !options.no_cache {
                        if let Some(remote_cache_url) = &config.remote_cache_url {
                            if remote_cache_exists(&hash, remote_cache_url).await? {
                                println!("REMOTE CACHE HIT: {}", ws.package_json.name);
                                if options.explain {
                                    println!("EXPLAIN: remote cache hit (hash={})", hash);
                                }
                                if download_remote_cache(&hash, remote_cache_url).await.is_ok() {
                                    if plugin_manager.is_enabled() {
                                        let plugin_manager = plugin_manager.clone();
                                        let ws_name = ws.package_json.name.clone();
                                        let task_name = task_name.clone();
                                        let hash = hash.clone();
                                        std::mem::drop(tokio::task::spawn_blocking(move || {
                                            plugin_manager.emit(PluginEvent::CacheHit {
                                                workspace: &ws_name,
                                                task: &task_name,
                                                hash: &hash,
                                                source: "remote",
                                            });
                                        }));
                                    }

                                    restore_outputs(&ws, &hash)?;

                                    if plugin_manager.is_enabled() {
                                        let plugin_manager = plugin_manager.clone();
                                        let ws_name = ws.package_json.name.clone();
                                        let task_name = task_name.clone();
                                        let hash = hash.clone();
                                        std::mem::drop(tokio::task::spawn_blocking(move || {
                                            plugin_manager.emit(PluginEvent::AfterTask {
                                                workspace: &ws_name,
                                                task: &task_name,
                                                hash: &hash,
                                                success: true,
                                            });
                                        }));
                                    }

                                    return Ok::<_, AppError>(WorkspaceRunReport {
                                        name: ws.package_json.name.clone(),
                                        task: task_name,
                                        hash,
                                        cache: CacheSource::Remote,
                                        cached: true,
                                        duration_ms: started.elapsed().as_millis(),
                                    });
                                }
                            }
                        }
                    }

                    println!("CACHE MISS: {}", ws.package_json.name);
                    if options.explain {
                        println!("EXPLAIN: cache miss (hash={})", hash);
                    }

                    if plugin_manager.is_enabled() {
                        let plugin_manager = plugin_manager.clone();
                        let ws_name = ws.package_json.name.clone();
                        let task_name = task_name.clone();
                        let hash = hash.clone();
                        std::mem::drop(tokio::task::spawn_blocking(move || {
                            plugin_manager.emit(PluginEvent::CacheMiss {
                                workspace: &ws_name,
                                task: &task_name,
                                hash: &hash,
                            });
                        }));
                    }

                    if options.clean {
                        clean_outputs(&ws, &task_config)?;
                    }

                    let run_result = run_task(
                        &ws,
                        &task_name,
                        &task_config,
                        &hash,
                        options.strict,
                        options.no_cache,
                    );

                    if plugin_manager.is_enabled() {
                        let plugin_manager = plugin_manager.clone();
                        let ws_name = ws.package_json.name.clone();
                        let task_name = task_name.clone();
                        let hash = hash.clone();
                        let success = run_result.is_ok();
                        std::mem::drop(tokio::task::spawn_blocking(move || {
                            plugin_manager.emit(PluginEvent::AfterTask {
                                workspace: &ws_name,
                                task: &task_name,
                                hash: &hash,
                                success,
                            });
                        }));
                    }

                    run_result?;

                    if !options.no_cache {
                        if let Some(remote_cache_url) = &config.remote_cache_url {
                            if let Err(e) = upload_remote_cache(&hash, remote_cache_url).await {
                                eprintln!(
                                    "Failed to upload cache for {}: {}",
                                    ws.package_json.name, e
                                );
                            }
                        }
                    }

                    Ok(WorkspaceRunReport {
                        name: ws.package_json.name.clone(),
                        task: task_name,
                        hash,
                        cache: CacheSource::None,
                        cached: false,
                        duration_ms: started.elapsed().as_millis(),
                    })
                });
                handles.push((node_index, handle));
            }
        }

        for (node_index, handle) in handles {
            match handle.await? {
                Ok(report) => {
                    if !report.cached {
                        println!("Finished task for {}", report.name);
                    }
                    reports.push(report);
                }
                Err(e) => {
                    eprintln!("\nError in task: {}", e);
                    return Err(AppError::Task(e.to_string()));
                }
            }
            a_graph.remove_node(node_index);
        }
    }

    if let Some(path) = &options.report_json {
        let report = RunReport {
            task: task.to_string(),
            scope: scope.cloned(),
            workspaces: reports,
        };
        write_report_json(path, &report)?;
    }

    Ok(())
}
