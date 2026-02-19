//! services/snapshot_manager.rs

use crate::types::snapshot::{Snapshot, SnapshotError};
use std::path::{Path, PathBuf};
use tokio::fs;

/// Manages saving and loading of agent state snapshots to the file system.
#[derive(Clone)]
pub struct SnapshotManager {
    snapshot_dir: PathBuf,
}

impl SnapshotManager {
    /// Creates a new `SnapshotManager` that will store snapshots in the given directory.
    pub fn new(snapshot_dir: impl AsRef<Path>) -> Self {
        Self { snapshot_dir: snapshot_dir.as_ref().to_path_buf() }
    }

    /// Saves a snapshot of a component to a file.
    pub async fn save_snapshot<S: Snapshot>(
        &self,
        component_name: &str,
        component: &S,
    ) -> Result<(), SnapshotError> {
        let data = component.save_snapshot()?;
        let path = self.snapshot_dir.join(format!("{}.json", component_name));
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).await?;
        }
        fs::write(path, data).await?;
        Ok(())
    }

    /// Loads a component's state from a snapshot file.
    pub async fn load_snapshot<S: Snapshot>(
        &self,
        component_name: &str,
    ) -> Result<S, SnapshotError> {
        let path = self.snapshot_dir.join(format!("{}.json", component_name));
        let data = fs::read(path).await?;
        S::load_from_snapshot(&data)
    }
}
