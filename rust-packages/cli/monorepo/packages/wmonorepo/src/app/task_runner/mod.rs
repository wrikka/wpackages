pub mod task_caching;
pub mod task_execution;
pub mod task_plugins;
pub mod task_report;
pub mod task_validation;

pub use task_caching::{CacheResult, CacheSource, TaskCacheOptions};
pub use task_execution::{execute_task, TaskExecutionOptions};
pub use task_plugins::TaskPluginManager;
pub use task_report::{write_task_report, TaskReportOptions};
pub use task_validation::validate_task_config;

// Re-export main functions from the original task_runner.rs
use crate::components::graph::build_dependency_graph;
use crate::config::WmoRepoConfig;
use crate::error::{AppError, AppResult};
use crate::services::concurrency::adaptive_concurrency;
use crate::services::plugin::PluginManager;
use crate::types::workspace::Workspace;
use std::sync::Arc;

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

fn print_graph_edges(workspaces: &[Workspace]) {
    for ws in workspaces {
        for dep_name in ws.package_json.dependencies.keys() {
            println!("{} -> {}", dep_name, ws.package_json.name);
        }
    }
}

pub async fn run_task_in_graph(
    config: &WmoRepoConfig,
    workspaces: Vec<Workspace>,
    task: &str,
    scope: Option<&String>,
    options: RunOptions,
) -> AppResult<()> {
    let plugin_manager = Arc::new(PluginManager::new(&config.plugins));
    let task_plugin_manager = TaskPluginManager::new(plugin_manager.clone());

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
        .map(|ws| (ws.package_json.name.clone(), ws))
        .collect();

    println!("\nRunning task '{}' for all packages...", task);

    let max_concurrency = adaptive_concurrency(Some(options.concurrency));
    let semaphore = Arc::new(tokio::sync::Semaphore::new(max_concurrency));
    let config = Arc::new(config);
    let workspaces_map = Arc::new(workspaces_map);
    let task_plugin_manager = Arc::new(task_plugin_manager);

    let mut reports: Vec<crate::types::report::WorkspaceRunReport> = vec![];

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
            if let Some(ws) = workspaces_map.get(&package_name) {
                let task_name = task.to_string();
                let task_config = config.pipeline.get(&task_name).cloned().unwrap_or_default();
                let config = Arc::clone(&config);
                let workspaces_map = Arc::clone(&workspaces_map);
                let semaphore = Arc::clone(&semaphore);
                let options = options.clone();
                let task_plugin_manager = Arc::clone(&task_plugin_manager);
                let ws = ws.clone();

                let permit = semaphore.acquire_owned().await.map_err(|_| {
                    AppError::Unknown("Failed to acquire concurrency permit".to_string())
                })?;

                let handle = tokio::spawn(async move {
                    let _permit = permit;

                    let execution_options = TaskExecutionOptions {
                        dry_run: options.dry_run,
                        explain: options.explain,
                        clean: options.clean,
                        strict: options.strict,
                        no_cache: options.no_cache,
                        force: options.force,
                    };

                    let report = execute_task(
                        &ws,
                        &task_name,
                        &task_config,
                        &workspaces_map,
                        &execution_options,
                        &task_plugin_manager,
                        config.remote_cache_url.as_ref(),
                    )
                    .await?;

                    Ok::<_, AppError>(report)
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

    let report_options = TaskReportOptions {
        report_json: options.report_json.clone(),
    };
    write_task_report(task, scope, reports, &report_options)?;

    Ok(())
}
