use crate::types::workspace::Workspace;
use petgraph::graph::{DiGraph, NodeIndex};
use std::collections::HashMap;

pub fn build_dependency_graph(workspaces: &[Workspace]) -> (DiGraph<String, ()>, HashMap<String, NodeIndex>) {
    let mut graph = DiGraph::new();
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
