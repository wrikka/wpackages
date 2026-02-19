use crate::error::AppResult;
use crate::types::workspace::Workspace;
use std::path::Path;
use std::process::Command;

pub fn run_cargo_task(workspace: &Workspace, task: &str) -> AppResult<()> {
    let mut cmd = Command::new("cargo");
    cmd.args(["run", task]);
    cmd.current_dir(&workspace.path);

    let status = cmd.status()?;
    if !status.success() {
        return Err(crate::error::AppError::Task(format!(
            "Cargo task '{}' failed",
            task
        )));
    }

    Ok(())
}

pub fn run_cargo_test(workspace: &Workspace) -> AppResult<()> {
    let mut cmd = Command::new("cargo");
    cmd.args(["test"]);
    cmd.current_dir(&workspace.path);

    let status = cmd.status()?;
    if !status.success() {
        return Err(crate::error::AppError::Task(
            "Cargo tests failed".to_string(),
        ));
    }

    Ok(())
}

pub fn run_cargo_build(workspace: &Workspace) -> AppResult<()> {
    let mut cmd = Command::new("cargo");
    cmd.args(["build"]);
    cmd.current_dir(&workspace.path);

    let status = cmd.status()?;
    if !status.success() {
        return Err(crate::error::AppError::Task(
            "Cargo build failed".to_string(),
        ));
    }

    Ok(())
}

pub fn run_cargo_check(workspace: &Workspace) -> AppResult<()> {
    let mut cmd = Command::new("cargo");
    cmd.args(["check"]);
    cmd.current_dir(&workspace.path);

    let status = cmd.status()?;
    if !status.success() {
        return Err(crate::error::AppError::Task(
            "Cargo check failed".to_string(),
        ));
    }

    Ok(())
}

pub fn run_cargo_fmt(workspace: &Workspace) -> AppResult<()> {
    let mut cmd = Command::new("cargo");
    cmd.args(["fmt"]);
    cmd.current_dir(&workspace.path);

    cmd.status()?;
    Ok(())
}

pub fn run_cargo_clippy(workspace: &Workspace) -> AppResult<()> {
    let mut cmd = Command::new("cargo");
    cmd.args(["clippy"]);
    cmd.current_dir(&workspace.path);

    let status = cmd.status()?;
    if !status.success() {
        return Err(crate::error::AppError::Task(
            "Cargo clippy failed".to_string(),
        ));
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;
    use std::path::PathBuf;

    #[test]
    fn test_cargo_commands() {
        let workspace = Workspace {
            path: PathBuf::from("/test"),
            package_json: crate::types::workspace::PackageJson {
                name: "test".to_string(),
                dependencies: HashMap::new(),
                scripts: HashMap::new(),
            },
        };
        // Commands would need actual Cargo project for testing
    }
}
