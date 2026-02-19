use crate::error::{AppError, AppResult};
use crate::services::cache;
use crate::types::config::TaskConfig;
use crate::types::workspace::Workspace;
use std::process::Command;
use std::thread;
use std::time::Duration;

pub fn run_task(
    workspace: &Workspace,
    task_name: &str,
    task_config: &TaskConfig,
    hash: &str,
    strict: bool,
    no_cache: bool,
) -> AppResult<()> {
    if !workspace.package_json.scripts.contains_key(task_name) {
        if strict {
            return Err(AppError::Task(format!(
                "Task '{}' not found in '{}'",
                task_name, workspace.package_json.name
            )));
        }

        println!(
            "\nTask '{}' not found in '{}'",
            task_name, workspace.package_json.name
        );
        return Ok(());
    }

    let max_retries = if task_config.retry_on_failure {
        task_config.max_retries
    } else {
        0
    };

    let mut last_error = None;

    for attempt in 0..=max_retries {
        if attempt > 0 {
            let delay = Duration::from_millis(task_config.retry_delay_ms * attempt as u64);
            println!(
                "Retry attempt {} for task '{}' in '{}' (waiting {:?})...",
                attempt, task_name, workspace.package_json.name, delay
            );
            thread::sleep(delay);
        }

        println!(
            "\nRunning 'bun run {}' in '{}'...",
            task_name, workspace.package_json.name
        );

        let status = Command::new("bun")
            .arg("run")
            .arg(task_name)
            .current_dir(&workspace.path)
            .status();

        match status {
            Ok(s) if s.success() => {
                if attempt > 0 {
                    println!(
                        "Task '{}' succeeded on attempt {} in '{}'",
                        task_name, attempt, workspace.package_json.name
                    );
                }

                if !no_cache {
                    cache::archive_outputs(workspace, task_config, hash)?;
                }

                return Ok(());
            }
            Ok(_) => {
                last_error = Some(AppError::Task(format!(
                    "Task '{}' failed in '{}'",
                    task_name, workspace.package_json.name
                )));

                if attempt < max_retries {
                    eprintln!(
                        "Task '{}' failed in '{}' (attempt {} of {}), will retry...",
                        task_name,
                        workspace.package_json.name,
                        attempt + 1,
                        max_retries + 1
                    );
                }
            }
            Err(e) => {
                last_error = Some(AppError::Task(format!(
                    "Failed to execute task '{}' in '{}': {}",
                    task_name, workspace.package_json.name, e
                )));

                if attempt < max_retries {
                    eprintln!(
                        "Failed to execute task '{}' in '{}' (attempt {} of {}), will retry...",
                        task_name,
                        workspace.package_json.name,
                        attempt + 1,
                        max_retries + 1
                    );
                }
            }
        }
    }

    Err(last_error.unwrap_or_else(|| {
        AppError::Task(format!(
            "Task '{}' failed in '{}' after {} attempts",
            task_name,
            workspace.package_json.name,
            max_retries + 1
        ))
    }))
}
