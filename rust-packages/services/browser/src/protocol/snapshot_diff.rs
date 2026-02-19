use serde::{Deserialize, Serialize};
use crate::protocol::SnapshotNode;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SnapshotDiff {
    pub added: Vec<SnapshotNode>,
    pub removed: Vec<SnapshotNode>,
}
