use crate::types::config::{ConstraintsConfig, ProjectConfig, TaskConfig, WmoRepoConfig};

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
        retry_on_failure: overlay.retry_on_failure,
        max_retries: if overlay.max_retries == 2 {
            base.max_retries
        } else {
            overlay.max_retries
        },
        retry_delay_ms: if overlay.retry_delay_ms == 1000 {
            base.retry_delay_ms
        } else {
            overlay.retry_delay_ms
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

pub fn merge_configs(mut base: WmoRepoConfig, overlay: WmoRepoConfig) -> WmoRepoConfig {
    if overlay.schema.is_some() {
        base.schema = overlay.schema;
    }

    if overlay.remote_cache_url.is_some() {
        base.remote_cache_url = overlay.remote_cache_url;
    }

    if !overlay.workspaces.is_empty() {
        base.workspaces = overlay.workspaces;
    }

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

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[test]
    fn test_merge_task_config() {
        let base = TaskConfig {
            inputs: vec!["src/**".to_string()],
            outputs: vec!["dist/**".to_string()],
            env: vec!["NODE_ENV".to_string()],
            depends_on: vec!["^build".to_string()],
            retry_on_failure: false,
            max_retries: 2,
            retry_delay_ms: 1000,
        };

        let overlay = TaskConfig {
            inputs: vec![],
            outputs: vec!["build/**".to_string()],
            env: vec![],
            depends_on: vec![],
            retry_on_failure: true,
            max_retries: 3,
            retry_delay_ms: 2000,
        };

        let merged = merge_task_config(base, overlay);

        assert_eq!(merged.inputs, vec!["src/**".to_string()]);
        assert_eq!(merged.outputs, vec!["build/**".to_string()]);
        assert_eq!(merged.env, vec!["NODE_ENV".to_string()]);
        assert_eq!(merged.depends_on, vec!["^build".to_string()]);
        assert_eq!(merged.retry_on_failure, true);
        assert_eq!(merged.max_retries, 3);
        assert_eq!(merged.retry_delay_ms, 2000);
    }

    #[test]
    fn test_merge_configs() {
        let base = WmoRepoConfig {
            schema: None,
            extends: vec![],
            remote_cache_url: None,
            workspaces: vec!["packages/*".to_string()],
            pipeline: {
                let mut map = HashMap::new();
                map.insert(
                    "build".to_string(),
                    TaskConfig {
                        inputs: vec!["src/**".to_string()],
                        outputs: vec!["dist/**".to_string()],
                        ..Default::default()
                    },
                );
                map
            },
            projects: HashMap::new(),
            constraints: ConstraintsConfig::default(),
            plugins: vec![],
        };

        let overlay = WmoRepoConfig {
            schema: Some("https://example.com/schema.json".to_string()),
            extends: vec!["base.json".to_string()],
            remote_cache_url: Some("https://cache.example.com".to_string()),
            workspaces: vec![],
            pipeline: {
                let mut map = HashMap::new();
                map.insert(
                    "test".to_string(),
                    TaskConfig {
                        inputs: vec!["test/**".to_string()],
                        outputs: vec!["coverage/**".to_string()],
                        ..Default::default()
                    },
                );
                map
            },
            projects: HashMap::new(),
            constraints: ConstraintsConfig::default(),
            plugins: vec![],
        };

        let merged = merge_configs(base, overlay);

        assert_eq!(
            merged.schema,
            Some("https://example.com/schema.json".to_string())
        );
        assert_eq!(
            merged.remote_cache_url,
            Some("https://cache.example.com".to_string())
        );
        assert_eq!(merged.workspaces, vec!["packages/*".to_string()]);
        assert_eq!(merged.pipeline.len(), 2);
        assert!(merged.pipeline.contains_key("build"));
        assert!(merged.pipeline.contains_key("test"));
    }
}
