use crate::error::AppResult;
use crate::types::workspace::Workspace;

pub fn discover_workspaces(patterns: &[String]) -> Vec<Workspace> {
    let mut workspaces = vec![];

    for pattern in patterns {
        let walker = ignore::WalkBuilder::new(pattern).build();
        for result in walker {
            match result {
                Ok(entry) => {
                    if entry.path().is_dir() {
                        if entry.path().join("package.json").exists() {
                            match Workspace::from_path(entry.path()) {
                                Ok(ws) => workspaces.push(ws),
                                Err(e) => eprintln!(
                                    "Error loading workspace at {}: {}",
                                    entry.path().display(),
                                    e
                                ),
                            }
                        }
                    }
                }
                Err(e) => eprintln!("Error walking directory: {}", e),
            }
        }
    }

    workspaces
}

pub fn discover_workspaces_from_config(patterns: &[String]) -> AppResult<Vec<Workspace>> {
    Ok(discover_workspaces(patterns))
}
