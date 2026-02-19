// Incremental graph updates

use petgraph::graph::{DiGraph, NodeIndex};
use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Graph change event
#[derive(Debug, Clone)]
pub enum GraphChange {
    NodeAdded(String),
    NodeRemoved(String),
    EdgeAdded { from: String, to: String },
    EdgeRemoved { from: String, to: String },
}

/// Incremental graph update manager
pub struct IncrementalGraphManager {
    graph: Arc<RwLock<DiGraph<String, ()>>>,
    node_map: Arc<RwLock<HashMap<String, NodeIndex>>>,
    changes: Arc<RwLock<Vec<GraphChange>>>,
}

impl IncrementalGraphManager {
    pub fn new() -> Self {
        IncrementalGraphManager {
            graph: Arc::new(RwLock::new(DiGraph::new())),
            node_map: Arc::new(RwLock::new(HashMap::new())),
            changes: Arc::new(RwLock::new(Vec::new())),
        }
    }

    /// Add node incrementally
    pub async fn add_node(&self, node_id: String) -> Result<(), Box<dyn std::error::Error>> {
        let mut graph = self.graph.write().await;
        let mut node_map = self.node_map.write().await;
        let mut changes = self.changes.write().await;

        if node_map.contains_key(&node_id) {
            return Ok(());
        }

        let idx = graph.add_node(node_id.clone());
        node_map.insert(node_id.clone(), idx);
        changes.push(GraphChange::NodeAdded(node_id));

        Ok(())
    }

    /// Remove node incrementally
    pub async fn remove_node(&self, node_id: String) -> Result<(), Box<dyn std::error::Error>> {
        let mut graph = self.graph.write().await;
        let mut node_map = self.node_map.write().await;
        let mut changes = self.changes.write().await;

        if let Some(idx) = node_map.remove(&node_id) {
            graph.remove_node(idx);
            changes.push(GraphChange::NodeRemoved(node_id));
        }

        Ok(())
    }

    /// Add edge incrementally
    pub async fn add_edge(
        &self,
        from: String,
        to: String,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let mut graph = self.graph.write().await;
        let mut node_map = self.node_map.write().await;
        let mut changes = self.changes.write().await;

        let from_idx = *node_map.get(&from).ok_or("Node not found")?;
        let to_idx = *node_map.get(&to).ok_or("Node not found")?;

        // Check if edge already exists
        if graph.find_edge(from_idx, to_idx).is_some() {
            return Ok(());
        }

        graph.add_edge(from_idx, to_idx, ());
        changes.push(GraphChange::EdgeAdded { from, to });

        Ok(())
    }

    /// Remove edge incrementally
    pub async fn remove_edge(
        &self,
        from: String,
        to: String,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let mut graph = self.graph.write().await;
        let mut node_map = self.node_map.read().await;
        let mut changes = self.changes.write().await;

        let from_idx = *node_map.get(&from).ok_or("Node not found")?;
        let to_idx = *node_map.get(&to).ok_or("Node not found")?;

        if let Some(edge) = graph.find_edge(from_idx, to_idx) {
            graph.remove_edge(edge);
            changes.push(GraphChange::EdgeRemoved { from, to });
        }

        Ok(())
    }

    /// Get affected nodes after changes
    pub async fn get_affected_nodes(&self) -> Result<HashSet<String>, Box<dyn std::error::Error>> {
        let graph = self.graph.read().await;
        let changes = self.changes.read().await;

        let mut affected = HashSet::new();

        for change in changes.iter() {
            match change {
                GraphChange::NodeAdded(node_id) => {
                    affected.insert(node_id.clone());
                }
                GraphChange::NodeRemoved(node_id) => {
                    affected.insert(node_id.clone());
                }
                GraphChange::EdgeAdded { from, to } => {
                    affected.insert(from.clone());
                    affected.insert(to.clone());
                }
                GraphChange::EdgeRemoved { from, to } => {
                    affected.insert(from.clone());
                    affected.insert(to.clone());
                }
            }
        }

        // Add all downstream nodes
        let mut to_process: Vec<String> = affected.iter().cloned().collect();
        let node_map = self.node_map.read().await;

        while let Some(node_id) = to_process.pop() {
            if let Some(&idx) = node_map.get(&node_id) {
                for neighbor in graph.neighbors(idx) {
                    let neighbor_id = graph[neighbor].clone();
                    if affected.insert(neighbor_id.clone()) {
                        to_process.push(neighbor_id);
                    }
                }
            }
        }

        Ok(affected)
    }

    /// Clear changes
    pub async fn clear_changes(&self) {
        let mut changes = self.changes.write().await;
        changes.clear();
    }

    /// Get current graph
    pub async fn get_graph(&self) -> DiGraph<String, ()> {
        let graph = self.graph.read().await;
        graph.clone()
    }

    /// Get node map
    pub async fn get_node_map(&self) -> HashMap<String, NodeIndex> {
        let node_map = self.node_map.read().await;
        node_map.clone()
    }

    /// Get changes
    pub async fn get_changes(&self) -> Vec<GraphChange> {
        let changes = self.changes.read().await;
        changes.clone()
    }
}

impl Default for IncrementalGraphManager {
    fn default() -> Self {
        Self::new()
    }
}

/// Graph diff result
#[derive(Debug, Clone)]
pub struct GraphDiff {
    pub added_nodes: Vec<String>,
    pub removed_nodes: Vec<String>,
    pub added_edges: Vec<(String, String)>,
    pub removed_edges: Vec<(String, String)>,
}

/// Compare two graphs
pub fn diff_graphs(
    old_graph: &DiGraph<String, ()>,
    old_node_map: &HashMap<String, NodeIndex>,
    new_graph: &DiGraph<String, ()>,
    new_node_map: &HashMap<String, NodeIndex>,
) -> GraphDiff {
    let mut added_nodes = Vec::new();
    let mut removed_nodes = Vec::new();
    let mut added_edges = Vec::new();
    let mut removed_edges = Vec::new();

    // Find added/removed nodes
    for node_id in new_node_map.keys() {
        if !old_node_map.contains_key(node_id) {
            added_nodes.push(node_id.clone());
        }
    }

    for node_id in old_node_map.keys() {
        if !new_node_map.contains_key(node_id) {
            removed_nodes.push(node_id.clone());
        }
    }

    // Find added/removed edges
    for edge in new_graph.edge_indices() {
        let (from, to) = new_graph.edge_endpoints(edge).unwrap();
        let from_id = new_graph[from].clone();
        let to_id = new_graph[to].clone();

        if let Some(&old_from_idx) = old_node_map.get(&from_id) {
            if let Some(&old_to_idx) = old_node_map.get(&to_id) {
                if old_graph.find_edge(old_from_idx, old_to_idx).is_none() {
                    added_edges.push((from_id, to_id));
                }
            }
        }
    }

    for edge in old_graph.edge_indices() {
        let (from, to) = old_graph.edge_endpoints(edge).unwrap();
        let from_id = old_graph[from].clone();
        let to_id = old_graph[to].clone();

        if let Some(&new_from_idx) = new_node_map.get(&from_id) {
            if let Some(&new_to_idx) = new_node_map.get(&to_id) {
                if new_graph.find_edge(new_from_idx, new_to_idx).is_none() {
                    removed_edges.push((from_id, to_id));
                }
            }
        }
    }

    GraphDiff {
        added_nodes,
        removed_nodes,
        added_edges,
        removed_edges,
    }
}
