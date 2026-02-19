//! types/snapshot.rs

use serde::{de::DeserializeOwned, Serialize};
use std::error::Error;

/// An error type for snapshot operations.
#[derive(Debug, thiserror::Error)]
pub enum SnapshotError {
    #[error("Serialization failed: {0}")]
    Serialization(#[from] serde_json::Error),
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),
}

/// A trait for components that can be saved to and restored from a snapshot.
pub trait Snapshot: Serialize + DeserializeOwned {
    /// Saves the component's state to a byte vector.
    fn save_snapshot(&self) -> Result<Vec<u8>, SnapshotError> {
        Ok(serde_json::to_vec(self)?)
    }

    /// Loads the component's state from a byte slice.
    fn load_from_snapshot(data: &[u8]) -> Result<Self, SnapshotError> {
        Ok(serde_json::from_slice(data)?)
    }
}
