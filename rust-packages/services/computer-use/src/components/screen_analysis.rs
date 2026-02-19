//! Screen analysis component (pure logic)
//!
//! Analyzes screen state and UI elements.

use crate::types::{BoundingBox, Position, UIElement};

/// Screen analysis result
#[derive(Debug, Clone)]
pub struct ScreenAnalysis {
    pub elements: Vec<UIElement>,
    pub primary_element: Option<u32>,
    pub clickable_regions: Vec<BoundingBox>,
}

/// Screen analyzer (pure component)
pub struct ScreenAnalyzer {
    min_element_size: u32,
}

impl ScreenAnalyzer {
    /// Create new screen analyzer
    pub const fn new() -> Self {
        Self { min_element_size: 5 }
    }

    /// Analyze UI elements
    pub fn analyze(&self, elements: Vec<UIElement>) -> ScreenAnalysis {
        let clickable_regions = self.find_clickable_regions(&elements);
        let primary_element = self.find_primary_element(&elements);

        ScreenAnalysis {
            elements,
            primary_element,
            clickable_regions,
        }
    }

    /// Find clickable regions
    fn find_clickable_regions(&self, elements: &[UIElement]) -> Vec<BoundingBox> {
        elements
            .iter()
            .filter_map(|e| e.bounds)
            .filter(|b| b.width >= self.min_element_size && b.height >= self.min_element_size)
            .collect()
    }

    /// Find primary element (first clickable element)
    fn find_primary_element(&self, elements: &[UIElement]) -> Option<u32> {
        elements
            .iter()
            .find(|e| {
                e.bounds
                    .map(|b| b.width >= self.min_element_size && b.height >= self.min_element_size)
                    .unwrap_or(false)
            })
            .map(|e| e.ref_id)
    }

    /// Find element at position
    pub fn find_element_at(&self, elements: &[UIElement], pos: Position) -> Option<&UIElement> {
        elements.iter().find(|e| {
            e.bounds
                .map(|b| b.contains(pos))
                .unwrap_or(false)
        })
    }

    /// Find element by name
    pub fn find_element_by_name<'a>(
        &self,
        elements: &'a [UIElement],
        name: &str,
    ) -> Option<&'a UIElement> {
        elements.iter().find(|e| {
            e.name
                .as_ref()
                .map(|n| n.to_lowercase().contains(&name.to_lowercase()))
                .unwrap_or(false)
        })
    }
}

impl Default for ScreenAnalyzer {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_analyze_elements() {
        let analyzer = ScreenAnalyzer::new();
        let elements = vec![
            UIElement::new(1, "button")
                .with_name("Click Me")
                .with_bounds(BoundingBox::new(0, 0, 100, 50)),
        ];
        let analysis = analyzer.analyze(elements);
        assert_eq!(analysis.clickable_regions.len(), 1);
    }

    #[test]
    fn test_find_element_at() {
        let analyzer = ScreenAnalyzer::new();
        let elements = vec![
            UIElement::new(1, "button").with_bounds(BoundingBox::new(0, 0, 100, 100)),
        ];
        let found = analyzer.find_element_at(&elements, Position::new(50, 50));
        assert!(found.is_some());
    }
}
