use crate::error::AppResult;
use crate::types::config::{ConstraintsConfig, PluginConfig, TaskConfig, WmoRepoConfig};

pub fn validate_config(config: &WmoRepoConfig) -> AppResult<()> {
    if config.workspaces.is_empty() {
        return Err(crate::error::AppError::Doctor(
            "Configuration validation failed: 'workspaces' array cannot be empty.".to_string(),
        ));
    }

    for ext in &config.extends {
        if ext.trim().is_empty() {
            return Err(crate::error::AppError::Doctor(
                "Configuration validation failed: 'extends' cannot contain empty string"
                    .to_string(),
            ));
        }
    }

    for rule in &config.constraints.deny {
        if rule.from_tag.trim().is_empty() || rule.to_tag.trim().is_empty() {
            return Err(crate::error::AppError::Doctor(
                "Configuration validation failed: constraints.deny requires from_tag and to_tag"
                    .to_string(),
            ));
        }
    }

    for plugin in &config.plugins {
        if plugin.command.trim().is_empty() {
            return Err(crate::error::AppError::Doctor(
                "Configuration validation failed: plugins[].command cannot be empty".to_string(),
            ));
        }
    }

    for (task_name, task_config) in &config.pipeline {
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

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[test]
    fn test_validate_empty_workspaces() {
        let config = WmoRepoConfig {
            schema: None,
            extends: vec![],
            remote_cache_url: None,
            workspaces: vec![],
            pipeline: HashMap::new(),
            projects: HashMap::new(),
            constraints: ConstraintsConfig::default(),
            plugins: vec![],
        };

        let result = validate_config(&config);
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_empty_extends() {
        let config = WmoRepoConfig {
            schema: None,
            extends: vec!["".to_string()],
            remote_cache_url: None,
            workspaces: vec!["packages/*".to_string()],
            pipeline: HashMap::new(),
            projects: HashMap::new(),
            constraints: ConstraintsConfig::default(),
            plugins: vec![],
        };

        let result = validate_config(&config);
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_empty_plugin_command() {
        let config = WmoRepoConfig {
            schema: None,
            extends: vec![],
            remote_cache_url: None,
            workspaces: vec!["packages/*".to_string()],
            pipeline: HashMap::new(),
            projects: HashMap::new(),
            constraints: ConstraintsConfig::default(),
            plugins: vec![PluginConfig {
                command: "".to_string(),
                args: vec![],
                enabled: true,
            }],
        };

        let result = validate_config(&config);
        assert!(result.is_err());
    }
}
