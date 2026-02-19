//! Language detection component
//!
//! Pure functions for detecting programming languages based on project files.

use std::path::Path;

use super::super::error::ContextResult;

/// Detects the primary programming language of a project.
///
/// # Arguments
///
/// * `path` - The project root directory path
///
/// # Returns
///
/// Returns the detected language name or "Unknown" if no indicators are found.
///
/// # Example
///
/// ```no_run
/// use context::components::language_detector::detect_language;
/// use std::path::Path;
///
/// let lang = detect_language(Path::new("/path/to/project")).unwrap();
/// println!("Detected language: {}", lang);
/// ```
pub fn detect_language(path: &Path) -> ContextResult<String> {
    let indicators = [
        ("Rust", vec!["Cargo.toml", "src/main.rs", "src/lib.rs"]),
        ("JavaScript", vec!["package.json", "index.js", "app.js"]),
        (
            "TypeScript",
            vec!["package.json", "tsconfig.json", "index.ts"],
        ),
        (
            "Python",
            vec!["requirements.txt", "setup.py", "pyproject.toml", "main.py"],
        ),
        ("Go", vec!["go.mod", "main.go"]),
        ("Java", vec!["pom.xml", "build.gradle", "src/main/java"]),
        ("Ruby", vec!["Gemfile", "Rakefile"]),
        ("PHP", vec!["composer.json", "index.php"]),
    ];

    for (language, files) in indicators {
        for file in files {
            if path.join(file).exists() {
                return Ok(language.to_string());
            }
        }
    }

    Ok("Unknown".to_string())
}
