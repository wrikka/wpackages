// Dependency graph utilities

use petgraph::{graph::DiGraph, Directed};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub mod incremental;

pub use incremental::*;

/// Dependency graph node
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphNode {
    pub id: String,
    pub name: String,
}

/// Dependency graph edge
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphEdge {
    pub from: String,
    pub to: String,
}

/// Dependency graph
pub type DependencyGraph = DiGraph<String, ()>;

/// Build dependency graph from workspaces
pub fn build_dependency_graph(
    workspaces: &[super::workspace::Workspace],
) -> (DependencyGraph, HashMap<String, petgraph::graph::NodeIndex>) {
    let mut graph = DependencyGraph::new();
    let mut node_map = HashMap::new();

    // Add a node for each workspace
    for ws in workspaces {
        let name = ws.package_json.name.clone();
        let node_index = graph.add_node(name.clone());
        node_map.insert(name, node_index);
    }

    // Add edges for dependencies
    for ws in workspaces {
        let from_node = *node_map.get(&ws.package_json.name).unwrap();

        for dep_name in ws.package_json.dependencies.keys() {
            if let Some(&to_node) = node_map.get(dep_name) {
                graph.add_edge(to_node, from_node, ());
            }
        }
    }

    (graph, node_map)
}

/// Build dependency graph from nodes and edges
pub fn build_graph(nodes: Vec<GraphNode>, edges: Vec<GraphEdge>) -> DependencyGraph {
    let mut graph = DependencyGraph::new();

    let mut node_map = HashMap::new();
    for node in &nodes {
        let idx = graph.add_node(node.id.clone());
        node_map.insert(&node.id, idx);
    }

    for edge in edges {
        if let (Some(&from_idx), Some(&to_idx)) = (node_map.get(&edge.from), node_map.get(&edge.to))
        {
            graph.add_edge(from_idx, to_idx, ());
        }
    }

    graph
}

/// Get topological order of nodes
pub fn topological_sort(graph: &DependencyGraph) -> Vec<String> {
    let mut sorted = Vec::new();
    let mut visited = std::collections::HashSet::new();

    for node in graph.node_indices() {
        if !visited.contains(&node.index()) {
            dfs_visit(graph, node, &mut visited, &mut sorted);
        }
    }

    sorted
}

fn dfs_visit(
    graph: &DependencyGraph,
    node: petgraph::graph::NodeIndex,
    visited: &mut std::collections::HashSet<usize>,
    sorted: &mut Vec<String>,
) {
    visited.insert(node.index());

    for neighbor in graph.neighbors(node) {
        if !visited.contains(&neighbor.index()) {
            dfs_visit(graph, neighbor, visited, sorted);
        }
    }

    sorted.push(graph[node].clone());
}
