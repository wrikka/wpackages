//! Smart Element Detection
//!
//! Feature 3: AI-powered semantic element detection

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use crate::error::Result;
use crate::types::{BoundingBox, Position, UIElement};

/// Element detector
pub struct ElementDetector {
    min_confidence: f32,
    element_types: HashMap<String, ElementPattern>,
}

/// Element pattern for detection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElementPattern {
    pub name: String,
    pub role_patterns: Vec<String>,
    pub text_patterns: Vec<String>,
    pub size_constraints: Option<SizeConstraints>,
}

/// Size constraints for element matching
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SizeConstraints {
    pub min_width: Option<u32>,
    pub max_width: Option<u32>,
    pub min_height: Option<u32>,
    pub max_height: Option<u32>,
}

/// Detection result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionResult {
    pub element: UIElement,
    pub confidence: f32,
    pub element_type: String,
    pub semantic_label: String,
}

impl ElementDetector {
    /// Create new element detector
    pub fn new() -> Self {
        Self {
            min_confidence: 0.5,
            element_types: Self::default_patterns(),
        }
    }

    /// Create with custom confidence threshold
    pub fn with_min_confidence(min_confidence: f32) -> Self {
        Self {
            min_confidence,
            element_types: Self::default_patterns(),
        }
    }

    /// Default element patterns
    fn default_patterns() -> HashMap<String, ElementPattern> {
        let mut patterns = HashMap::new();

        patterns.insert("button".to_string(), ElementPattern {
            name: "button".to_string(),
            role_patterns: vec!["button".to_string(), "pushbutton".to_string()],
            text_patterns: vec![],
            size_constraints: Some(SizeConstraints {
                min_width: Some(20),
                max_width: Some(500),
                min_height: Some(15),
                max_height: Some(100),
            }),
        });

        patterns.insert("input".to_string(), ElementPattern {
            name: "input".to_string(),
            role_patterns: vec!["textbox".to_string(), "edit".to_string(), "entry".to_string()],
            text_patterns: vec![],
            size_constraints: Some(SizeConstraints {
                min_width: Some(50),
                max_width: None,
                min_height: Some(15),
                max_height: Some(50),
            }),
        });

        patterns.insert("link".to_string(), ElementPattern {
            name: "link".to_string(),
            role_patterns: vec!["link".to_string(), "hyperlink".to_string()],
            text_patterns: vec![],
            size_constraints: None,
        });

        patterns
    }

    /// Detect elements from UI tree
    pub fn detect(&self, elements: &[UIElement]) -> Result<Vec<DetectionResult>> {
        let mut results = Vec::new();

        for element in elements {
            if let Some(result) = self.detect_element(element) {
                if result.confidence >= self.min_confidence {
                    results.push(result);
                }
            }
        }

        Ok(results)
    }

    /// Detect single element
    fn detect_element(&self, element: &UIElement) -> Option<DetectionResult> {
        for (type_name, pattern) in &self.element_types {
            let confidence = self.match_pattern(element, pattern);
            if confidence >= self.min_confidence {
                return Some(DetectionResult {
                    element: element.clone(),
                    confidence,
                    element_type: type_name.clone(),
                    semantic_label: self.generate_label(element, type_name),
                });
            }
        }
        None
    }

    /// Match element against pattern
    fn match_pattern(&self, element: &UIElement, pattern: &ElementPattern) -> f32 {
        let mut score = 0.0f32;

        // Check role patterns
        if pattern.role_patterns.iter().any(|p| {
            element.role.to_lowercase().contains(&p.to_lowercase())
        }) {
            score += 0.5;
        }

        // Check size constraints
        if let Some(ref constraints) = pattern.size_constraints {
            if let Some(bounds) = element.bounds {
                let mut size_score = 0.25;

                if let Some(min_w) = constraints.min_width {
                    if bounds.width < min_w { size_score -= 0.1; }
                }
                if let Some(max_w) = constraints.max_width {
                    if bounds.width > max_w { size_score -= 0.1; }
                }
                if let Some(min_h) = constraints.min_height {
                    if bounds.height < min_h { size_score -= 0.1; }
                }
                if let Some(max_h) = constraints.max_height {
                    if bounds.height > max_h { size_score -= 0.1; }
                }

                score += size_score;
            }
        }

        // Check text patterns
        if let Some(ref name) = element.name {
            if pattern.text_patterns.iter().any(|p| {
                name.to_lowercase().contains(&p.to_lowercase())
            }) {
                score += 0.25;
            }
        }

        score.min(1.0)
    }

    /// Generate semantic label
    fn generate_label(&self, element: &UIElement, type_name: &str) -> String {
        match &element.name {
            Some(name) if !name.is_empty() => {
                format!("{}: {}", type_name, name)
            }
            _ => {
                if let Some(bounds) = element.bounds {
                    format!("{} at ({}, {})", type_name, bounds.x, bounds.y)
                } else {
                    type_name.to_string()
                }
            }
        }
    }

    /// Find element by semantic query
    pub fn find_by_query<'a>(&self, elements: &'a [UIElement], query: &str) -> Option<&'a UIElement> {
        let query = query.to_lowercase();

        elements.iter().find(|e| {
            // Check name
            e.name.as_ref()
                .map(|n| n.to_lowercase().contains(&query))
                .unwrap_or(false)
            ||
            // Check role
            e.role.to_lowercase().contains(&query)
        })
    }

    /// Find clickable elements
    pub fn find_clickable<'a>(&self, elements: &'a [UIElement]) -> Vec<&'a UIElement> {
        elements.iter()
            .filter(|e| {
                e.role.to_lowercase().contains("button")
                    || e.role.to_lowercase().contains("link")
                    || e.role.to_lowercase().contains("clickable")
            })
            .collect()
    }

    /// Find input elements
    pub fn find_inputs<'a>(&self, elements: &'a [UIElement]) -> Vec<&'a UIElement> {
        elements.iter()
            .filter(|e| {
                e.role.to_lowercase().contains("text")
                    || e.role.to_lowercase().contains("input")
                    || e.role.to_lowercase().contains("edit")
            })
            .collect()
    }
}

impl Default for ElementDetector {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_button() {
        let detector = ElementDetector::new();
        let elements = vec![
            UIElement::new(1, "button")
                .with_name("Click Me")
                .with_bounds(BoundingBox::new(0, 0, 100, 40)),
        ];
        let results = detector.detect(&elements).unwrap();
        assert!(!results.is_empty());
        assert_eq!(results[0].element_type, "button");
    }

    #[test]
    fn test_find_by_query() {
        let detector = ElementDetector::new();
        let elements = vec![
            UIElement::new(1, "button").with_name("Submit"),
        ];
        let found = detector.find_by_query(&elements, "submit");
        assert!(found.is_some());
    }
}
