pub mod go;
pub mod java;
pub mod python;
pub mod rust;
pub mod unified_runner;

use crate::error::AppResult;
use crate::types::workspace::Workspace;
use std::path::Path;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Language {
    TypeScript,
    JavaScript,
    Python,
    Go,
    Rust,
    Java,
    Unknown,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum PackageManager {
    Bun,
    Npm,
    Yarn,
    Pnpm,
    Pip,
    Poetry,
    Pipenv,
    Cargo,
    Go,
    Maven,
    Gradle,
}

impl Language {
    pub fn detect(workspace: &Workspace) -> Self {
        let path = &workspace.path;

        if path.join("tsconfig.json").exists() {
            Language::TypeScript
        } else if path.join("package.json").exists() {
            Language::JavaScript
        } else if path.join("pyproject.toml").exists() || path.join("requirements.txt").exists() {
            Language::Python
        } else if path.join("go.mod").exists() {
            Language::Go
        } else if path.join("Cargo.toml").exists() {
            Language::Rust
        } else if path.join("pom.xml").exists() || path.join("build.gradle").exists() {
            Language::Java
        } else {
            Language::Unknown
        }
    }

    pub fn package_manager(&self, workspace: &Workspace) -> Option<PackageManager> {
        let path = &workspace.path;

        match self {
            Language::TypeScript | Language::JavaScript => {
                if path.join("bun.lockb").exists() {
                    Some(PackageManager::Bun)
                } else if path.join("pnpm-lock.yaml").exists() {
                    Some(PackageManager::Pnpm)
                } else if path.join("yarn.lock").exists() {
                    Some(PackageManager::Yarn)
                } else if path.join("package-lock.json").exists() {
                    Some(PackageManager::Npm)
                } else {
                    Some(PackageManager::Bun) // Default to bun
                }
            }
            Language::Python => {
                if path.join("pyproject.toml").exists() {
                    Some(PackageManager::Poetry)
                } else if path.join("Pipfile").exists() {
                    Some(PackageManager::Pipenv)
                } else {
                    Some(PackageManager::Pip)
                }
            }
            Language::Go => Some(PackageManager::Go),
            Language::Rust => Some(PackageManager::Cargo),
            Language::Java => {
                if path.join("build.gradle").exists() || path.join("build.gradle.kts").exists() {
                    Some(PackageManager::Gradle)
                } else if path.join("pom.xml").exists() {
                    Some(PackageManager::Maven)
                } else {
                    None
                }
            }
            Language::Unknown => None,
        }
    }

    pub fn default_task_command(&self, task: &str) -> Vec<String> {
        match self {
            Language::TypeScript | Language::JavaScript => {
                vec!["bun".to_string(), "run".to_string(), task.to_string()]
            }
            Language::Python => {
                vec!["python".to_string(), "-m".to_string(), task.to_string()]
            }
            Language::Go => {
                vec!["go".to_string(), "run".to_string(), task.to_string()]
            }
            Language::Rust => {
                vec!["cargo".to_string(), "run".to_string(), task.to_string()]
            }
            Language::Java => {
                vec!["./gradlew".to_string(), task.to_string()]
            }
            Language::Unknown => vec![],
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;
    use std::path::PathBuf;

    #[test]
    fn test_language_detection() {
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
