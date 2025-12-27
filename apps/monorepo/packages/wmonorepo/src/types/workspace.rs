use crate::error::AppResult;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PackageJson {
    pub name: String,
    #[serde(default)]
    pub dependencies: HashMap<String, String>,
    #[serde(default)]
    pub scripts: HashMap<String, String>,
}

#[derive(Debug, Clone)]
pub struct Workspace {
    pub path: PathBuf,
    pub package_json: PackageJson,
}

impl Workspace {
    pub fn from_path(path: &Path) -> AppResult<Self> {
        let package_json_path = path.join("package.json");
        let package_json_str = std::fs::read_to_string(package_json_path)?;
        let package_json: PackageJson = serde_json::from_str(&package_json_str)?;

        Ok(Workspace {
            path: path.to_path_buf(),
            package_json,
        })
    }
}
