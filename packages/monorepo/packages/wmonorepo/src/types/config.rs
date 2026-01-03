use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct TaskConfig {
    #[serde(default)]
    pub outputs: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct WmoRepoConfig {
    #[serde(default)]
    pub remote_cache_url: Option<String>,
    pub workspaces: Vec<String>,
    #[serde(default)]
    pub pipeline: HashMap<String, TaskConfig>,
}

use crate::error::AppResult;

impl WmoRepoConfig {
    pub fn load() -> AppResult<Self> {
        const CONFIG_FILE: &str = "wmo.config.json";
        if std::path::Path::new(CONFIG_FILE).exists() {
            let config_str = std::fs::read_to_string(CONFIG_FILE)?;
            let config: WmoRepoConfig = serde_json::from_str(&config_str)?;
            return Ok(config);
        }

        let workspaces = detect_workspaces()?;
        Ok(WmoRepoConfig {
            remote_cache_url: None,
            workspaces,
            pipeline: HashMap::new(),
        })
    }
}

fn detect_workspaces() -> AppResult<Vec<String>> {
    if let Ok(package_json_str) = std::fs::read_to_string("package.json") {
        if let Ok(value) = serde_json::from_str::<serde_json::Value>(&package_json_str) {
            if let Some(workspaces) = value.get("workspaces") {
                if let Some(arr) = workspaces.as_array() {
                    return Ok(arr
                        .iter()
                        .filter_map(|v| v.as_str().map(|s| s.to_string()))
                        .collect());
                }

                if let Some(obj) = workspaces.as_object() {
                    if let Some(packages) = obj.get("packages").and_then(|v| v.as_array()) {
                        return Ok(packages
                            .iter()
                            .filter_map(|v| v.as_str().map(|s| s.to_string()))
                            .collect());
                    }
                }
            }
        }
    }

    if let Ok(pnpm_workspace_str) = std::fs::read_to_string("pnpm-workspace.yaml") {
        let re = regex::Regex::new(r"packages:\s*\n((?:\s+-\s+.+\n?)+)")?;
        if let Some(caps) = re.captures(&pnpm_workspace_str) {
            if let Some(block) = caps.get(1) {
                let patterns = block
                    .as_str()
                    .lines()
                    .map(|line| line.trim().trim_start_matches('-').trim())
                    .filter(|s| !s.is_empty())
                    .map(|s| s.to_string())
                    .collect::<Vec<_>>();

                if !patterns.is_empty() {
                    return Ok(patterns);
                }
            }
        }
    }

    Ok(vec![])
}
