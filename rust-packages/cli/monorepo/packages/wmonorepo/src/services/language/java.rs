use crate::error::AppResult;
use crate::types::workspace::Workspace;
use std::path::Path;
use std::process::Command;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum JavaBuildTool {
    Maven,
    Gradle,
}

impl JavaBuildTool {
    pub fn detect(workspace: &Workspace) -> Option<Self> {
        let path = &workspace.path;

        if path.join("build.gradle").exists() || path.join("build.gradle.kts").exists() {
            Some(JavaBuildTool::Gradle)
        } else if path.join("pom.xml").exists() {
            Some(JavaBuildTool::Maven)
        } else {
            None
        }
    }
}

pub fn run_java_task(workspace: &Workspace, task: &str) -> AppResult<()> {
    let tool = JavaBuildTool::detect(workspace).ok_or_else(|| {
        crate::error::AppError::Task("No Java build tool found (Maven or Gradle)".to_string())
    })?;

    match tool {
        JavaBuildTool::Gradle => run_gradle_task(workspace, task),
        JavaBuildTool::Maven => run_maven_task(workspace, task),
    }
}

fn run_gradle_task(workspace: &Workspace, task: &str) -> AppResult<()> {
    let mut cmd = Command::new("./gradlew");
    cmd.arg(task);
    cmd.current_dir(&workspace.path);

    let status = cmd.status()?;
    if !status.success() {
        return Err(crate::error::AppError::Task(format!(
            "Gradle task '{}' failed",
            task
        )));
    }

    Ok(())
}

fn run_maven_task(workspace: &Workspace, task: &str) -> AppResult<()> {
    let mut cmd = Command::new("mvn");
    cmd.arg(task);
    cmd.current_dir(&workspace.path);

    let status = cmd.status()?;
    if !status.success() {
        return Err(crate::error::AppError::Task(format!(
            "Maven task '{}' failed",
            task
        )));
    }

    Ok(())
}

pub fn run_java_test(workspace: &Workspace) -> AppResult<()> {
    let tool = JavaBuildTool::detect(workspace)
        .ok_or_else(|| crate::error::AppError::Task("No Java build tool found".to_string()))?;

    match tool {
        JavaBuildTool::Gradle => run_gradle_task(workspace, "test"),
        JavaBuildTool::Maven => run_maven_task(workspace, "test"),
    }
}

pub fn run_java_build(workspace: &Workspace) -> AppResult<()> {
    let tool = JavaBuildTool::detect(workspace)
        .ok_or_else(|| crate::error::AppError::Task("No Java build tool found".to_string()))?;

    match tool {
        JavaBuildTool::Gradle => run_gradle_task(workspace, "build"),
        JavaBuildTool::Maven => run_maven_task(workspace, "compile"),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;
    use std::path::PathBuf;

    #[test]
    fn test_java_commands() {
        let workspace = Workspace {
            path: PathBuf::from("/test"),
            package_json: crate::types::workspace::PackageJson {
                name: "test".to_string(),
                dependencies: HashMap::new(),
                scripts: HashMap::new(),
            },
        };
        // Commands would need actual Java project for testing
    }
}
