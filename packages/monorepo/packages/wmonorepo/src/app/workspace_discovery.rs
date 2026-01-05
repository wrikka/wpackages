use crate::error::AppResult;
use crate::types::workspace::Workspace;

pub fn discover_workspaces(patterns: &[String]) -> Vec<Workspace> {
    let mut workspaces = vec![];

    for pattern in patterns {
        match glob::glob(pattern) {
            Ok(paths) => {
                for path in paths {
                    match path {
                        Ok(path) => {
                            if path.is_dir() && path.join("package.json").exists() {
                                match Workspace::from_path(&path) {
                                    Ok(ws) => workspaces.push(ws),
                                    Err(e) => eprintln!(
                                        "Error loading workspace at {}: {}",
                                        path.display(),
                                        e
                                    ),
                                }
                            }
                        }
                        Err(e) => eprintln!("Error expanding glob pattern '{}': {}", pattern, e),
                    }
                }
            }
            Err(e) => eprintln!("Invalid glob pattern '{}': {}", pattern, e),
        }
    }

    workspaces
}

pub fn discover_workspaces_from_config(patterns: &[String]) -> AppResult<Vec<Workspace>> {
    Ok(discover_workspaces(patterns))
}
