use crate::error::{Error, Result};
use crate::protocol::SnapshotNode;
use chromiumoxide::cdp::browser_protocol::accessibility::{AxNode, AxProperty, AxValue};
use chromiumoxide::Page;
use serde_json::json;
use std::collections::{HashMap, HashSet};

pub struct SnapshotBuilder {
    ref_counter: usize,
    ignorable_roles: HashSet<String>,
}

impl SnapshotBuilder {
    pub fn new() -> Self {
        let ignorable_roles = [
            "StaticText", "generic", "RootWebArea", "img", "paragraph", 
            "listitem", "list", "div", "none", "presentational"
        ]
        .iter()
        .map(|s| s.to_string())
        .collect();

        Self { 
            ref_counter: 0,
            ignorable_roles,
        }
    }

    pub async fn build(&mut self, page: &Page) -> Result<Vec<SnapshotNode>> {
        self.reset();
        let nodes = page.accessibility_snapshot().await.map_err(Error::Chromium)?.ok_or_else(|| Error::Other("Failed to get accessibility snapshot".to_string()))?;
        let mut result = Vec::new();
        self.traverse_nodes(&nodes, &mut result, 0);
        Ok(result)
    }

    fn traverse_nodes(&mut self, nodes: &[AxNode], result: &mut Vec<SnapshotNode>, depth: usize) {
        for node in nodes {
            let role = self.get_value(&node.role).unwrap_or_default();
            if self.is_ignorable(&role) { continue; }

            let name = self.get_value_as_string(&node.name);
            let description = self.get_value_as_string(&node.description);
            let attributes = self.get_attributes(node.properties.as_ref());

            self.ref_counter += 1;
            let ref_id = format!("@e{}", self.ref_counter);

            result.push(SnapshotNode {
                ref_id,
                backend_dom_node_id: node.backend_dom_node_id,
                role,
                name,
                description,
                attributes,
            });

            if let Some(children) = &node.children {
                self.traverse_nodes(children, result, depth + 1);
            }
        }
    }

    fn get_value_as_string(&self, value: &Option<AxValue>) -> Option<String> {
        value.as_ref().and_then(|v| v.value.as_ref().map(|val| val.to_string()))
    }

    fn get_attributes(&self, properties: Option<&Vec<AxProperty>>) -> Option<serde_json::Value> {
        let props = properties?;
        if props.is_empty() {
            return None;
        }
        let mut attrs = HashMap::new();
        for prop in props {
            if let Some(val) = self.get_value_as_string(&Some(prop.value.clone())) {
                attrs.insert(prop.name.to_string(), json!(val));
            }
        }
        if attrs.is_empty() { None } else { Some(json!(attrs)) }
    }

    fn is_ignorable(&self, role: &str) -> bool {
        self.ignorable_roles.contains(role)
    }

    pub fn reset(&mut self) {
        self.ref_counter = 0;
    }
}

impl Default for SnapshotBuilder {
    fn default() -> Self {
        Self::new()
    }
}
