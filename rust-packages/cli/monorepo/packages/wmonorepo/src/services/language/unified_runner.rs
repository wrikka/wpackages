use crate::error::AppResult;
use crate::services::language::{Language, PackageManager};
use crate::types::workspace::Workspace;
use std::path::Path;
use std::process::Command;

pub struct UnifiedTaskRunner;

impl UnifiedTaskRunner {
    pub fn run_task(workspace: &Workspace, task: &str) -> AppResult<()> {
        let language = Language::detect(workspace);
        let package_manager = language.package_manager(workspace);

        match (language, package_manager) {
            (Language::TypeScript | Language::JavaScript, Some(pm)) => {
                Self::run_js_task(workspace, task, &pm)
            }
            (Language::Python, Some(pm)) => Self::run_python_task(workspace, task, &pm),
            (Language::Go, Some(PackageManager::Go)) => Self::run_go_task(workspace, task),
            (Language::Rust, Some(PackageManager::Cargo)) => Self::run_cargo_task(workspace, task),
            (Language::Java, Some(pm)) => Self::run_java_task(workspace, task, &pm),
            (Language::Unknown, _) => Err(crate::error::AppError::Task(
                "Unknown language - cannot run task".to_string(),
            )),
            _ => Err(crate::error::AppError::Task(
                "No package manager found".to_string(),
            )),
        }
    }

    fn run_js_task(workspace: &Workspace, task: &str, pm: &PackageManager) -> AppResult<()> {
        let (cmd, args) = match pm {
            PackageManager::Bun => ("bun", vec!["run", task]),
            PackageManager::Npm => ("npm", vec!["run", task]),
            PackageManager::Yarn => ("yarn", vec!["run", task]),
            PackageManager::Pnpm => ("pnpm", vec!["run", task]),
            _ => {
                return Err(crate::error::AppError::Task(
                    "Unsupported package manager".to_string(),
                ))
            }
        };

        let mut command = Command::new(cmd);
        command.args(args);
        command.current_dir(&workspace.path);

        let status = command.status()?;
        if !status.success() {
            return Err(crate::error::AppError::Task(format!(
                "Task '{}' failed",
                task
            )));
        }

        Ok(())
    }

    fn run_python_task(workspace: &Workspace, task: &str, pm: &PackageManager) -> AppResult<()> {
        let (cmd, args) = match pm {
            PackageManager::Poetry => ("poetry", vec!["run", task]),
            PackageManager::Pipenv => ("pipenv", vec!["run", task]),
            PackageManager::Pip => ("python", vec!["-m", task]),
            _ => {
                return Err(crate::error::AppError::Task(
                    "Unsupported Python package manager".to_string(),
                ))
            }
        };

        let mut command = Command::new(cmd);
        command.args(args);
        command.current_dir(&workspace.path);

        let status = command.status()?;
        if !status.success() {
            return Err(crate::error::AppError::Task(format!(
                "Python task '{}' failed",
                task
            )));
        }

        Ok(())
    }

    fn run_go_task(workspace: &Workspace, task: &str) -> AppResult<()> {
        let mut command = Command::new("go");
        command.args(["run", task]);
        command.current_dir(&workspace.path);

        let status = command.status()?;
        if !status.success() {
            return Err(crate::error::AppError::Task(format!(
                "Go task '{}' failed",
                task
            )));
        }

        Ok(())
    }

    fn run_cargo_task(workspace: &Workspace, task: &str) -> AppResult<()> {
        let mut command = Command::new("cargo");
        command.args(["run", task]);
        command.current_dir(&workspace.path);

        let status = command.status()?;
        if !status.success() {
            return Err(crate::error::AppError::Task(format!(
                "Cargo task '{}' failed",
                task
            )));
        }

        Ok(())
    }

    fn run_java_task(workspace: &Workspace, task: &str, pm: &PackageManager) -> AppResult<()> {
        let (cmd, args) = match pm {
            PackageManager::Gradle => ("./gradlew", vec![task]),
            PackageManager::Maven => ("mvn", vec![task]),
            _ => {
                return Err(crate::error::AppError::Task(
                    "Unsupported Java package manager".to_string(),
                ))
            }
        };

        let mut command = Command::new(cmd);
        command.args(args);
        command.current_dir(&workspace.path);

        let status = command.status()?;
        if !status.success() {
            return Err(crate::error::AppError::Task(format!(
                "Java task '{}' failed",
                task
            )));
        }

        Ok(())
    }

    pub fn install_dependencies(workspace: &Workspace) -> AppResult<()> {
        let language = Language::detect(workspace);
        let package_manager = language.package_manager(workspace);

        match (language, package_manager) {
            (Language::TypeScript | Language::JavaScript, Some(pm)) => {
                Self::install_js_deps(workspace, &pm)
            }
            (Language::Python, Some(pm)) => Self::install_python_deps(workspace, &pm),
            (Language::Go, Some(PackageManager::Go)) => Self::install_go_deps(workspace),
            (Language::Rust, Some(PackageManager::Cargo)) => Self::install_cargo_deps(workspace),
            (Language::Java, Some(pm)) => Self::install_java_deps(workspace, &pm),
            _ => Ok(()),
        }
    }

    fn install_js_deps(workspace: &Workspace, pm: &PackageManager) -> AppResult<()> {
        let (cmd, args) = match pm {
            PackageManager::Bun => ("bun", vec!["install"]),
            PackageManager::Npm => ("npm", vec!["install"]),
            PackageManager::Yarn => ("yarn", vec!["install"]),
            PackageManager::Pnpm => ("pnpm", vec!["install"]),
            _ => return Ok(()),
        };

        let mut command = Command::new(cmd);
        command.args(args);
        command.current_dir(&workspace.path);

        command.status()?;
        Ok(())
    }

    fn install_python_deps(workspace: &Workspace, pm: &PackageManager) -> AppResult<()> {
        let (cmd, args) = match pm {
            PackageManager::Poetry => ("poetry", vec!["install"]),
            PackageManager::Pipenv => ("pipenv", vec!["install"]),
            PackageManager::Pip => ("pip", vec!["install", "-e", "."]),
            _ => return Ok(()),
        };

        let mut command = Command::new(cmd);
        command.args(args);
        command.current_dir(&workspace.path);

        command.status()?;
        Ok(())
    }

    fn install_go_deps(workspace: &Workspace) -> AppResult<()> {
        let mut command = Command::new("go");
        command.args(["mod", "download"]);
        command.current_dir(&workspace.path);

        command.status()?;
        Ok(())
    }

    fn install_cargo_deps(workspace: &Workspace) -> AppResult<()> {
        let mut command = Command::new("cargo");
        command.args(["fetch"]);
        command.current_dir(&workspace.path);

        command.status()?;
        Ok(())
    }

    fn install_java_deps(workspace: &Workspace, pm: &PackageManager) -> AppResult<()> {
        let (cmd, args) = match pm {
            PackageManager::Gradle => ("./gradlew", vec!["build"]),
            PackageManager::Maven => ("mvn", vec!["dependency:resolve"]),
            _ => return Ok(()),
        };

        let mut command = Command::new(cmd);
        command.args(args);
        command.current_dir(&workspace.path);

        command.status()?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;
    use std::path::PathBuf;

    #[test]
    fn test_unified_runner() {
        let workspace = Workspace {
            path: PathBuf::from("/test"),
            package_json: crate::types::workspace::PackageJson {
                name: "test".to_string(),
                dependencies: HashMap::new(),
                scripts: HashMap::new(),
            },
        };
        // Would need actual file system for testing
    }
}
