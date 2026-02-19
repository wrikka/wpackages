use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElementNode {
    pub reference: String,
    pub tag_name: String,
    pub attributes: HashMap<String, String>,
    pub text_content: String,
    pub bounding_box: BoundingBox,
    pub children: Vec<String>,
    pub parents: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BoundingBox {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElementGraph {
    pub nodes: HashMap<String, ElementNode>,
    pub edges: Vec<ElementEdge>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElementEdge {
    pub from: String,
    pub to: String,
    pub relationship: ElementRelationship,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ElementRelationship {
    Parent,
    Child,
    Sibling,
    Contains,
    Adjacent,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElementPath {
    pub nodes: Vec<String>,
    pub distance: u32,
    pub relationship_chain: Vec<ElementRelationship>,
}

#[derive(Debug, Clone)]
pub struct ElementRelationshipGraph {
    graph: ElementGraph,
}

impl ElementRelationshipGraph {
    pub fn new() -> Self {
        Self {
            graph: ElementGraph {
                nodes: HashMap::new(),
                edges: Vec::new(),
            },
        }
    }

    pub fn add_element(&mut self, element: ElementNode) {
        let reference = element.reference.clone();
        self.graph.nodes.insert(reference, element);
    }

    pub fn build_relationships(&mut self) {
        let refs: Vec<String> = self.graph.nodes.keys().cloned().collect();
        
        for ref_id in &refs {
            if let Some(node) = self.graph.nodes.get(ref_id).cloned() {
                for child_ref in &node.children {
                    if self.graph.nodes.contains_key(child_ref) {
                        self.graph.edges.push(ElementEdge {
                            from: ref_id.clone(),
                            to: child_ref.clone(),
                            relationship: ElementRelationship::Parent,
                        });
                        self.graph.edges.push(ElementEdge {
                            from: child_ref.clone(),
                            to: ref_id.clone(),
                            relationship: ElementRelationship::Child,
                        });
                    }
                }
            }
        }

        self.detect_siblings();
        self.detect_adjacent();
    }

    fn detect_siblings(&mut self) {
        let parent_child_map: HashMap<String, Vec<String>> = self.graph.nodes.iter()
            .map(|(ref_id, node)| (ref_id.clone(), node.children.clone()))
            .collect();

        for (_parent, children) in parent_child_map {
            for i in 0..children.len() {
                for j in (i + 1)..children.len() {
                    self.graph.edges.push(ElementEdge {
                        from: children[i].clone(),
                        to: children[j].clone(),
                        relationship: ElementRelationship::Sibling,
                    });
                    self.graph.edges.push(ElementEdge {
                        from: children[j].clone(),
                        to: children[i].clone(),
                        relationship: ElementRelationship::Sibling,
                    });
                }
            }
        }
    }

    fn detect_adjacent(&mut self) {
        let mut sorted_nodes: Vec<(&String, &ElementNode)> = self.graph.nodes.iter().collect();
        sorted_nodes.sort_by(|a, b| {
            let y_cmp = a.1.bounding_box.y.partial_cmp(&b.1.bounding_box.y).unwrap();
            if y_cmp == std::cmp::Ordering::Equal {
                a.1.bounding_box.x.partial_cmp(&b.1.bounding_box.x).unwrap()
            } else {
                y_cmp
            }
        });

        for i in 0..sorted_nodes.len().saturating_sub(1) {
            let ref1 = sorted_nodes[i].0.clone();
            let ref2 = sorted_nodes[i + 1].0.clone();
            
            let box1 = &sorted_nodes[i].1.bounding_box;
            let box2 = &sorted_nodes[i + 1].1.bounding_box;
            
            let y_diff = (box1.y - box2.y).abs();
            let x_diff = (box1.x - box2.x).abs();
            
            if y_diff < 50.0 || x_diff < 50.0 {
                self.graph.edges.push(ElementEdge {
                    from: ref1,
                    to: ref2,
                    relationship: ElementRelationship::Adjacent,
                });
            }
        }
    }

    pub fn find_path(&self, from_ref: &str, to_ref: &str) -> Option<ElementPath> {
        if !self.graph.nodes.contains_key(from_ref) || !self.graph.nodes.contains_key(to_ref) {
            return None;
        }

        let mut visited: HashSet<String> = HashSet::new();
        let mut queue: Vec<(String, Vec<String>, Vec<ElementRelationship>)> = vec![
            (from_ref.to_string(), vec![from_ref.to_string()], vec![])
        ];

        while let Some((current, path, relationships)) = queue.pop() {
            if current == to_ref {
                return Some(ElementPath {
                    nodes: path,
                    distance: relationships.len() as u32,
                    relationship_chain: relationships,
                });
            }

            if visited.contains(&current) {
                continue;
            }
            visited.insert(current.clone());

            for edge in &self.graph.edges {
                if edge.from == current && !visited.contains(&edge.to) {
                    let mut new_path = path.clone();
                    new_path.push(edge.to.clone());
                    let mut new_rels = relationships.clone();
                    new_rels.push(edge.relationship.clone());
                    queue.push((edge.to.clone(), new_path, new_rels));
                }
            }
        }

        None
    }

    pub fn get_related_elements(&self, ref_id: &str, max_depth: u32) -> Vec<(String, ElementRelationship, u32)> {
        let mut related = Vec::new();
        let mut visited: HashSet<String> = HashSet::new();
        let mut queue: Vec<(String, u32)> = vec![(ref_id.to_string(), 0)];

        while let Some((current, depth)) = queue.pop() {
            if depth > max_depth || visited.contains(&current) {
                continue;
            }
            visited.insert(current.clone());

            for edge in &self.graph.edges {
                if edge.from == current && !visited.contains(&edge.to) {
                    if edge.to != ref_id {
                        related.push((edge.to.clone(), edge.relationship.clone(), depth + 1));
                    }
                    queue.push((edge.to.clone(), depth + 1));
                }
            }
        }

        related
    }

    pub fn find_similar_elements(&self, ref_id: &str) -> Vec<String> {
        let target = match self.graph.nodes.get(ref_id) {
            Some(n) => n,
            None => return Vec::new(),
        };

        self.graph.nodes.iter()
            .filter(|(r, n)| {
                *r != ref_id 
                    && n.tag_name == target.tag_name
                    && self.calculate_similarity(target, n) > 0.7
            })
            .map(|(r, _)| r.clone())
            .collect()
    }

    fn calculate_similarity(&self, node1: &ElementNode, node2: &ElementNode) -> f64 {
        let mut score = 0.0;
        let mut total = 0.0;

        let text_weight = 0.3;
        let attr_weight = 0.4;
        let pos_weight = 0.3;

        let text_sim = if node1.text_content == node2.text_content {
            1.0
        } else {
            0.0
        };
        score += text_sim * text_weight;
        total += text_weight;

        let common_attrs: Vec<_> = node1.attributes.keys()
            .filter(|k| node2.attributes.get(*k) == node1.attributes.get(*k))
            .collect();
        let attr_sim = if !node1.attributes.is_empty() {
            common_attrs.len() as f64 / node1.attributes.len().max(node2.attributes.len()) as f64
        } else {
            1.0
        };
        score += attr_sim * attr_weight;
        total += attr_weight;

        let x_diff = (node1.bounding_box.x - node2.bounding_box.x).abs();
        let y_diff = (node1.bounding_box.y - node2.bounding_box.y).abs();
        let pos_sim = 1.0 - ((x_diff + y_diff) / 1000.0).min(1.0);
        score += pos_sim * pos_weight;
        total += pos_weight;

        score / total
    }

    pub fn export_to_dot(&self) -> String {
        let mut dot = String::from("digraph ElementGraph {\n");
        dot.push_str("  node [shape=box, style=rounded];\n\n");

        for (ref_id, node) in &self.graph.nodes {
            let label = format!("{}\\n{}", node.tag_name, 
                if node.text_content.len() > 20 {
                    format!("{}...", &node.text_content[..20])
                } else {
                    node.text_content.clone()
                });
            dot.push_str(&format!("  \"{}\" [label=\"{}\"];\n", ref_id, label));
        }

        dot.push_str("\n");

        for edge in &self.graph.edges {
            let color = match edge.relationship {
                ElementRelationship::Parent => "blue",
                ElementRelationship::Child => "green",
                ElementRelationship::Sibling => "orange",
                ElementRelationship::Adjacent => "gray",
                _ => "black",
            };
            dot.push_str(&format!(
                "  \"{}\" -> \"{}\" [color={}, label=\"{:?}\"];\n",
                edge.from, edge.to, color, edge.relationship
            ));
        }

        dot.push_str("}\n");
        dot
    }
}
