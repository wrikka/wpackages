use crate::components::Selector;
use crate::config::WmoRepoConfig;
use crate::services::cache::{cache_dir, clean_cache, gc_cache, inspect_cache, list_cache_entries};
use crate::services::doctor::run_doctor_checks;
use crate::services::git::changed_files;
use crate::types::cli::{CacheCommand, Cli, Commands};
use clap::Parser;

mod affected;
mod prune;
mod task_runner;
mod watch;
pub(crate) mod workspace_discovery;

use crate::error::AppResult;
use affected::affected_projects_from_files;
use prune::prune_repo;
use task_runner::run_task_in_graph;
use task_runner::RunOptions;
use watch::watch_task;
use workspace_discovery::discover_workspaces_from_config;

pub async fn run_app() -> AppResult<()> {
    let cli = Cli::parse();

    match &cli.command {
        Commands::Run {
            task,
            scope,
            filter,
        } => {
            if let Some(s) = scope {
                println!("Running task with scope: {}", s);
            } else {
                println!("Running all tasks");
            }

            let config = WmoRepoConfig::load()?;

            let workspaces = discover_workspaces_from_config(&config.workspaces)?;
            let workspaces = if let Some(filter_expr) = filter {
                let selector = Selector::parse(filter_expr).map_err(|e| {
                    crate::error::AppError::Unknown(format!("Invalid --filter: {}", e))
                })?;
                workspaces
                    .into_iter()
                    .filter(|ws| selector.matches_workspace(ws, &config))
                    .collect::<Vec<_>>()
            } else {
                workspaces
            };

            let options = RunOptions {
                concurrency: cli.concurrency,
                explain: cli.explain,
                report_json: cli.report_json.clone(),
                dry_run: cli.dry_run,
                print_graph: cli.print_graph,
                no_cache: cli.no_cache,
                force: cli.force,
                strict: cli.strict,
                clean: cli.clean,
            };

            run_task_in_graph(&config, workspaces, task, scope.as_ref(), options).await?;
        }
        Commands::Watch {
            task,
            scope,
            filter,
            interval_ms,
            watch_mode,
        } => {
            let config = WmoRepoConfig::load()?;

            let workspaces = discover_workspaces_from_config(&config.workspaces)?;
            let workspaces = if let Some(filter_expr) = filter {
                let selector = Selector::parse(filter_expr).map_err(|e| {
                    crate::error::AppError::Unknown(format!("Invalid --filter: {}", e))
                })?;
                workspaces
                    .into_iter()
                    .filter(|ws| selector.matches_workspace(ws, &config))
                    .collect::<Vec<_>>()
            } else {
                workspaces
            };

            let options = RunOptions {
                concurrency: cli.concurrency,
                explain: cli.explain,
                report_json: cli.report_json.clone(),
                dry_run: cli.dry_run,
                print_graph: cli.print_graph,
                no_cache: cli.no_cache,
                force: cli.force,
                strict: cli.strict,
                clean: cli.clean,
            };

            watch_task(
                &config,
                workspaces,
                task,
                scope.as_ref(),
                *interval_ms,
                watch_mode,
                options,
            )
            .await?;
        }
        Commands::Prune {
            out_dir,
            scope,
            filter,
        } => {
            let config = WmoRepoConfig::load()?;

            let workspaces = discover_workspaces_from_config(&config.workspaces)?;
            let workspaces = if let Some(filter_expr) = filter {
                let selector = Selector::parse(filter_expr).map_err(|e| {
                    crate::error::AppError::Unknown(format!("Invalid --filter: {}", e))
                })?;
                workspaces
                    .into_iter()
                    .filter(|ws| selector.matches_workspace(ws, &config))
                    .collect::<Vec<_>>()
            } else {
                workspaces
            };

            prune_repo(&config, workspaces, out_dir, scope.as_ref()).await?;
        }
        Commands::Changed { since, json } => {
            let config = WmoRepoConfig::load()?;
            let workspaces = discover_workspaces_from_config(&config.workspaces)?;
            let files = changed_files(since)?;

            let mut affected = std::collections::BTreeSet::new();
            for file in files {
                let file_path = std::path::Path::new(&file);
                for ws in &workspaces {
                    if file_path.starts_with(&ws.path) {
                        affected.insert(ws.package_json.name.clone());
                    }
                }
            }

            if *json {
                println!("{}", serde_json::to_string(&affected)?);
            } else {
                for name in affected {
                    println!("{}", name);
                }
            }
        }
        Commands::Affected {
            since,
            filter,
            json,
        } => {
            let config = WmoRepoConfig::load()?;
            let workspaces = discover_workspaces_from_config(&config.workspaces)?;
            let files = changed_files(since)?;

            let mut affected = affected_projects_from_files(&workspaces, &files);

            if let Some(filter_expr) = filter {
                let selector = Selector::parse(filter_expr).map_err(|e| {
                    crate::error::AppError::Unknown(format!("Invalid --filter: {}", e))
                })?;
                affected.retain(|name| {
                    workspaces
                        .iter()
                        .find(|ws| ws.package_json.name == *name)
                        .is_some_and(|ws| selector.matches_workspace(ws, &config))
                });
            }

            if *json {
                println!("{}", serde_json::to_string(&affected)?);
            } else {
                for name in affected {
                    println!("{}", name);
                }
            }
        }
        Commands::Init => {
            const CONFIG_FILE: &str = "wmo.config.json";
            if std::path::Path::new(CONFIG_FILE).exists() {
                println!("'{}' already exists.", CONFIG_FILE);
            } else {
                let default_config = serde_json::json!({
                    "workspaces": [
                        "apps/*",
                        "packages/*"
                    ],
                    "pipeline": {
                        "build": {
                            "outputs": ["dist/**"]
                        }
                    }
                });
                let content = serde_json::to_string_pretty(&default_config)?;
                std::fs::write(CONFIG_FILE, content)?;
                println!("Created a new '{}' file.", CONFIG_FILE);
            }
        }
        Commands::Doctor => {
            println!("Running doctor checks...");
            run_doctor_checks()?;
        }
        Commands::Cache { command } => match command {
            CacheCommand::Inspect => {
                let stats = inspect_cache()?;
                println!("Cache directory: {}", cache_dir());
                println!("Entries: {}", stats.entries);
                println!("Bytes: {}", stats.bytes);
            }
            CacheCommand::Ls => {
                println!("Cache directory: {}", cache_dir());
                let entries = list_cache_entries()?;
                for e in entries {
                    let modified = e
                        .modified
                        .and_then(|m| m.duration_since(std::time::UNIX_EPOCH).ok())
                        .map(|d| d.as_secs().to_string())
                        .unwrap_or_else(|| "unknown".to_string());
                    println!("{}\t{}\t{}", e.bytes, modified, e.file_name);
                }
            }
            CacheCommand::Gc {
                max_bytes,
                max_entries,
                ttl_seconds,
                dry_run,
            } => {
                let result = gc_cache(*max_bytes, *max_entries, *ttl_seconds, *dry_run)?;
                println!("Cache directory: {}", cache_dir());
                if *dry_run {
                    println!(
                        "DRY RUN: would remove {} entries ({} bytes)",
                        result.removed_entries, result.removed_bytes
                    );
                } else {
                    println!(
                        "Removed: {} entries ({} bytes)",
                        result.removed_entries, result.removed_bytes
                    );
                }
                println!(
                    "Remaining: {} entries ({} bytes)",
                    result.remaining_entries, result.remaining_bytes
                );
            }
            CacheCommand::Clean => {
                clean_cache()?;
                println!("Cache cleared: {}", cache_dir());
            }
        },
    }
    Ok(())
}
