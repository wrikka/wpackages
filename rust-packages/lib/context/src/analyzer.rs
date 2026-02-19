use anyhow::Result;
use notify::{Event, RecursiveMode, Watcher};
use parking_lot::RwLock;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tokio::sync::mpsc;

use super::dependency::get_dependencies;
use super::detector::{detect_framework, detect_language, detect_package_manager};
use super::error::{ContextError, ContextResult};
use super::package_manager::*;
use super::project_info::{get_git_info, get_recent_files};
use super::types::*;

/// Context analyzer for analyzing project contexts.
///
/// This struct provides methods to analyze projects, detect languages,
/// frameworks, package managers, and manage file watchers for real-time updates.
pub struct ContextAnalyzer {
    projects: Arc<RwLock<HashMap<PathBuf, ProjectContext>>>,
    watchers: Arc<RwLock<HashMap<PathBuf, notify::RecommendedWatcher>>>,
}

impl ContextAnalyzer {
    /// Creates a new context analyzer instance.
    ///
    /// # Returns
    ///
    /// Returns a new `ContextAnalyzer` with empty project and watcher maps.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use context::analyzer::ContextAnalyzer;
    ///
    /// let analyzer = ContextAnalyzer::new();
    /// ```
    pub fn new() -> Self {
        Self {
            projects: Arc::new(RwLock::new(HashMap::new())),
            watchers: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Analyzes a project and creates its context.
    ///
    /// # Arguments
    ///
    /// * `path` - The path to the project directory
    ///
    /// # Returns
    ///
    /// Returns the analyzed `ProjectContext`.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use context::analyzer::ContextAnalyzer;
    /// use std::path::PathBuf;
    ///
    /// # async fn example() {
    /// let analyzer = ContextAnalyzer::new();
    /// let context = analyzer.analyze_project(PathBuf::from("/path/to/project")).await.unwrap();
    /// # }
    /// ```
    pub async fn analyze_project(&self, path: PathBuf) -> ContextResult<ProjectContext> {
        let name = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        let language = detect_language(&path)?;
        let framework = detect_framework(&path, &language)?;
        let package_manager = detect_package_manager(&path)?;
        let dependencies = get_dependencies(&path, &package_manager)?;
        let recent_files = get_recent_files(&path)?;
        let git_info = get_git_info(&path)?;

        let context = ProjectContext {
            path: path.clone(),
            name,
            language,
            framework,
            package_manager,
            dependencies,
            recent_files,
            git_branch: git_info.0,
            git_remote: git_info.1,
        };

        self.projects.write().insert(path.clone(), context.clone());
        self.start_watching(path)?;

        Ok(context)
    }

    /// Gets the context for a previously analyzed project.
    ///
    /// # Arguments
    ///
    /// * `path` - The path to the project directory
    ///
    /// # Returns
    ///
    /// Returns `Some(ProjectContext)` if the project has been analyzed, `None` otherwise.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use context::analyzer::ContextAnalyzer;
    /// use std::path::Path;
    ///
    /// let analyzer = ContextAnalyzer::new();
    /// let context = analyzer.get_context(Path::new("/path/to/project"));
    /// ```
    pub fn get_context(&self, path: &Path) -> Option<ProjectContext> {
        self.projects.read().get(path).cloned()
    }

    /// Checks for available package updates in a project.
    ///
    /// # Arguments
    ///
    /// * `path` - The path to the project directory
    ///
    /// # Returns
    ///
    /// Returns a vector of `PackageUpdate` structs.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use context::analyzer::ContextAnalyzer;
    /// use std::path::Path;
    ///
    /// # async fn example() {
    /// let analyzer = ContextAnalyzer::new();
    /// let updates = analyzer.check_updates(Path::new("/path/to/project")).await.unwrap();
    /// # }
    /// ```
    pub async fn check_updates(&self, path: &Path) -> ContextResult<Vec<PackageUpdate>> {
        let context = self
            .get_context(path)
            .ok_or_else(|| ContextError::NotFound(path.display().to_string()))?;

        let updates = match context.package_manager.as_deref() {
            Some("npm") | Some("yarn") | Some("pnpm") => check_npm_updates(path).await?,
            Some("cargo") => check_cargo_updates(path).await?,
            Some("pip") => check_pip_updates(path).await?,
            _ => vec![],
        };

        Ok(updates)
    }

    /// Checks for security vulnerabilities in project dependencies.
    ///
    /// # Arguments
    ///
    /// * `path` - The path to the project directory
    ///
    /// # Returns
    ///
    /// Returns a vector of `VulnerabilityReport` structs.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use context::analyzer::ContextAnalyzer;
    /// use std::path::Path;
    ///
    /// # async fn example() {
    /// let analyzer = ContextAnalyzer::new();
    /// let reports = analyzer.check_vulnerabilities(Path::new("/path/to/project")).await.unwrap();
    /// # }
    /// ```
    pub async fn check_vulnerabilities(
        &self,
        path: &Path,
    ) -> ContextResult<Vec<VulnerabilityReport>> {
        let context = self
            .get_context(path)
            .ok_or_else(|| ContextError::NotFound(path.display().to_string()))?;

        let reports = match context.package_manager.as_deref() {
            Some("npm") | Some("yarn") | Some("pnpm") => check_npm_vulnerabilities(path).await?,
            Some("cargo") => check_cargo_vulnerabilities(path).await?,
            Some("pip") => check_pip_vulnerabilities(path).await?,
            _ => vec![],
        };

        Ok(reports)
    }

    /// Updates specified packages in a project.
    ///
    /// # Arguments
    ///
    /// * `path` - The path to the project directory
    /// * `packages` - A vector of package names to update
    ///
    /// # Returns
    ///
    /// Returns `Ok(())` on success.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use context::analyzer::ContextAnalyzer;
    /// use std::path::Path;
    ///
    /// # async fn example() {
    /// let analyzer = ContextAnalyzer::new();
    /// analyzer.update_dependencies(Path::new("/path/to/project"), vec!["react".to_string()]).await.unwrap();
    /// # }
    /// ```
    pub async fn update_dependencies(
        &self,
        path: &Path,
        packages: Vec<String>,
    ) -> ContextResult<()> {
        let context = self
            .get_context(path)
            .ok_or_else(|| ContextError::NotFound(path.display().to_string()))?;

        match context.package_manager.as_deref() {
            Some("npm") => npm_update(path, packages).await?,
            Some("yarn") => yarn_update(path, packages).await?,
            Some("pnpm") => pnpm_update(path, packages).await?,
            Some("cargo") => cargo_update(path, packages).await?,
            Some("pip") => pip_update(path, packages).await?,
            _ => {}
        }

        Ok(())
    }

    fn start_watching(&self, path: PathBuf) -> ContextResult<()> {
        let (tx, _rx) = mpsc::channel(100);

        let mut watcher = notify::recommended_watcher(move |res: Result<Event, _>| {
            if let Ok(event) = res {
                let _ = tx.blocking_send(event);
            }
        })?;

        watcher.watch(&path, RecursiveMode::Recursive)?;

        self.watchers.write().insert(path, watcher);

        Ok(())
    }
}

impl Default for ContextAnalyzer {
    fn default() -> Self {
        Self::new()
    }
}
