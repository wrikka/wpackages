use crate::error::AppResult;
use crate::types::workspace::Workspace;
use semver::{SemVerError, Version};
use std::fs;
use std::path::Path;
use std::process::Command;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum VersionBump {
    Major,
    Minor,
    Patch,
    Prerelease(String),
}

pub struct VersionManager;

impl VersionManager {
    pub fn get_version(workspace: &Workspace) -> AppResult<String> {
        let language = Self::detect_language(workspace);

        match language {
            Language::TypeScript | Language::JavaScript => Self::get_js_version(workspace),
            Language::Python => Self::get_python_version(workspace),
            Language::Go => Self::get_go_version(workspace),
            Language::Rust => Self::get_rust_version(workspace),
            Language::Java => Self::get_java_version(workspace),
            Language::Unknown => Err(crate::error::AppError::Task(
                "Unknown language - cannot get version".to_string(),
            )),
        }
    }

    pub fn bump_version(workspace: &Workspace, bump: VersionBump) -> AppResult<String> {
        let current = Self::get_version(workspace)?;
        let mut version = Version::parse(&current)?;

        match bump {
            VersionBump::Major => {
                version.major += 1;
                version.minor = 0;
                version.patch = 0;
            }
            VersionBump::Minor => {
                version.minor += 1;
                version.patch = 0;
            }
            VersionBump::Patch => {
                version.patch += 1;
            }
            VersionBump::Prerelease(prerelease) => {
                version.pre = semver::Prerelease::new(&prerelease)?;
            }
        }

        let new_version = version.to_string();
        Self::set_version(workspace, &new_version)?;

        Ok(new_version)
    }

    pub fn generate_changelog(
        workspace: &Workspace,
        from_version: &str,
        to_version: &str,
    ) -> AppResult<String> {
        let language = Self::detect_language(workspace);

        match language {
            Language::TypeScript | Language::JavaScript => {
                Self::generate_js_changelog(workspace, from_version, to_version)
            }
            Language::Python => {
                Self::generate_python_changelog(workspace, from_version, to_version)
            }
            Language::Go => Self::generate_go_changelog(workspace, from_version, to_version),
            Language::Rust => Self::generate_rust_changelog(workspace, from_version, to_version),
            Language::Java => Self::generate_java_changelog(workspace, from_version, to_version),
            Language::Unknown => Ok("# Changelog\n\nNo changes detected.".to_string()),
        }
    }

