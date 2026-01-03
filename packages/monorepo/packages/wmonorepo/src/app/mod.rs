use crate::config::WmoRepoConfig;
use crate::services::doctor::run_doctor_checks;
use crate::services::git::changed_files;
use crate::types::cli::{Cli, Commands};
use clap::Parser;

mod task_runner;
mod workspace_discovery;

use crate::error::AppResult;
use task_runner::run_task_in_graph;
use workspace_discovery::discover_workspaces_from_config;

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

            let workspaces = discover_workspaces_from_config(&config.workspaces)?;
            run_task_in_graph(&config, workspaces, task, scope.as_ref()).await?;
        }
        Commands::Changed { since } => {
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

            for name in affected {
                println!("{}", name);
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
    }
    Ok(())
}
