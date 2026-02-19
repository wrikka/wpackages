use std::path::Path;

use super::error::ContextResult;
use super::types::Dependency;

pub fn get_dependencies(
    path: &Path,
    package_manager: &Option<String>,
) -> ContextResult<Vec<Dependency>> {
    let mut dependencies = Vec::new();

    match package_manager.as_deref() {
        Some("npm") | Some("yarn") | Some("pnpm") => {
            if let Ok(content) = std::fs::read_to_string(path.join("package.json")) {
                if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
                    if let Some(deps) = json["dependencies"].as_object() {
                        for (name, version) in deps {
                            dependencies.push(Dependency {
                                name: name.clone(),
                                version: version.as_str().unwrap_or("*").to_string(),
                                dev: false,
                            });
                        }
                    }
                    if let Some(dev_deps) = json["devDependencies"].as_object() {
                        for (name, version) in dev_deps {
                            dependencies.push(Dependency {
                                name: name.clone(),
                                version: version.as_str().unwrap_or("*").to_string(),
                                dev: true,
                            });
                        }
                    }
                }
            }
        }
        Some("cargo") => {
            if let Ok(content) = std::fs::read_to_string(path.join("Cargo.toml")) {
                for line in content.lines() {
                    if line.starts_with("name = \"") || line.contains(" = \"") {
                        if let Some(start) = line.find('"') {
                            if let Some(end) = line[start + 1..].find('"') {
                                let name = &line[start + 1..start + 1 + end];
                                dependencies.push(Dependency {
                                    name: name.to_string(),
                                    version: "*".to_string(),
                                    dev: false,
                                });
                            }
                        }
                    }
                }
            }
        }
        Some("pip") => {
            if let Ok(content) = std::fs::read_to_string(path.join("requirements.txt")) {
                for line in content.lines() {
                    if !line.starts_with('#') && !line.is_empty() {
                        let parts: Vec<&str> = line.split(['=', '>', '<']).collect();
                        if !parts.is_empty() {
                            dependencies.push(Dependency {
                                name: parts[0].trim().to_string(),
                                version: parts.get(1).unwrap_or(&"*").to_string(),
                                dev: false,
                            });
                        }
                    }
                }
            }
        }
        _ => {}
    }

    Ok(dependencies)
}
