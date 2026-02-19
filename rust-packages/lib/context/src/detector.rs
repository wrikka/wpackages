use std::path::Path;

use super::error::ContextResult;

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
