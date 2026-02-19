use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DependencyNode {
    pub id: String,
    pub name: String,
    pub node_type: NodeType,
    pub file_path: String,
    pub line_number: usize,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum NodeType {
    Function,
    Class,
    Module,
    Variable,
    Interface,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DependencyEdge {
    pub from: String,
    pub to: String,
    pub edge_type: EdgeType,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum EdgeType {
    Calls,
    Inherits,
    Implements,
    Imports,
    Uses,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DependencyGraph {
    pub nodes: Vec<DependencyNode>,
    pub edges: Vec<DependencyEdge>,
}

#[derive(Debug, Clone, Default)]
pub struct DependencyGraphState {
    pub graph: Option<DependencyGraph>,
    pub selected_node: Option<String>,
    pub layout: GraphLayout,
    pub show_labels: bool,
    pub filter_types: HashSet<NodeType>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum GraphLayout {
    Hierarchical,
    ForceDirected,
    Circular,
    Tree,
}

impl DependencyGraphState {
    pub fn new() -> Self {
        Self {
            graph: None,
            selected_node: None,
            layout: GraphLayout::Hierarchical,
            show_labels: true,
            filter_types: HashSet::new(),
        }
    }

    pub fn build_graph(&mut self, nodes: Vec<DependencyNode>, edges: Vec<DependencyEdge>) {
        self.graph = Some(DependencyGraph { nodes, edges });
    }

    pub fn select_node(&mut self, node_id: String) {
        self.selected_node = Some(node_id);
    }

    pub fn get_dependencies(&self, node_id: &str) -> Vec<&DependencyEdge> {
        if let Some(graph) = &self.graph {
            graph.edges.iter()
                .filter(|e| e.from == node_id)
                .collect()
        } else {
            Vec::new()
        }
    }

    pub fn get_dependents(&self, node_id: &str) -> Vec<&DependencyEdge> {
        if let Some(graph) = &self.graph {
            graph.edges.iter()
                .filter(|e| e.to == node_id)
                .collect()
        } else {
            Vec::new()
        }
    }

    pub fn toggle_filter(&mut self, node_type: NodeType) {
        if self.filter_types.contains(&node_type) {
            self.filter_types.remove(&node_type);
        } else {
            self.filter_types.insert(node_type);
        }
    }

    pub fn clear_graph(&mut self) {
        self.graph = None;
        self.selected_node = None;
    }
}
