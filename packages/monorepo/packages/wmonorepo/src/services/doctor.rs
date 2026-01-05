use crate::config::WmoRepoConfig;
use crate::error::{AppError, AppResult};
use crate::types::workspace::Workspace;

fn check_workspace_circular_dependencies(workspaces: &[Workspace]) -> AppResult<()> {
    let (graph, _) = crate::components::graph::build_dependency_graph(workspaces);
    if petgraph::algo::is_cyclic_directed(&graph) {
        return Err(AppError::Doctor(
            "Doctor check failed: circular dependency detected in workspace package.json dependencies"
                .to_string(),
        ));
    }
    Ok(())
}

fn tag_for_workspace<'a>(config: &'a WmoRepoConfig, ws_name: &str) -> &'a [String] {
    config
        .projects
        .get(ws_name)
        .map(|p| p.tags.as_slice())
        .unwrap_or(&[])
}

fn check_dependency_constraints(config: &WmoRepoConfig, workspaces: &[Workspace]) -> AppResult<()> {
    if config.constraints.deny.is_empty() {
        return Ok(());
    }

    let ws_map: std::collections::HashMap<&str, &Workspace> = workspaces
        .iter()
        .map(|ws| (ws.package_json.name.as_str(), ws))
        .collect();

    for ws in workspaces {
        let from_tags = tag_for_workspace(config, &ws.package_json.name);
        for dep_name in ws.package_json.dependencies.keys() {
            let Some(dep_ws) = ws_map.get(dep_name.as_str()) else {
                continue;
            };

            let to_tags = tag_for_workspace(config, &dep_ws.package_json.name);
            for rule in &config.constraints.deny {
                let from_match = from_tags.iter().any(|t| t == &rule.from_tag);
                let to_match = to_tags.iter().any(|t| t == &rule.to_tag);
                if from_match && to_match {
                    return Err(AppError::Doctor(format!(
                        "Doctor check failed: constraint violation: '{}' (tag:{}) cannot depend on '{}' (tag:{})",
                        ws.package_json.name,
                        rule.from_tag,
                        dep_ws.package_json.name,
                        rule.to_tag
                    )));
                }
            }
        }
    }

    Ok(())
}

pub fn run_doctor_checks() -> AppResult<()> {
    println!("Checking configuration file...");
    let config = WmoRepoConfig::load()?;

    if config.workspaces.is_empty() {
        return Err(AppError::Doctor(
            "Configuration validation failed: 'workspaces' array cannot be empty.".to_string(),
        ));
    }

    println!("Configuration file looks good.");

    let workspaces =
        crate::app::workspace_discovery::discover_workspaces_from_config(&config.workspaces)?;
    check_workspace_circular_dependencies(&workspaces)?;
    check_dependency_constraints(&config, &workspaces)?;

    // TODO: Add more checks here, e.g.:
    // - Check for duplicate dependencies
    // - Check for unused dependencies
    // - Check for circular dependencies in package.json (not just task graph)

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::config::{
        ConstraintsConfig, DependencyConstraint, ProjectConfig, WmoRepoConfig,
    };
    use crate::types::workspace::{PackageJson, Workspace};
    use std::collections::HashMap;
    use std::path::PathBuf;

    fn ws(name: &str, deps: &[&str]) -> Workspace {
        let mut dependencies = HashMap::new();
        for d in deps {
            dependencies.insert(d.to_string(), "*".to_string());
        }
        Workspace {
            path: PathBuf::from("."),
            package_json: PackageJson {
                name: name.to_string(),
                dependencies,
                scripts: HashMap::new(),
            },
        }
    }

    #[test]
    fn detects_cycle_in_workspace_deps() {
        let workspaces = vec![ws("a", &["b"]), ws("b", &["a"])];
        let err = check_workspace_circular_dependencies(&workspaces)
            .err()
            .unwrap();
        match err {
            AppError::Doctor(_) => {}
            other => panic!("unexpected error: {}", other),
        }
    }

    #[test]
    fn detects_constraints_violation() {
        let workspaces = vec![ws("a", &["b"]), ws("b", &[])];

        let mut projects = HashMap::new();
        projects.insert(
            "a".to_string(),
            ProjectConfig {
                tags: vec!["frontend".to_string()],
            },
        );
        projects.insert(
            "b".to_string(),
            ProjectConfig {
                tags: vec!["backend".to_string()],
            },
        );

        let config = WmoRepoConfig {
            schema: None,
            extends: vec![],
            remote_cache_url: None,
            workspaces: vec![],
            pipeline: HashMap::new(),
            projects,
            constraints: ConstraintsConfig {
                deny: vec![DependencyConstraint {
                    from_tag: "frontend".to_string(),
                    to_tag: "backend".to_string(),
                }],
            },
            plugins: vec![],
        };

        let err = check_dependency_constraints(&config, &workspaces)
            .err()
            .unwrap();
        match err {
            AppError::Doctor(_) => {}
            other => panic!("unexpected error: {}", other),
        }
    }
}