    fn detect_language(workspace: &Workspace) -> Language {
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

    fn get_js_version(workspace: &Workspace) -> AppResult<String> {
        let package_json_path = workspace.path.join("package.json");
        let content = fs::read_to_string(&package_json_path)?;
        let json: serde_json::Value = serde_json::from_str(&content)?;

        json.get("version")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .ok_or_else(|| {
                crate::error::AppError::Task("No version found in package.json".to_string())
            })
    }

    fn set_version(workspace: &Workspace, version: &str) -> AppResult<()> {
        let package_json_path = workspace.path.join("package.json");
        let content = fs::read_to_string(&package_json_path)?;
        let mut json: serde_json::Value = serde_json::from_str(&content)?;

        if let Some(obj) = json.as_object_mut() {
            obj.insert(
                "version".to_string(),
                serde_json::Value::String(version.to_string()),
            );
        }

        fs::write(&package_json_path, serde_json::to_string_pretty(&json)?)?;
        Ok(())
    }

    fn get_python_version(workspace: &Workspace) -> AppResult<String> {
        let pyproject_path = workspace.path.join("pyproject.toml");
        if pyproject_path.exists() {
            let content = fs::read_to_string(&pyproject_path)?;
            for line in content.lines() {
                if line.trim().starts_with("version = ") {
                    let version = line
                        .split('=')
                        .nth(1)
                        .and_then(|s| s.trim().trim_matches('"').trim_matches('\'').parse().ok());
                    if let Some(v) = version {
                        return Ok(v);
                    }
                }
            }
        }

        Err(crate::error::AppError::Task(
            "No version found in Python project".to_string(),
        ))
    }

    fn get_go_version(workspace: &Workspace) -> AppResult<String> {
        let go_mod_path = workspace.path.join("go.mod");
        let content = fs::read_to_string(&go_mod_path)?;

        content
            .lines()
            .find(|line| line.starts_with("module "))
            .and_then(|line| line.split_whitespace().nth(1))
            .map(|s| s.to_string())
            .ok_or_else(|| crate::error::AppError::Task("No module found in go.mod".to_string()))
    }

    fn get_rust_version(workspace: &Workspace) -> AppResult<String> {
        let cargo_toml_path = workspace.path.join("Cargo.toml");
        let content = fs::read_to_string(&cargo_toml_path)?;

        for line in content.lines() {
            if line.trim().starts_with("version = ") {
                let version = line
                    .split('=')
                    .nth(1)
                    .and_then(|s| s.trim().trim_matches('"').trim_matches('\'').parse().ok());
                if let Some(v) = version {
                    return Ok(v);
                }
            }
        }

        Err(crate::error::AppError::Task(
            "No version found in Cargo.toml".to_string(),
        ))
    }

    fn get_java_version(workspace: &Workspace) -> AppResult<String> {
        let pom_path = workspace.path.join("pom.xml");
        if pom_path.exists() {
            let content = fs::read_to_string(&pom_path)?;
            for line in content.lines() {
                if line.contains("<version>") && line.contains("</version>") {
                    let version = line
                        .split("<version>")
                        .nth(1)
                        .and_then(|s| s.split("</version>").next());
                    if let Some(v) = version {
                        return Ok(v.trim().to_string());
                    }
                }
            }
        }

        Err(crate::error::AppError::Task(
            "No version found in Java project".to_string(),
        ))
    }

    fn generate_js_changelog(workspace: &Workspace, from: &str, to: &str) -> AppResult<String> {
        let mut changelog = format!(
            "# Changelog\n\n## {} - {}\n\n",
            to,
            chrono::Utc::now().format("%Y-%m-%d")
        );

        // Get git commits between versions
        let output = Command::new("git")
            .args(["log", &format!("{}..{}", from, to), "--pretty=format:- %s"])
            .current_dir(&workspace.path)
            .output();

        if let Ok(output) = output {
            let commits = String::from_utf8_lossy(&output.stdout);
            if !commits.trim().is_empty() {
                changelog.push_str("### Changes\n\n");
                for commit in commits.lines() {
                    changelog.push_str(&format!("- {}\n", commit.trim_start_matches('-')));
                }
            }
        }

        Ok(changelog)
    }

    fn generate_python_changelog(workspace: &Workspace, from: &str, to: &str) -> AppResult<String> {
        Self::generate_js_changelog(workspace, from, to)
    }

    fn generate_go_changelog(workspace: &Workspace, from: &str, to: &str) -> AppResult<String> {
        Self::generate_js_changelog(workspace, from, to)
    }

    fn generate_rust_changelog(workspace: &Workspace, from: &str, to: &str) -> AppResult<String> {
        Self::generate_js_changelog(workspace, from, to)
    }

    fn generate_java_changelog(workspace: &Workspace, from: &str, to: &str) -> AppResult<String> {
        Self::generate_js_changelog(workspace, from, to)
    }

    pub fn publish(workspace: &Workspace) -> AppResult<()> {
        let language = Self::detect_language(workspace);

        match language {
            Language::TypeScript | Language::JavaScript => Self::publish_js(workspace),
            Language::Python => Self::publish_python(workspace),
            Language::Rust => Self::publish_rust(workspace),
            _ => Err(crate::error::AppError::Task(
                "Publishing not supported for this language".to_string(),
            )),
        }
    }

    fn publish_js(workspace: &Workspace) -> AppResult<()> {
        let mut cmd = Command::new("npm");
        cmd.args(["publish"]);
        cmd.current_dir(&workspace.path);

        let status = cmd.status()?;
        if !status.success() {
            return Err(crate::error::AppError::Task(
                "Failed to publish package".to_string(),
            ));
        }

        Ok(())
    }

    fn publish_python(workspace: &Workspace) -> AppResult<()> {
        let mut cmd = Command::new("python");
        cmd.args(["-m", "twine", "upload"]);
        cmd.current_dir(&workspace.path);

        let status = cmd.status()?;
        if !status.success() {
            return Err(crate::error::AppError::Task(
                "Failed to publish Python package".to_string(),
            ));
        }

        Ok(())
    }

    fn publish_rust(workspace: &Workspace) -> AppResult<()> {
        let mut cmd = Command::new("cargo");
        cmd.args(["publish"]);
        cmd.current_dir(&workspace.path);

        let status = cmd.status()?;
        if !status.success() {
            return Err(crate::error::AppError::Task(
                "Failed to publish Rust package".to_string(),
            ));
        }

        Ok(())
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
enum Language {
    TypeScript,
    JavaScript,
    Python,
    Go,
    Rust,
    Java,
    Unknown,
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;
    use std::path::PathBuf;

    #[test]
    fn test_version_bump() {
        let mut version = Version::parse("1.2.3").unwrap();

        version.major += 1;
        version.minor = 0;
        version.patch = 0;
        assert_eq!(version.to_string(), "2.0.0");

        let mut version = Version::parse("1.2.3").unwrap();
        version.minor += 1;
        version.patch = 0;
        assert_eq!(version.to_string(), "1.3.0");

        let mut version = Version::parse("1.2.3").unwrap();
        version.patch += 1;
        assert_eq!(version.to_string(), "1.2.4");
    }
}
