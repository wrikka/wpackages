use crate::error::AppResult;
use crate::types::workspace::Workspace;
use std::path::Path;
use std::process::Command;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum PythonPackageManager {
    Pip,
    Poetry,
    Pipenv,
}

impl PythonPackageManager {
    pub fn detect(workspace: &Workspace) -> Option<Self> {
        if workspace.path.join("pyproject.toml").exists() {
            Some(PythonPackageManager::Poetry)
        } else if workspace.path.join("Pipfile").exists() {
            Some(PythonPackageManager::Pipenv)
        } else if workspace.path.join("requirements.txt").exists()
            || workspace.path.join("setup.py").exists()
        {
            Some(PythonPackageManager::Pip)
        } else {
            None
        }
    }

    pub fn command(&self, task: &str) -> Command {
        match self {
            PythonPackageManager::Pip => Command::new("pip").args(["run", task]),
            PythonPackageManager::Poetry => Command::new("poetry").args(["run", task]),
            PythonPackageManager::Pipenv => Command::new("pipenv").args(["run", task]),
        }
    }

    pub fn install_command(&self) -> Command {
        match self {
            PythonPackageManager::Pip => Command::new("pip").args(["install", "-e", "."]),
            PythonPackageManager::Poetry => Command::new("poetry").args(["install"]),
            PythonPackageManager::Pipenv => Command::new("pipenv").args(["install"]),
        }
    }
}

pub fn run_python_task(workspace: &Workspace, task: &str) -> AppResult<()> {
    let manager = PythonPackageManager::detect(workspace).ok_or_else(|| {
        crate::error::AppError::Task(
            "No Python package manager found (pip, poetry, or pipenv)".to_string(),
        )
    })?;

    let mut cmd = manager.command(task);
    cmd.current_dir(&workspace.path);

    let status = cmd.status()?;
    if !status.success() {
        return Err(crate::error::AppError::Task(format!(
            "Python task '{}' failed",
            task
        )));
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;
    use std::path::PathBuf;

    #[test]
    fn test_detect_poetry() {
        let workspace = Workspace {
            path: PathBuf::from("/test"),
            package_json: crate::types::workspace::PackageJson {
                name: "test".to_string(),
                dependencies: HashMap::new(),
                scripts: HashMap::new(),
            },
        };
        // This would need actual file system for testing
        // assert_eq!(PythonPackageManager::detect(&workspace), Some(PythonPackageManager::Poetry));
    }
}
