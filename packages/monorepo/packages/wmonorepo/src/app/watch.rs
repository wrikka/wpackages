use crate::config::WmoRepoConfig;
use crate::error::AppResult;
use crate::services::cache::calculate_workspace_hash;
use crate::types::config::TaskConfig;
use crate::types::workspace::Workspace;

use super::task_runner::{run_task_in_graph, RunOptions};

use notify::{RecursiveMode, Watcher};

fn combined_state_hash(
    config: &WmoRepoConfig,
    workspaces: &[Workspace],
    task: &str,
) -> AppResult<String> {
    let task_config: TaskConfig = config.pipeline.get(task).cloned().unwrap_or_default();

    let mut entries = workspaces
        .iter()
        .map(|ws| {
            let hash = calculate_workspace_hash(ws, task, &task_config)?;
            Ok::<_, crate::error::AppError>((ws.package_json.name.clone(), hash))
        })
        .collect::<Result<Vec<_>, _>>()?;

    entries.sort_by(|a, b| a.0.cmp(&b.0));

    let mut hasher = blake3::Hasher::new();
    hasher.update(task.as_bytes());
    for (name, hash) in entries {
        hasher.update(name.as_bytes());
        hasher.update(hash.as_bytes());
    }

    Ok(hasher.finalize().to_hex().to_string())
}

async fn watch_poll(
    config: &WmoRepoConfig,
    workspaces: Vec<Workspace>,
    task: &str,
    scope: Option<&String>,
    interval_ms: u64,
    options: RunOptions,
) -> AppResult<()> {
    let mut last = combined_state_hash(config, &workspaces, task)?;

    // Initial run
    run_task_in_graph(config, workspaces.clone(), task, scope, options.clone()).await?;

    let mut ticker = tokio::time::interval(std::time::Duration::from_millis(interval_ms));
    loop {
        ticker.tick().await;

        let current = combined_state_hash(config, &workspaces, task)?;
        if current != last {
            println!("\nChange detected. Re-running '{}'...", task);
            last = current;
            run_task_in_graph(config, workspaces.clone(), task, scope, options.clone()).await?;
        }
    }
}

async fn watch_native(
    config: &WmoRepoConfig,
    workspaces: Vec<Workspace>,
    task: &str,
    scope: Option<&String>,
    debounce_ms: u64,
    options: RunOptions,
) -> AppResult<()> {
    let mut last = combined_state_hash(config, &workspaces, task)?;

    // Initial run
    run_task_in_graph(config, workspaces.clone(), task, scope, options.clone()).await?;

    let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel::<()>();

    let mut watcher =
        notify::recommended_watcher(move |res: Result<notify::Event, notify::Error>| {
            if res.is_ok() {
                let _ = tx.send(());
            }
        })
        .map_err(|e| crate::error::AppError::Unknown(format!("Failed to create watcher: {}", e)))?;

    for ws in &workspaces {
        watcher
            .watch(ws.path.as_path(), RecursiveMode::Recursive)
            .map_err(|e| {
                crate::error::AppError::Unknown(format!(
                    "Failed to watch path {}: {}",
                    ws.path.display(),
                    e
                ))
            })?;
    }

    let debounce = std::time::Duration::from_millis(debounce_ms);
    loop {
        rx.recv().await;

        // Debounce: drain burst of events
        let started = tokio::time::Instant::now();
        while started.elapsed() < debounce {
            match tokio::time::timeout(debounce, rx.recv()).await {
                Ok(Some(_)) => continue,
                _ => break,
            }
        }

        let current = combined_state_hash(config, &workspaces, task)?;
        if current != last {
            println!("\nChange detected. Re-running '{}'...", task);
            last = current;
            run_task_in_graph(config, workspaces.clone(), task, scope, options.clone()).await?;
        }
    }
}

pub async fn watch_task(
    config: &WmoRepoConfig,
    workspaces: Vec<Workspace>,
    task: &str,
    scope: Option<&String>,
    interval_ms: u64,
    watch_mode: &str,
    options: RunOptions,
) -> AppResult<()> {
    match watch_mode {
        "native" => watch_native(config, workspaces, task, scope, 200, options).await,
        "poll" => watch_poll(config, workspaces, task, scope, interval_ms, options).await,
        other => Err(crate::error::AppError::Unknown(format!(
            "Invalid --watch-mode: {} (expected 'poll' or 'native')",
            other
        ))),
    }
}
