//! A pure component for resolving the dependency order of extensions.

//! A pure component for resolving the dependency order of extensions.

use crate::error::{AppError, Result};
use crate::types::manifest::ExtensionManifest;
use crate::types::ExtensionId;
use std::collections::HashMap;
use topological_sort::TopologicalSort;

/// Sorts a list of extension manifests based on their dependencies.
///
/// Returns a `Vec<ExtensionId>` in the order they should be loaded/activated.
pub fn resolve_dependencies(manifests: &[&ExtensionManifest]) -> Result<Vec<ExtensionId>> {
    let mut ts = TopologicalSort::<ExtensionId>::new();
    let manifest_map: HashMap<_, _> = manifests.iter().map(|m| (m.id.clone(), *m)).collect();

    for manifest in manifests {
        ts.insert(manifest.id.clone());
        if let Some(dependencies) = &manifest.dependencies {
            for dep_id in dependencies {
                if !manifest_map.contains_key(dep_id) {
                    return Err(AppError::DependencyNotFound {
                        extension_name: manifest.id.to_string(),
                        dependency_name: dep_id.to_string(),
                    });
                }
                ts.add_dependency(dep_id.clone(), manifest.id.clone());
            }
        }
    }

    let mut sorted: Vec<ExtensionId> = Vec::new();
    loop {
        let mut popped = ts.pop_all();
        if popped.is_empty() {
            if !ts.is_empty() {
                // If there are still items in the sort, we have a cycle.
                let remaining = ts.next().unwrap();
                return Err(AppError::CyclicDependency(remaining.to_string()));
            } else {
                break; // All done
            }
        }
        popped.sort(); // For deterministic order
        sorted.append(&mut popped);
    }

    Ok(sorted)
}
