pub mod plugin;
pub mod task;

use crate::error::AppResult;
use crate::services::language::{Language, PackageManager};
use crate::types::workspace::Workspace;
use std::path::Path;
use std::process::Command;

pub struct Toolchain;

impl Toolchain {
    pub fn lint(workspace: &Workspace) -> AppResult<()> {
        let language = Language::detect(workspace);

        match language {
            Language::TypeScript | Language::JavaScript => Self::lint_js(workspace),
            Language::Python => Self::lint_python(workspace),
            Language::Go => Self::lint_go(workspace),
            Language::Rust => Self::lint_rust(workspace),
            Language::Java => Self::lint_java(workspace),
            Language::Unknown => Ok(()),
        }
    }

    pub fn format(workspace: &Workspace) -> AppResult<()> {
        let language = Language::detect(workspace);

        match language {
            Language::TypeScript | Language::JavaScript => Self::format_js(workspace),
            Language::Python => Self::format_python(workspace),
            Language::Go => Self::format_go(workspace),
            Language::Rust => Self::format_rust(workspace),
            Language::Java => Self::format_java(workspace),
            Language::Unknown => Ok(()),
        }
    }

    pub fn test(workspace: &Workspace) -> AppResult<()> {
        let language = Language::detect(workspace);

        match language {
            Language::TypeScript | Language::JavaScript => Self::test_js(workspace),
            Language::Python => Self::test_python(workspace),
            Language::Go => Self::test_go(workspace),
            Language::Rust => Self::test_rust(workspace),
            Language::Java => Self::test_java(workspace),
            Language::Unknown => Ok(()),
        }
    }

    fn lint_js(workspace: &Workspace) -> AppResult<()> {
        let pm = Language::detect(workspace).package_manager(workspace);

        match pm {
            Some(PackageManager::Bun) => {
                let mut cmd = Command::new("bun");
                cmd.args(["run", "lint"]);
                cmd.current_dir(&workspace.path);
                cmd.status()?;
            }
            Some(PackageManager::Npm) => {
                let mut cmd = Command::new("npm");
                cmd.args(["run", "lint"]);
                cmd.current_dir(&workspace.path);
                cmd.status()?;
            }
            Some(PackageManager::Yarn) => {
                let mut cmd = Command::new("yarn");
                cmd.args(["lint"]);
                cmd.current_dir(&workspace.path);
                cmd.status()?;
            }
            Some(PackageManager::Pnpm) => {
                let mut cmd = Command::new("pnpm");
                cmd.args(["lint"]);
                cmd.current_dir(&workspace.path);
                cmd.status()?;
            }
            _ => {}
        }

        Ok(())
    }

    fn lint_python(workspace: &Workspace) -> AppResult<()> {
        let mut cmd = Command::new("python");
        cmd.args(["-m", "pylint", "."]);
        cmd.current_dir(&workspace.path);
        cmd.status().ok(); // Ignore if pylint not installed
        Ok(())
    }

    fn lint_go(workspace: &Workspace) -> AppResult<()> {
        let mut cmd = Command::new("go");
        cmd.args(["vet", "./..."]);
        cmd.current_dir(&workspace.path);
        cmd.status()?;
        Ok(())
    }

    fn lint_rust(workspace: &Workspace) -> AppResult<()> {
        let mut cmd = Command::new("cargo");
        cmd.args(["clippy"]);
        cmd.current_dir(&workspace.path);
        cmd.status()?;
        Ok(())
    }

    fn lint_java(workspace: &Workspace) -> AppResult<()> {
        // Checkstyle or SpotBugs would be here
        let mut cmd = Command::new("./gradlew");
        cmd.args(["checkstyleMain"]);
        cmd.current_dir(&workspace.path);
        cmd.status().ok(); // Ignore if checkstyle not configured
        Ok(())
    }

    fn format_js(workspace: &Workspace) -> AppResult<()> {
        let mut cmd = Command::new("bun");
        cmd.args(["run", "format"]);
        cmd.current_dir(&workspace.path);
        cmd.status().ok(); // Ignore if format script not defined
        Ok(())
    }

    fn format_python(workspace: &Workspace) -> AppResult<()> {
        let mut cmd = Command::new("black");
        cmd.arg(".");
        cmd.current_dir(&workspace.path);
        cmd.status().ok(); // Ignore if black not installed
        Ok(())
    }

    fn format_go(workspace: &Workspace) -> AppResult<()> {
        let mut cmd = Command::new("go");
        cmd.args(["fmt", "./..."]);
        cmd.current_dir(&workspace.path);
        cmd.status()?;
        Ok(())
    }

    fn format_rust(workspace: &Workspace) -> AppResult<()> {
        let mut cmd = Command::new("cargo");
        cmd.args(["fmt"]);
        cmd.current_dir(&workspace.path);
        cmd.status()?;
        Ok(())
    }

    fn format_java(workspace: &Workspace) -> AppResult<()> {
        let mut cmd = Command::new("./gradlew");
        cmd.args(["spotlessApply"]);
        cmd.current_dir(&workspace.path);
        cmd.status().ok(); // Ignore if spotless not configured
        Ok(())
    }

    fn test_js(workspace: &Workspace) -> AppResult<()> {
        let mut cmd = Command::new("bun");
        cmd.args(["run", "test"]);
        cmd.current_dir(&workspace.path);
        cmd.status()?;
        Ok(())
    }

    fn test_python(workspace: &Workspace) -> AppResult<()> {
        let mut cmd = Command::new("python");
        cmd.args(["-m", "pytest"]);
        cmd.current_dir(&workspace.path);
        cmd.status()?;
        Ok(())
    }

    fn test_go(workspace: &Workspace) -> AppResult<()> {
        let mut cmd = Command::new("go");
        cmd.args(["test", "./..."]);
        cmd.current_dir(&workspace.path);
        cmd.status()?;
        Ok(())
    }

    fn test_rust(workspace: &Workspace) -> AppResult<()> {
        let mut cmd = Command::new("cargo");
        cmd.args(["test"]);
        cmd.current_dir(&workspace.path);
        cmd.status()?;
        Ok(())
    }

    fn test_java(workspace: &Workspace) -> AppResult<()> {
        let mut cmd = Command::new("./gradlew");
        cmd.args(["test"]);
        cmd.current_dir(&workspace.path);
        cmd.status()?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;
    use std::path::PathBuf;

    #[test]
    fn test_toolchain() {
        let workspace = Workspace {
            path: PathBuf::from("/test"),
            package_json: crate::types::workspace::PackageJson {
                name: "test".to_string(),
                dependencies: HashMap::new(),
                scripts: HashMap::new(),
            },
        };
        // Commands would need actual projects for testing
    }
}
