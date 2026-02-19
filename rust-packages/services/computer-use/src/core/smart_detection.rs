//! Smart Element Detection (Feature 1)
//!
//! AI-powered semantic element detection that understands UI context
//! instead of relying solely on coordinates or selectors.

use crate::types::{Point, Rect};
use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Semantic element types that the AI can recognize
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SemanticType {
    Button,
    SubmitButton,
    CancelButton,
    TextField,
    SearchBox,
    PasswordField,
    Dropdown,
    Checkbox,
    RadioButton,
    Link,
    Menu,
    Tab,
    Dialog,
    Modal,
    Toast,
    Loading,
    Chart,
    Table,
    List,
    Image,
    Video,
    Unknown,
}

/// Confidence score for element detection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionConfidence {
    pub score: f32,
    pub method: DetectionMethod,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DetectionMethod {
    VisionModel,
    AccessibilityTree,
    HtmlStructure,
    Heuristic,
    Hybrid,
}

/// Smart element with semantic understanding
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SmartElement {
    pub id: String,
    pub semantic_type: SemanticType,
    pub text: Option<String>,
    pub label: Option<String>,
    pub description: Option<String>,
    pub location: Rect,
    pub center: Point,
    pub confidence: DetectionConfidence,
    pub attributes: HashMap<String, String>,
    pub parent_id: Option<String>,
    pub children_ids: Vec<String>,
    pub state: ElementState,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ElementState {
    Visible,
    Hidden,
    Disabled,
    Loading,
    Active,
    Focused,
    Hover,
}

/// Element matcher for finding elements by semantic meaning
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElementMatcher {
    pub semantic_type: Option<SemanticType>,
    pub text_contains: Option<String>,
    pub label_contains: Option<String>,
    pub near_text: Option<String>,
    pub min_confidence: f32,
}

/// Smart Element Detector using AI vision and accessibility APIs
pub struct SmartElementDetector {
    elements: HashMap<String, SmartElement>,
    spatial_index: SpatialIndex,
}

impl SmartElementDetector {
    pub fn new() -> Self {
        Self {
            elements: HashMap::new(),
            spatial_index: SpatialIndex::new(),
        }
    }

    /// Detect all elements on screen with semantic understanding
    pub async fn detect_all(&mut self, screenshot: &[u8]) -> Result<Vec<SmartElement>> {
        let mut detected = Vec::new();

        // 1. Get accessibility tree elements
        let accessible_elements = self.detect_from_accessibility().await?;
        for elem in accessible_elements {
            detected.push(elem);
        }

        // 2. Use vision model to detect elements from screenshot
        let vision_elements = self.detect_from_vision(screenshot).await?;
        for elem in vision_elements {
            if !self.is_duplicate(&elem, &detected) {
                detected.push(elem);
            }
        }

        // 3. Build spatial index for spatial queries
        self.build_spatial_index(&detected);

        // 4. Store elements
        for elem in &detected {
            self.elements.insert(elem.id.clone(), elem.clone());
        }

        Ok(detected)
    }

    /// Find element by semantic description
    pub fn find_by_semantic(&self, matcher: &ElementMatcher) -> Option<&SmartElement> {
        self.elements
            .values()
            .filter(|e| e.confidence.score >= matcher.min_confidence)
            .find(|e| {
                let type_match = matcher
                    .semantic_type
                    .as_ref()
                    .map(|t| &e.semantic_type == t)
                    .unwrap_or(true);
                let text_match = matcher
                    .text_contains
                    .as_ref()
                    .map(|t| e.text.as_ref().map(|txt| txt.contains(t)).unwrap_or(false))
                    .unwrap_or(true);
                let label_match = matcher
                    .label_contains
                    .as_ref()
                    .map(|l| e.label.as_ref().map(|lbl| lbl.contains(l)).unwrap_or(false))
                    .unwrap_or(true);

                type_match && text_match && label_match
            })
    }

    /// Find element near another element
    pub fn find_near(&self, reference_id: &str, matcher: &ElementMatcher) -> Option<&SmartElement> {
        let reference = self.elements.get(reference_id)?;
        let nearby = self.spatial_index.find_nearby(&reference.center, 100.0);

        nearby
            .iter()
            .filter_map(|id| self.elements.get(id))
            .filter(|e| e.confidence.score >= matcher.min_confidence)
            .find(|e| {
                matcher
                    .semantic_type
                    .as_ref()
                    .map(|t| &e.semantic_type == t)
                    .unwrap_or(true)
            })
    }

    /// Find element by natural language description
    pub async fn find_by_description(&self, description: &str) -> Result<Option<&SmartElement>> {
        // Parse natural language into matcher
        let matcher = self.parse_description(description).await?;
        Ok(self.find_by_semantic(&matcher))
    }

    async fn detect_from_accessibility(&self) -> Result<Vec<SmartElement>> {
        // Platform-specific accessibility API integration
        Ok(Vec::new())
    }

    async fn detect_from_vision(&self, _screenshot: &[u8]) -> Result<Vec<SmartElement>> {
        // VLM-based element detection
        Ok(Vec::new())
    }

    async fn parse_description(&self, description: &str) -> Result<ElementMatcher> {
        // NLP parsing of element descriptions
        let matcher = ElementMatcher {
            semantic_type: self.infer_type_from_description(description),
            text_contains: None,
            label_contains: None,
            near_text: None,
            min_confidence: 0.7,
        };
        Ok(matcher)
    }

    fn infer_type_from_description(&self, description: &str) -> Option<SemanticType> {
        let lower = description.to_lowercase();
        if lower.contains("button") {
            if lower.contains("submit") || lower.contains("save") || lower.contains("ok") {
                Some(SemanticType::SubmitButton)
            } else if lower.contains("cancel") || lower.contains("close") {
                Some(SemanticType::CancelButton)
            } else {
                Some(SemanticType::Button)
            }
        } else if lower.contains("input") || lower.contains("text field") {
            Some(SemanticType::TextField)
        } else if lower.contains("search") {
            Some(SemanticType::SearchBox)
        } else if lower.contains("dropdown") || lower.contains("select") {
            Some(SemanticType::Dropdown)
        } else if lower.contains("checkbox") {
            Some(SemanticType::Checkbox)
        } else if lower.contains("link") {
            Some(SemanticType::Link)
        } else {
            None
        }
    }

    fn is_duplicate(&self, new_elem: &SmartElement, existing: &[SmartElement]) -> bool {
        existing.iter().any(|e| {
            let distance = ((e.center.x - new_elem.center.x).powi(2)
                + (e.center.y - new_elem.center.y).powi(2))
            .sqrt();
            distance < 10.0 && e.semantic_type == new_elem.semantic_type
        })
    }

    fn build_spatial_index(&mut self, elements: &[SmartElement]) {
        self.spatial_index = SpatialIndex::new();
        for elem in elements {
            self.spatial_index.insert(elem.id.clone(), elem.center);
        }
    }
}

/// Spatial index for fast proximity queries
struct SpatialIndex {
    points: Vec<(String, Point)>,
}

impl SpatialIndex {
    fn new() -> Self {
        Self { points: Vec::new() }
    }

    fn insert(&mut self, id: String, point: Point) {
        self.points.push((id, point));
    }

    fn find_nearby(&self, center: &Point, radius: f32) -> Vec<String> {
        let radius_squared = radius * radius;
        self.points
            .iter()
            .filter(|(_, p)| {
                let dx = p.x - center.x;
                let dy = p.y - center.y;
                (dx * dx + dy * dy) as f32 <= radius_squared
            })
            .map(|(id, _)| id.clone())
            .collect()
    }
}
