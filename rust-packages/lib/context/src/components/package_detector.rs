//! Package manager detection component
//!
//! Pure functions for detecting package managers based on lock files.

use std::path::Path;

use super::super::error::ContextResult;

/// Detects the package manager used in a project.
///
/// # Arguments
///
/// * `path` - The project root directory path
///
/// # Returns
///
/// Returns `Some(package_manager_name)` if a package manager is detected, or `None` otherwise.
///
/// # Example
///
/// ```no_run
/// use context::components::package_detector::detect_package_manager;
/// use std::path::Path;
///
/// let pm = detect_package_manager(Path::new("/path/to/project")).unwrap();
/// if let Some(pkg_mgr) = pm {
///     println!("Detected package manager: {}", pkg_mgr);
/// }
/// ```
pub fn detect_package_manager(path: &Path) -> ContextResult<Option<String>> {
    if path.join("package-lock.json").exists() {
        return Ok(Some("npm".to_string()));
    }
    if path.join("yarn.lock").exists() {
        return Ok(Some("yarn".to_string()));
    }
    if path.join("pnpm-lock.yaml").exists() {
        return Ok(Some("pnpm".to_string()));
    }
    if path.join("Cargo.lock").exists() {
        return Ok(Some("cargo".to_string()));
    }
    if path.join("requirements.txt").exists() || path.join("poetry.lock").exists() {
        return Ok(Some("pip".to_string()));
    }
    if path.join("go.sum").exists() {
        return Ok(Some("go".to_string()));
    }

    Ok(None)
}
