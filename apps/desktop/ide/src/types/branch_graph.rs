use serde::{Deserialize, Serialize};
use git_graph::{BranchGraph, GraphNode, GraphLayout, GraphRenderer};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BranchGraphState {
    pub graph: Option<BranchGraph>,
    pub layout: GraphLayout,
    pub renderer: GraphRenderer,
    pub offset: (f32, f32),
    pub zoom: f32,
    pub selected_node: Option<String>,
    pub show_branches: bool,
    pub show_tags: bool,
    pub show_commits: bool,
    pub max_commits: usize,
}

impl Default for BranchGraphState {
    fn default() -> Self {
        Self {
            graph: None,
            layout: GraphLayout::default(),
            renderer: GraphRenderer::default(),
            offset: (20.0, 20.0),
            zoom: 1.0,
            selected_node: None,
            show_branches: true,
            show_tags: true,
            show_commits: true,
            max_commits: 100,
        }
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum GraphViewMode {
    Compact,
    Detailed,
    Timeline,
}
