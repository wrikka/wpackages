//! # Branch Graph Refresh
//!
//! Logic for refreshing branch graph.

use crate::app::state::IdeState;
use git_graph::BranchGraph;
use git::types::RepoSummary;

pub fn refresh_graph(state: &mut IdeState, repo_root: &str) {
    let repo = RepoSummary {
        name: std::path::Path::new(repo_root)
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string(),
        root: repo_root.to_string(),
        is_bare: false,
    };

    let mut graph = BranchGraph::new(repo);
    if let Err(e) = graph.build() {
        state.set_error(format!("Failed to build graph: {}", e));
        return;
    }

    if let Err(e) = state.branch_graph.layout.apply(&mut graph) {
        state.set_error(format!("Failed to apply layout: {}", e));
        return;
    }

    state.branch_graph.graph = Some(graph);
    state.branch_graph.selected_node = None;
}
