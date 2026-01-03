use crate::error::{AppError, AppResult};
use crate::services::cache;
use crate::types::config::TaskConfig;
use crate::types::workspace::Workspace;
use std::process::Command;

pub fn run_task(workspace: &Workspace, task_name: &str, task_config: &TaskConfig, hash: &str) -> AppResult<()> {
    if let Some(script) = workspace.package_json.scripts.get(task_name) {
        println!("\nRunning '{}' in '{}'...", script, workspace.package_json.name);

        let mut cmd = if cfg!(target_os = "windows") {
            let mut cmd = Command::new("cmd");
            cmd.args(&["/C", script]);
            cmd
        } else {
            let mut cmd = Command::new("sh");
            cmd.arg("-c");
            cmd.arg(script);
            cmd
        };

        let status = cmd.current_dir(&workspace.path).status()?;

                if !status.success() {
            return Err(AppError::Task(format!("Task '{}' failed in '{}'", task_name, workspace.package_json.name)));
        } else {
            cache::archive_outputs(workspace, task_config, hash)?;
        }
    } else {
        println!("\nTask '{}' not found in '{}'", task_name, workspace.package_json.name);
    }

    Ok(())
}
