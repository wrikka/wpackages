//! Concrete implementation for the `ExtensionRegistry` service.

use super::ExtensionRegistry;
use crate::error::{AppError, AppResult};
use crate::types::{DynExtension, ExtensionId};
use async_trait::async_trait;
use std::collections::HashMap;
use topological_sort::TopologicalSort;
use tracing::info;

#[derive(Default)]
pub struct DefaultExtensionRegistry {
    extensions: HashMap<ExtensionId, DynExtension>,
    sorted_extensions: Vec<ExtensionId>,
}

impl DefaultExtensionRegistry {
    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait]
impl ExtensionRegistry for DefaultExtensionRegistry {
    fn register_all(&mut self, extensions: Vec<DynExtension>) -> AppResult<()> {
        for ext in extensions {
            let id = ext.manifest().id.clone();
            self.extensions.insert(id, ext);
        }
        self.sort_extensions()?;
        Ok(())
    }

    async fn activate_all(&self) {
        info!("Activating all extensions...");
        for id in &self.sorted_extensions {
            if let Some(ext) = self.extensions.get(id) {
                info!(extension_id = %id, "Activating extension");
                ext.activate().await;
            }
        }
    }

    async fn deactivate_all(&self) {
        info!("Deactivating all extensions...");
        for id in self.sorted_extensions.iter().rev() {
            if let Some(ext) = self.extensions.get(id) {
                info!(extension_id = %id, "Deactivating extension");
                ext.deactivate().await;
            }
        }
    }

    fn get(&self, id: &ExtensionId) -> Option<DynExtension> {
        self.extensions.get(id).cloned()
    }

    fn get_all(&self) -> HashMap<ExtensionId, DynExtension> {
        self.extensions.clone()
    }
}

impl DefaultExtensionRegistry {
    /// Sorts the extensions based on their dependencies.
    fn sort_extensions(&mut self) -> AppResult<()> {
        let mut ts = TopologicalSort::<ExtensionId>::new();

        for (id, ext) in &self.extensions {
            ts.insert(id.clone());
            for dep in &ext.manifest().dependencies {
                if !self.extensions.contains_key(dep) {
                    return Err(AppError::DependencyNotFound(dep.clone(), id.clone()));
                }
                ts.add_dependency(dep.clone(), id.clone());
            }
        }

        let mut sorted = Vec::new();
        loop {
            let mut popped = ts.pop_all();
            if popped.is_empty() {
                if !ts.is_empty() {
                    // If there are still items in the sort, we have a cycle.
                    let remaining = ts.into_iter().next().unwrap();
                    return Err(AppError::CircularDependency(remaining));
                } else {
                    break; // All done
                }
            }
            popped.sort(); // For deterministic order
            sorted.append(&mut popped);
        }

        self.sorted_extensions = sorted;
        Ok(())
    }
}

