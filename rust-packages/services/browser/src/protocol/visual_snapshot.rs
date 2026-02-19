use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BoundingBox {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VisualSnapshotNode {
    pub ref_id: String, // Correlates with the main snapshot
    pub description: String, // AI-generated description
    pub bounding_box: BoundingBox,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VisualSnapshotResponse {
    pub nodes: Vec<VisualSnapshotNode>,
}
