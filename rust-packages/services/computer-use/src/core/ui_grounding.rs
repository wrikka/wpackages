//! Feature 4: Intelligent UI Grounding
//! 
//! Links visual elements to appropriate actions, identifies element hierarchy
//! and relationships, understands layout patterns and design conventions.

use anyhow::Result;
use thiserror::Error;
use std::collections::HashMap;
use crate::types::{BoundingBox, UIElement};

#[derive(Debug, Error)]
pub enum UIGroundingError {
    #[error("Failed to ground UI element")]
    GroundingFailed,
    #[error("Failed to identify hierarchy")]
    HierarchyError,
    #[error("Failed to detect layout pattern")]
    PatternDetectionFailed,
}

/// UI Grounding system
pub struct UIGroundingSystem {
    element_map: HashMap<String, UIElement>,
    hierarchy: HashMap<String, Vec<String>>,
}

impl UIGroundingSystem {
    pub fn new() -> Self {
        Self {
            element_map: HashMap::new(),
            hierarchy: HashMap::new(),
        }
    }

    /// Ground visual elements to actions
    pub fn ground_elements(&mut self, elements: Vec<DetectedElement>) -> Result<Vec<GroundedElement>> {
        let mut grounded = vec![];

        for element in elements {
            let grounded_element = GroundedElement {
                id: element.id.clone(),
                element_type: element.element_type.clone(),
                bounds: element.bounds,
                actions: self.suggest_actions(&element.element_type),
                confidence: 0.9,
            };

            self.element_map.insert(element.id.clone(), grounded_element.clone());
            grounded.push(grounded_element);
        }

        Ok(grounded)
    }

    /// Identify element hierarchy
    pub fn identify_hierarchy(&mut self) -> Result<HierarchyTree> {
        // Mock implementation of hierarchy identification based on bounding boxes.
        // A real implementation would be more complex.
        let mut children: HashMap<String, Vec<String>> = HashMap::new();
        let element_ids: Vec<String> = self.elements.iter().map(|e| e.id.clone()).collect();

        for (i, elem1) in self.elements.iter().enumerate() {
            for (j, elem2) in self.elements.iter().enumerate() {
                if i == j { continue; }

                // A simple containment check
                if elem2.bounds.x > elem1.bounds.x &&
                   elem2.bounds.y > elem1.bounds.y &&
                   (elem2.bounds.x + elem2.bounds.width) < (elem1.bounds.x + elem1.bounds.width) &&
                   (elem2.bounds.y + elem2.bounds.height) < (elem1.bounds.y + elem1.bounds.height) {
                    children.entry(elem1.id.clone()).or_default().push(elem2.id.clone());
                }
            }
        }

        // Find root elements (those not a child of any other element)
        let mut child_nodes: std::collections::HashSet<String> = children.values().flatten().cloned().collect();
        let root_nodes: Vec<String> = element_ids.into_iter().filter(|id| !child_nodes.contains(id)).collect();

        // For simplicity, we'll just take the first root node.
        let root = root_nodes.get(0).cloned().unwrap_or_else(|| "root".to_string());

        Ok(HierarchyTree {
            root,
            children,
        })
    }

    /// Understand layout patterns
    pub fn detect_patterns(&self) -> Result<Vec<LayoutPattern>> {
        // Mock implementation for detecting simple alignment patterns.
        let mut patterns = vec![];
        if self.elements.len() < 2 { return Ok(patterns); }

        // Check for horizontal alignment (e.g., a toolbar)
        let first_y = self.elements[0].bounds.y;
        if self.elements.iter().all(|e| (e.bounds.y as i32 - first_y as i32).abs() < 10) {
            patterns.push(LayoutPattern::Horizontal);
        }

        // Check for vertical alignment (e.g., a sidebar menu)
        let first_x = self.elements[0].bounds.x;
        if self.elements.iter().all(|e| (e.bounds.x as i32 - first_x as i32).abs() < 10) {
            patterns.push(LayoutPattern::Vertical);
        }

        Ok(patterns)
    }

    /// Suggest appropriate actions for element type
    fn suggest_actions(&self, element_type: &str) -> Vec<Action> {
        match element_type {
            "button" => vec![Action::Click, Action::Hover],
            "textfield" => vec![Action::Type, Action::Click, Action::Clear],
            "checkbox" => vec![Action::Click, Action::Toggle],
            "dropdown" => vec![Action::Click, Action::Select],
            _ => vec![],
        }
    }
}

#[derive(Debug, Clone)]
pub struct DetectedElement {
    pub id: String,
    pub element_type: String,
    pub bounds: BoundingBox,
}

#[derive(Debug, Clone)]
pub struct GroundedElement {
    pub id: String,
    pub element_type: String,
    pub bounds: BoundingBox,
    pub actions: Vec<Action>,
    pub confidence: f32,
}

#[derive(Debug, Clone)]
pub enum Action {
    Click,
    Type(String),
    Hover,
    Select(String),
    Toggle,
    Clear,
}

#[derive(Debug, Clone)]
pub struct HierarchyTree {
    pub root: String,
    pub children: HashMap<String, Vec<String>>,
}

#[derive(Debug, Clone)]
pub struct LayoutPattern {
    pub pattern_type: String,
    pub elements: Vec<String>,
    pub confidence: f32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ui_grounding() {
        let mut system = UIGroundingSystem::new();
        let elements = vec![DetectedElement {
            id: "btn1".to_string(),
            element_type: "button".to_string(),
            bounds: BoundingBox { x: 0, y: 0, width: 100, height: 30 },
        }];
        
        let grounded = system.ground_elements(elements).unwrap();
        assert_eq!(grounded.len(), 1);
    }
}
