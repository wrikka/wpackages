//! Integration tests for Context Suite

use context::components::*;
use context::services::*;
use std::path::PathBuf;
use tempfile::TempDir;

#[test]
fn test_language_detection_rust() {
    let temp_dir = TempDir::new().unwrap();
    let project_path = temp_dir.path();

    std::fs::write(project_path.join("Cargo.toml"), "").unwrap();

    let language = detect_language(project_path).unwrap();
    assert_eq!(language, "Rust");
}

#[test]
fn test_language_detection_typescript() {
    let temp_dir = TempDir::new().unwrap();
    let project_path = temp_dir.path();

    std::fs::write(project_path.join("package.json"), "").unwrap();
    std::fs::write(project_path.join("tsconfig.json"), "").unwrap();

    let language = detect_language(project_path).unwrap();
    assert_eq!(language, "TypeScript");
}

#[test]
fn test_language_detection_unknown() {
    let temp_dir = TempDir::new().unwrap();
    let project_path = temp_dir.path();

    let language = detect_language(project_path).unwrap();
    assert_eq!(language, "Unknown");
}

#[test]
fn test_framework_detection_nextjs() {
    let temp_dir = TempDir::new().unwrap();
    let project_path = temp_dir.path();

    std::fs::write(project_path.join("package.json"), "").unwrap();
    std::fs::write(project_path.join("next.config.js"), "").unwrap();

    let framework = detect_framework(project_path, "TypeScript").unwrap();
    assert_eq!(framework, Some("Next.js".to_string()));
}

#[test]
fn test_framework_detection_none() {
    let temp_dir = TempDir::new().unwrap();
    let project_path = temp_dir.path();

    let framework = detect_framework(project_path, "Unknown").unwrap();
    assert_eq!(framework, None);
}

#[test]
fn test_package_manager_detection_npm() {
    let temp_dir = TempDir::new().unwrap();
    let project_path = temp_dir.path();

    std::fs::write(project_path.join("package-lock.json"), "").unwrap();

    let pm = detect_package_manager(project_path).unwrap();
    assert_eq!(pm, Some("npm".to_string()));
}

#[test]
fn test_package_manager_detection_cargo() {
    let temp_dir = TempDir::new().unwrap();
    let project_path = temp_dir.path();

    std::fs::write(project_path.join("Cargo.lock"), "").unwrap();

    let pm = detect_package_manager(project_path).unwrap();
    assert_eq!(pm, Some("cargo".to_string()));
}

#[test]
fn test_dependency_parsing_npm() {
    let temp_dir = TempDir::new().unwrap();
    let project_path = temp_dir.path();

    let package_json = r#"{
        "dependencies": {
            "react": "^18.0.0",
            "typescript": "^5.0.0"
        },
        "devDependencies": {
            "jest": "^29.0.0"
        }
    }"#;

    std::fs::write(project_path.join("package.json"), package_json).unwrap();

    let deps = get_dependencies(project_path, &Some("npm".to_string())).unwrap();
    assert_eq!(deps.len(), 3);
    assert_eq!(deps[0].name, "react");
    assert_eq!(deps[0].dev, false);
    assert_eq!(deps[2].name, "jest");
    assert_eq!(deps[2].dev, true);
}

#[test]
fn test_project_info_service() {
    let temp_dir = TempDir::new().unwrap();
    let project_path = temp_dir.path();

    std::fs::write(project_path.join("test.txt"), "content").unwrap();
    std::fs::write(project_path.join("test2.txt"), "content2").unwrap();

    let files = ProjectInfoService::get_recent_files(project_path).unwrap();
    assert!(!files.is_empty());
}

#[test]
fn test_project_size() {
    let temp_dir = TempDir::new().unwrap();
    let project_path = temp_dir.path();

    std::fs::write(project_path.join("test.txt"), "hello world").unwrap();

    let size = ProjectInfoService::get_project_size(project_path).unwrap();
    assert!(size > 0);
}

#[test]
fn test_git_service_non_git_repo() {
    let temp_dir = TempDir::new().unwrap();
    let project_path = temp_dir.path();

    let info = GitService::get_info(project_path);
    assert!(info.is_ok());
}

#[test]
fn test_dependency_parser_empty() {
    let temp_dir = TempDir::new().unwrap();
    let project_path = temp_dir.path();

    let deps = get_dependencies(project_path, &Some("npm".to_string())).unwrap();
    assert!(deps.is_empty());
}
