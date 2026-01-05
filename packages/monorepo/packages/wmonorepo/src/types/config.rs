use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct TaskConfig {
    #[serde(default)]
    pub inputs: Vec<String>,

    #[serde(default)]
    pub outputs: Vec<String>,

    #[serde(default)]
    pub env: Vec<String>,

    #[serde(default)]
    pub depends_on: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct ProjectConfig {
    #[serde(default)]
    pub tags: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct DependencyConstraint {
    pub from_tag: String,
    pub to_tag: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct ConstraintsConfig {
    #[serde(default)]
    pub deny: Vec<DependencyConstraint>,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct PluginConfig {
    pub command: String,

    #[serde(default)]
    pub args: Vec<String>,

    #[serde(default = "default_true")]
    pub enabled: bool,
}

fn default_true() -> bool {
    true
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct WmoRepoConfig {
    #[serde(rename = "$schema", default)]
    pub schema: Option<String>,

    #[serde(default, deserialize_with = "deserialize_extends")]
    pub extends: Vec<String>,

    #[serde(default)]
    pub remote_cache_url: Option<String>,
    pub workspaces: Vec<String>,
    #[serde(default)]
    pub pipeline: HashMap<String, TaskConfig>,

    #[serde(default)]
    pub projects: HashMap<String, ProjectConfig>,

    #[serde(default)]
    pub constraints: ConstraintsConfig,

    #[serde(default)]
    pub plugins: Vec<PluginConfig>,
}

use crate::error::AppResult;

impl WmoRepoConfig {
    pub fn load() -> AppResult<Self> {
        let config = if let Some((path, config_str)) =
            read_first_existing_config(&["wmo.config.json", "wmorepo.json"])?
        {
            load_config_recursive(&path, &config_str, &mut std::collections::HashSet::new())?
        } else {
            let workspaces = detect_workspaces()?;
            WmoRepoConfig {
                schema: None,
                extends: vec![],
                remote_cache_url: None,
                workspaces,
                pipeline: HashMap::new(),
                projects: HashMap::new(),
                constraints: ConstraintsConfig::default(),
                plugins: vec![],
            }
        };

        config.validate()?;
        Ok(config)
    }

    pub fn validate(&self) -> AppResult<()> {
        if self.workspaces.is_empty() {
            return Err(crate::error::AppError::Doctor(
                "Configuration validation failed: 'workspaces' array cannot be empty.".to_string(),
            ));
        }

        for ext in &self.extends {
            if ext.trim().is_empty() {
                return Err(crate::error::AppError::Doctor(
                    "Configuration validation failed: 'extends' cannot contain empty string"
                        .to_string(),
                ));
            }
        }

        for rule in &self.constraints.deny {
            if rule.from_tag.trim().is_empty() || rule.to_tag.trim().is_empty() {
                return Err(crate::error::AppError::Doctor(
                    "Configuration validation failed: constraints.deny requires from_tag and to_tag"
                        .to_string(),
                ));
            }
        }

        for plugin in &self.plugins {
            if plugin.command.trim().is_empty() {
                return Err(crate::error::AppError::Doctor(
                    "Configuration validation failed: plugins[].command cannot be empty"
                        .to_string(),
                ));
            }
        }

        for (task_name, task_config) in &self.pipeline {
            for dep in &task_config.depends_on {
                if dep.is_empty() {
                    return Err(crate::error::AppError::Doctor(format!(
                        "Configuration validation failed: pipeline.{}.depends_on contains empty string",
                        task_name
                    )));
                }
            }
        }

        Ok(())
    }
}

#[derive(Debug, Deserialize)]
#[serde(untagged)]
enum ExtendsField {
    One(String),
    Many(Vec<String>),
}

fn deserialize_extends<'de, D>(deserializer: D) -> Result<Vec<String>, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let value = Option::<ExtendsField>::deserialize(deserializer)?;
    Ok(match value {
        None => vec![],
        Some(ExtendsField::One(s)) => vec![s],
        Some(ExtendsField::Many(v)) => v,
    })
}

fn load_config_recursive(
    config_path: &Path,
    config_str: &str,
    visited: &mut std::collections::HashSet<PathBuf>,
) -> AppResult<WmoRepoConfig> {
    let canonical =
        std::fs::canonicalize(config_path).unwrap_or_else(|_| config_path.to_path_buf());
    if !visited.insert(canonical.clone()) {
        return Err(crate::error::AppError::Doctor(format!(
            "Configuration validation failed: circular extends detected at {}",
            canonical.display()
        )));
    }

    let current = serde_json::from_str::<WmoRepoConfig>(config_str)?;

    let base_dir = config_path.parent().unwrap_or_else(|| Path::new("."));
    let mut merged = WmoRepoConfig {
        schema: current.schema.clone(),
        extends: current.extends.clone(),
        remote_cache_url: None,
        workspaces: vec![],
        pipeline: HashMap::new(),
        projects: HashMap::new(),
        constraints: ConstraintsConfig::default(),
        plugins: vec![],
    };

    for ext in current.extends.clone() {
        let ext_path = base_dir.join(ext);
        if !ext_path.is_file() {
            return Err(crate::error::AppError::Doctor(format!(
                "Configuration validation failed: extends file not found: {}",
                ext_path.display()
            )));
        }
        let ext_str = std::fs::read_to_string(&ext_path)?;
        let ext_cfg = load_config_recursive(&ext_path, &ext_str, visited)?;
        merged = merge_configs(merged, ext_cfg);
    }

    // Then apply current on top
    merged = merge_configs(merged, current.clone());
    visited.remove(&canonical);
    Ok(merged)
}

fn merge_task_config(base: TaskConfig, overlay: TaskConfig) -> TaskConfig {
    TaskConfig {
        inputs: if overlay.inputs.is_empty() {
            base.inputs
        } else {
            overlay.inputs
        },
        outputs: if overlay.outputs.is_empty() {
            base.outputs
        } else {
            overlay.outputs
        },
        env: if overlay.env.is_empty() {
            base.env
        } else {
            overlay.env
        },
        depends_on: if overlay.depends_on.is_empty() {
            base.depends_on
        } else {
            overlay.depends_on
        },
    }
}

fn merge_project_config(base: ProjectConfig, overlay: ProjectConfig) -> ProjectConfig {
    ProjectConfig {
        tags: if overlay.tags.is_empty() {
            base.tags
        } else {
            overlay.tags
        },
    }
}

fn merge_configs(mut base: WmoRepoConfig, overlay: WmoRepoConfig) -> WmoRepoConfig {
    if overlay.schema.is_some() {
        base.schema = overlay.schema;
    }

    if overlay.remote_cache_url.is_some() {
        base.remote_cache_url = overlay.remote_cache_url;
    }

    if !overlay.workspaces.is_empty() {
        base.workspaces = overlay.workspaces;
    }

    // keep extends for debugging/inspection (current top-level already applied)
    base.extends = overlay.extends;

    for (k, v) in overlay.pipeline {
        base.pipeline
            .entry(k)
            .and_modify(|existing| {
                *existing = merge_task_config(existing.clone(), v.clone());
            })
            .or_insert(v);
    }

    for (k, v) in overlay.projects {
        base.projects
            .entry(k)
            .and_modify(|existing| {
                *existing = merge_project_config(existing.clone(), v.clone());
            })
            .or_insert(v);
    }

    if !overlay.constraints.deny.is_empty() {
        base.constraints = overlay.constraints;
    }

    if !overlay.plugins.is_empty() {
        base.plugins = overlay.plugins;
    }

    base
}

fn read_first_existing_config(files: &[&str]) -> AppResult<Option<(PathBuf, String)>> {
    for file in files {
        let path = PathBuf::from(file);
        if path.is_file() {
            return Ok(Some((path.clone(), std::fs::read_to_string(path)?)));
        }
    }
    Ok(None)
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

#[cfg(test)]
mod tests {
    use super::*;

    fn unique_temp_dir() -> std::path::PathBuf {
        let mut dir = std::env::temp_dir();
        let pid = std::process::id();
        let nanos = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_nanos();
        dir.push(format!("wmorepo-config-test-{}-{}", pid, nanos));
        dir
    }

    #[test]
    fn extends_merges_pipeline_and_overrides_workspaces() {
        let dir = unique_temp_dir();
        std::fs::create_dir_all(&dir).unwrap();

        let base = dir.join("base.json");
        let child = dir.join("child.json");

        std::fs::write(
            &base,
            r#"{
  "workspaces": ["packages/*"],
  "pipeline": {
    "build": { "outputs": ["dist/**"], "env": ["A"] }
  }
}"#,
        )
        .unwrap();

        std::fs::write(
            &child,
            r#"{
  "extends": "base.json",
  "workspaces": ["apps/*"],
  "pipeline": {
    "build": { "env": ["B"] }
  }
}"#,
        )
        .unwrap();

        let cfg_str = std::fs::read_to_string(&child).unwrap();
        let cfg =
            load_config_recursive(&child, &cfg_str, &mut std::collections::HashSet::new()).unwrap();

        assert_eq!(cfg.workspaces, vec!["apps/*".to_string()]);
        let build = cfg.pipeline.get("build").unwrap();
        assert_eq!(build.outputs, vec!["dist/**".to_string()]);
        assert_eq!(build.env, vec!["B".to_string()]);

        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn extends_cycle_is_rejected() {
        let dir = unique_temp_dir();
        std::fs::create_dir_all(&dir).unwrap();

        let a = dir.join("a.json");
        let b = dir.join("b.json");

        std::fs::write(
            &a,
            r#"{ "extends": "b.json", "workspaces": ["packages/*"] }"#,
        )
        .unwrap();
        std::fs::write(
            &b,
            r#"{ "extends": "a.json", "workspaces": ["packages/*"] }"#,
        )
        .unwrap();

        let cfg_str = std::fs::read_to_string(&a).unwrap();
        let err = load_config_recursive(&a, &cfg_str, &mut std::collections::HashSet::new())
            .err()
            .unwrap();

        match err {
            crate::error::AppError::Doctor(_) => {}
            other => panic!("unexpected error: {}", other),
        }

        let _ = std::fs::remove_dir_all(&dir);
    }
}
