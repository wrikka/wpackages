use crate::error::AppResult;
use crate::types::workspace::Workspace;
use std::path::Path;
use std::process::Command;

pub fn run_go_task(workspace: &Workspace, task: &str) -> AppResult<()> {
    let mut cmd = Command::new("go");
    cmd.args(["run", task]);
    cmd.current_dir(&workspace.path);

    let status = cmd.status()?;
    if !status.success() {
        return Err(crate::error::AppError::Task(format!(
            "Go task '{}' failed",
            task
        )));
    }

    Ok(())
}

pub fn run_go_test(workspace: &Workspace) -> AppResult<()> {
    let mut cmd = Command::new("go");
    cmd.args(["test", "./..."]);
    cmd.current_dir(&workspace.path);

    let status = cmd.status()?;
    if !status.success() {
        return Err(crate::error::AppError::Task("Go tests failed".to_string()));
    }

    Ok(())
}

pub fn run_go_build(workspace: &Workspace) -> AppResult<()> {
    let mut cmd = Command::new("go");
    cmd.args(["build", "./..."]);
    cmd.current_dir(&workspace.path);

    let status = cmd.status()?;
    if !status.success() {
        return Err(crate::error::AppError::Task("Go build failed".to_string()));
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;
    use std::path::PathBuf;

    #[test]
    fn test_go_commands() {
        let workspace = Workspace {
            path: PathBuf::from("/test"),
            package_json: crate::types::workspace::PackageJson {
                name: "test".to_string(),
                dependencies: HashMap::new(),
                scripts: HashMap::new(),
            },
        };
        // Commands would need actual Go project for testing
    }
}
