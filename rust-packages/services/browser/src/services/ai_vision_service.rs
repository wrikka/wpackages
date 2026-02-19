use crate::error::Result;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VisionAnalysis {
    pub description: String,
    pub elements: Vec<DetectedElement>,
    pub suggestions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectedElement {
    pub element_type: String,
    pub text: Option<String>,
    pub confidence: f32,
    pub bounding_box: Option<BoundingBox>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BoundingBox {
    pub x: u32,
    pub y: u32,
    pub width: u32,
    pub height: u32,
}

#[async_trait]
pub trait AIVisionService: Send + Sync {
    async fn analyze_screenshot(&self, image_data: &[u8]) -> Result<VisionAnalysis>;
    async fn find_element(
        &self,
        image_data: &[u8],
        description: &str,
    ) -> Result<Option<DetectedElement>>;
    async fn extract_text(&self, image_data: &[u8]) -> Result<String>;
    async fn suggest_actions(&self, image_data: &[u8], goal: &str) -> Result<Vec<String>>;
}

pub struct MockAIVisionService;

impl MockAIVisionService {
    pub fn new() -> Self {
        Self
    }
}

impl Default for MockAIVisionService {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl AIVisionService for MockAIVisionService {
    async fn analyze_screenshot(&self, _image_data: &[u8]) -> Result<VisionAnalysis> {
        Ok(VisionAnalysis {
            description: "Mock analysis".to_string(),
            elements: vec![],
            suggestions: vec![],
        })
    }

    async fn find_element(
        &self,
        _image_data: &[u8],
        _description: &str,
    ) -> Result<Option<DetectedElement>> {
        Ok(None)
    }

    async fn extract_text(&self, _image_data: &[u8]) -> Result<String> {
        Ok(String::new())
    }

    async fn suggest_actions(&self, _image_data: &[u8], _goal: &str) -> Result<Vec<String>> {
        Ok(vec![])
    }
}
