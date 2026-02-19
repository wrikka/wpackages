use napi_derive::napi;
use serde::{Deserialize, Serialize};

#[napi]
#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
pub enum SplitDirection {
    Horizontal,
    Vertical,
}

#[napi(object)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SplitNode {
    pub id: u32,
    pub direction: SplitDirection,
    pub children: Vec<Node>,
    pub sizes: Vec<f64>,
}

#[napi(object)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LeafNode {
    pub id: u32,
    pub session_id: u32,
}

#[napi]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Node {
    Split(SplitNode),
    Leaf(LeafNode),
}

#[napi(object)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TabLayout {
    pub tab_id: u32,
    pub root: Node,
    pub active_pane_id: u32,
}
