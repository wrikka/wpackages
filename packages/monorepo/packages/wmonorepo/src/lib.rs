pub mod components;
pub mod config;
pub mod error;
pub mod services;
pub mod types;

pub use error::{AppError, AppResult};

use crate::components::graph::build_dependency_graph;
use crate::config::WmoRepoConfig;
use crate::services::cache::{calculate_workspace_hash, is_cached, restore_outputs};
use crate::services::remote_cache::{download_remote_cache, remote_cache_exists, upload_remote_cache};
use crate::services::task::run_task;
use crate::types::cli::{Cli, Commands};
use crate::types::workspace::Workspace;
use clap::Parser;

pub async fn run_app() -> AppResult<()> {
    let cli = Cli::parse();

    match &cli.command {
        Commands::Run { task, scope } => {
            if let Some(s) = scope {
                println!("Running task with scope: {}", s);
            } else {
                println!("Running all tasks");
            }

            let config = WmoRepoConfig::load()?;

            let mut workspaces = vec![];
            for pattern in &config.workspaces {
                let walker = ignore::WalkBuilder::new(pattern).build();
                for result in walker {
                    match result {
                        Ok(entry) => {
                            if entry.path().is_dir() {
                                if entry.path().join("package.json").exists() {
                                    match Workspace::from_path(entry.path()) {
                                        Ok(ws) => workspaces.push(ws),
                                        Err(e) => eprintln!("Error loading workspace at {}: {}", entry.path().display(), e),
                                    }
                                }
                            }
                        }
                        Err(e) => eprintln!("Error walking directory: {}", e),
                    }
                }
            }

            let (graph, node_map) = build_dependency_graph(&workspaces);

            let mut a_graph = if let Some(scope_name) = scope {
                let start_node = node_map.get(scope_name.as_str())
                    .ok_or_else(|| AppError::Unknown(format!("Scope '{}' not found in workspaces.", scope_name)))?;

                let mut dfs = petgraph::visit::DfsPostOrder::new(&graph, *start_node);
                let mut subgraph_nodes = std::collections::HashSet::new();
                while let Some(node) = dfs.next(&graph) {
                    subgraph_nodes.insert(node);
                }

                graph.filter_map(
                    |idx, node| subgraph_nodes.contains(&idx).then_some(*node),
                    |_, edge| Some(()),
                )
            } else {
                graph.map(|_, node| *node, |_, _| ())
            };

            let workspaces_map: std::collections::HashMap<String, Workspace> = workspaces
                .into_iter()
                .map(|ws| (ws.package_json.name.clone(), ws.clone()))
                .collect();
            println!("\nRunning task '{}' for all packages...", task);

            while a_graph.node_count() > 0 {
                let nodes_to_run = a_graph
                    .externals(petgraph::Direction::Incoming)
                    .collect::<Vec<_>>();

                if nodes_to_run.is_empty() && a_graph.node_count() > 0 {
                    return Err(AppError::CircularDependency("Graph logic error".to_string()));
                }

                let mut handles = vec![];
                for node_index in nodes_to_run {
                    let package_name = a_graph[node_index];
                    if let Some(ws) = workspaces_map.get(package_name).cloned() {
                        let task_name = task.clone();
                        let task_config = config.pipeline.get(&task_name).cloned().unwrap_or_default();
                        let config = config.clone();

                        let handle = tokio::spawn(async move {
                            let hash = calculate_workspace_hash(&ws, &task_config.outputs)?;

                            if is_cached(&hash) {
                                println!("LOCAL CACHE HIT: {}", ws.package_json.name);
                                restore_outputs(&ws, &hash)?;
                                return Ok::<_, AppError>((ws.package_json.name.clone(), true));
                            }

                            if let Some(remote_cache_url) = &config.remote_cache_url {
                                                            if remote_cache_exists(&hash, remote_cache_url).await? {
                                    println!("REMOTE CACHE HIT: {}", ws.package_json.name);
                                                                        if download_remote_cache(&hash, remote_cache_url).await.is_ok() {
                                        restore_outputs(&ws, &hash)?;
                                        return Ok::<_, AppError>((ws.package_json.name.clone(), true));
                                    }
                                }
                            }

                            println!("CACHE MISS: {}", ws.package_json.name);
                            run_task(&ws, &task_name, &task_config, &hash)?;

                            if let Some(remote_cache_url) = &config.remote_cache_url {
                                if let Err(e) = upload_remote_cache(&hash, remote_cache_url).await {
                                    eprintln!("Failed to upload cache for {}: {}", ws.package_json.name, e);
                                }
                            }

                            Ok((ws.package_json.name.clone(), false))
                        });
                        handles.push((node_index, handle));
                    }
                }

                for (node_index, handle) in handles {
                    match handle.await? {
                        Ok((package_name, cached)) => {
                            if !cached {
                                println!("Finished task for {}", package_name);
                            }
                        }
                        Err(e) => {
                            eprintln!("\nError in task: {}", e);
                            // Consider how to handle failures, e.g., cancel other tasks.
                            return Err(AppError::Task(e.to_string()));
                        }
                    }
                    a_graph.remove_node(node_index);
                }
            }
        }
    }
    Ok(())
}
