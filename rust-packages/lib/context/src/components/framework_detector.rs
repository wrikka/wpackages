//! Framework detection component
//!
//! Pure functions for detecting frameworks based on project files and language.

use std::path::Path;

use super::super::error::ContextResult;

/// Detects the framework used in a project.
///
/// # Arguments
///
/// * `path` - The project root directory path
/// * `language` - The detected programming language
///
/// # Returns
///
/// Returns `Some(framework_name)` if a framework is detected, or `None` otherwise.
///
/// # Example
///
/// ```no_run
/// use context::components::framework_detector::detect_framework;
/// use std::path::Path;
///
/// let framework = detect_framework(Path::new("/path/to/project"), "TypeScript").unwrap();
/// if let Some(fw) = framework {
///     println!("Detected framework: {}", fw);
/// }
/// ```
pub fn detect_framework(path: &Path, language: &str) -> ContextResult<Option<String>> {
    match language {
        "JavaScript" | "TypeScript" => {
            if path.join("next.config.js").exists() || path.join("next.config.ts").exists() {
                return Ok(Some("Next.js".to_string()));
            }
            if path.join("nuxt.config.js").exists() || path.join("nuxt.config.ts").exists() {
                return Ok(Some("Nuxt".to_string()));
            }
            if path.join("vite.config.js").exists() || path.join("vite.config.ts").exists() {
                return Ok(Some("Vite".to_string()));
            }
            if path.join("angular.json").exists() {
                return Ok(Some("Angular".to_string()));
            }
        }
        "Rust" => {
            if path.join("tauri.conf.json").exists() || path.join("tauri.conf.toml").exists() {
                return Ok(Some("Tauri".to_string()));
            }
        }
        "Python" => {
            if path.join("manage.py").exists() {
                return Ok(Some("Django".to_string()));
            }
            if path.join("app.py").exists() || path.join("wsgi.py").exists() {
                return Ok(Some("Flask".to_string()));
            }
        }
        _ => {}
    }

    Ok(None)
}
