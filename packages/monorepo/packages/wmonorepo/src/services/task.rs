use crate::error::{AppError, AppResult};
use crate::services::cache;
use crate::types::config::TaskConfig;
use crate::types::workspace::Workspace;
use std::process::Command;

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

    // bun-first: do not execute raw script strings via shell, run through the package manager.
    // This is more consistent across platforms (especially Windows) and matches repo conventions.
    println!(
        "\nRunning 'bun run {}' in '{}'...",
        task_name, workspace.package_json.name
    );

    let status = Command::new("bun")
        .arg("run")
        .arg(task_name)
        .current_dir(&workspace.path)
        .status()?;

    if !status.success() {
        return Err(AppError::Task(format!(
            "Task '{}' failed in '{}'",
            task_name, workspace.package_json.name
        )));
    }

    if !no_cache {
        cache::archive_outputs(workspace, task_config, hash)?;
    }

    Ok(())
}
