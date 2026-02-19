// Workspace management

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};

/// Package JSON structure
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PackageJson {
    pub name: String,
    #[serde(default)]
    pub dependencies: HashMap<String, String>,
    #[serde(default)]
    pub scripts: HashMap<String, String>,
}

/// Workspace information
#[derive(Debug, Clone)]
pub struct Workspace {
    pub path: PathBuf,
    pub package_json: PackageJson,
}

impl Workspace {
    pub fn from_path(path: &Path) -> Result<Self, Box<dyn std::error::Error>> {
        let package_json_path = path.join("package.json");
        let package_json_str = std::fs::read_to_string(package_json_path)?;
        let package_json: PackageJson = serde_json::from_str(&package_json_str)?;

        Ok(Workspace {
            path: path.to_path_buf(),
            package_json,
        })
    }
}

/// Task configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskConfig {
    pub name: String,
    pub command: String,
    pub inputs: Vec<String>,
    pub outputs: Vec<String>,
    pub depends_on: Vec<String>,
    pub env: Vec<String>,
}

/// Workspace discovery with caching
pub struct WorkspaceDiscovery {
    cache: HashMap<String, Workspace>,
}

impl WorkspaceDiscovery {
    pub fn new() -> Self {
        WorkspaceDiscovery {
            cache: HashMap::new(),
        }
    }

    pub fn discover(&mut self, root: &Path) -> Result<Vec<Workspace>, Box<dyn std::error::Error>> {
        let mut workspaces = Vec::new();

        // Scan for package.json files
        for entry in std::fs::read_dir(root)? {
            let entry = entry?;
            let path = entry.path();

            if path.is_dir() {
                let pkg_json = path.join("package.json");
                if pkg_json.exists() {
                    if let Some(workspace) = self.load_workspace(&path)? {
                        workspaces.push(workspace);
                    }
                }
            }
        }

        // Update cache
        for ws in &workspaces {
            self.cache.insert(ws.package_json.name.clone(), ws.clone());
        }

        Ok(workspaces)
    }

    fn load_workspace(&self, path: &Path) -> Result<Option<Workspace>, Box<dyn std::error::Error>> {
        let pkg_json = path.join("package.json");
        let content = std::fs::read_to_string(&pkg_json)?;

        let pkg: PackageJson = serde_json::from_str(&content)?;

        Ok(Some(Workspace {
            path: path.to_path_buf(),
            package_json: pkg,
        }))
    }

    pub fn get_cached(&self, name: &str) -> Option<&Workspace> {
        self.cache.get(name)
    }
}

impl Default for WorkspaceDiscovery {
    fn default() -> Self {
        Self::new()
    }
}
