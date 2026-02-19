//! Smart Element Locator with Auto-Healing
//!
//! This module provides intelligent element location with multiple fallback strategies
//! and automatic healing when elements change.

use crate::error::{Error, Result};
use crate::protocol::{ElementNode, Snapshot};
use image::{DynamicImage, GenericImageView, Rgba};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;
use std::time::{Duration, Instant};

/// Represents different strategies for locating an element
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum LocatorStrategy {
    /// Direct reference from accessibility tree
    Ref(String),
    /// XPath-like path
    XPath(String),
    /// CSS selector
    Css(String),
    /// Text content match
    Text(String),
    /// Accessibility ID
    AccessibilityId(String),
    /// Class name
    ClassName(String),
    /// Image-based matching
    Image(String),
    /// AI vision-based (natural language description)
    AIVision(String),
    /// Semantic description (role + name)
    Semantic { role: String, name: String },
    /// Position-based fallback
    Position { x: i32, y: i32 },
    /// Visual similarity (for auto-healing)
    VisualSimilarity { reference_image: String, threshold: f64 },
}

/// A composite locator that tries multiple strategies
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SmartLocator {
    /// Primary strategy
    pub primary: LocatorStrategy,
    /// Fallback strategies in order of preference
    pub fallbacks: Vec<LocatorStrategy>,
    /// Timeout for locating element
    pub timeout_ms: u64,
    /// Whether to use auto-healing
    pub auto_heal: bool,
    /// Healing history
    pub healing_history: Vec<HealingEvent>,
    /// Last successful strategy
    pub last_successful_strategy: Option<LocatorStrategy>,
    /// Visual fingerprint for similarity matching
    pub visual_fingerprint: Option<VisualFingerprint>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealingEvent {
    pub timestamp: u64,
    pub original_strategy: LocatorStrategy,
    pub healed_strategy: LocatorStrategy,
    pub confidence: f64,
    pub reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VisualFingerprint {
    /// Element dimensions
    pub width: u32,
    pub height: u32,
    /// Color histogram
    pub color_histogram: Vec<u32>,
    /// Edge pattern
    pub edge_signature: Vec<f64>,
    /// SIFT-like keypoints (simplified)
    pub keypoints: Vec<KeyPoint>,
    /// Text content (if any)
    pub text_content: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyPoint {
    pub x: f32,
    pub y: f32,
    pub descriptor: Vec<u8>,
}

/// Result of element location
#[derive(Debug, Clone)]
pub struct LocatedElement {
    /// Element reference ID
    pub ref_id: String,
    /// Bounding box
    pub bounds: BoundingBox,
    /// Element properties
    pub properties: ElementProperties,
    /// Which strategy was successful
    pub matched_strategy: LocatorStrategy,
    /// Confidence score (0.0 - 1.0)
    pub confidence: f64,
    /// Whether this element was auto-healed
    pub was_healed: bool,
}

#[derive(Debug, Clone)]
pub struct BoundingBox {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Clone)]
pub struct ElementProperties {
    pub role: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub is_enabled: bool,
    pub is_visible: bool,
    pub extra: HashMap<String, String>,
}

/// The smart locator engine
pub struct SmartElementLocator {
    /// Configuration for location strategies
    config: LocatorConfig,
    /// Learning database for element healing
    healing_db: HealingDatabase,
    /// Vision model for AI-based location
    vision_engine: Option<Box<dyn VisionEngine>>,
}

#[derive(Debug, Clone)]
pub struct LocatorConfig {
    /// Default timeout in milliseconds
    pub default_timeout_ms: u64,
    /// Retry interval
    pub retry_interval_ms: u64,
    /// Maximum number of retries
    pub max_retries: u32,
    /// Visual similarity threshold for healing
    pub visual_similarity_threshold: f64,
    /// Whether to use AI vision as last resort
    pub use_ai_vision: bool,
    /// Whether to cache element fingerprints
    pub cache_fingerprints: bool,
}

impl Default for LocatorConfig {
    fn default() -> Self {
        Self {
            default_timeout_ms: 10000,
            retry_interval_ms: 500,
            max_retries: 20,
            visual_similarity_threshold: 0.85,
            use_ai_vision: true,
            cache_fingerprints: true,
        }
    }
}

/// Database for storing learned element patterns
pub struct HealingDatabase {
    /// Element signatures by application
    element_signatures: HashMap<String, Vec<ElementSignature>>,
    /// Successful locators by element hash
    successful_locators: HashMap<String, Vec<LocatorStrategy>>,
    /// Change patterns observed
    change_patterns: Vec<ChangePattern>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElementSignature {
    /// Unique hash of element properties
    pub element_hash: String,
    /// Application context
    pub app_context: String,
    /// Version when first seen
    pub first_seen_version: String,
    /// Version when last seen
    pub last_seen_version: String,
    /// All strategies that have worked
    pub working_strategies: Vec<WorkingStrategy>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkingStrategy {
    pub strategy: LocatorStrategy,
    pub success_count: u32,
    pub failure_count: u32,
    pub last_success: u64,
    pub average_confidence: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChangePattern {
    /// Pattern type (e.g., "id_incremented", "class_changed")
    pub pattern_type: String,
    /// Description of the pattern
    pub description: String,
    /// Examples observed
    pub examples: Vec<(String, String)>,
}

trait VisionEngine: Send + Sync {
    fn locate_by_description(&self, description: &str, screenshot: &DynamicImage) -> Result<Vec<BoundingBox>>;
}

impl SmartElementLocator {
    pub fn new() -> Self {
        Self {
            config: LocatorConfig::default(),
            healing_db: HealingDatabase::new(),
            vision_engine: None,
        }
    }

    pub fn with_config(mut self, config: LocatorConfig) -> Self {
        self.config = config;
        self
    }

    pub fn with_vision_engine(mut self, engine: Box<dyn VisionEngine>) -> Self {
        self.vision_engine = Some(engine);
        self
    }

    /// Locate an element using smart multi-strategy approach
    pub async fn locate(
        &self,
        locator: &SmartLocator,
        snapshot: &Snapshot,
        screenshot: Option<&DynamicImage>,
    ) -> Result<LocatedElement> {
        let start = Instant::now();
        let timeout = Duration::from_millis(locator.timeout_ms);

        // Try primary strategy first
        let mut last_error = None;

        loop {
            if start.elapsed() > timeout {
                break;
            }

            // Try primary
            match self.try_strategy(&locator.primary, snapshot, screenshot).await {
                Ok(element) => {
                    return Ok(element);
                }
                Err(e) => {
                    last_error = Some(e);
                }
            }

            // Try fallbacks in order
            for strategy in &locator.fallbacks {
                match self.try_strategy(strategy, snapshot, screenshot).await {
                    Ok(element) => {
                        return Ok(element);
                    }
                    Err(_) => continue,
                }
            }

            // Try auto-healing if enabled
            if locator.auto_heal {
                match self.try_heal(locator, snapshot, screenshot).await {
                    Ok(element) => {
                        return Ok(element);
                    }
                    Err(_) => {}
                }
            }

            // Try AI vision if enabled and available
            if self.config.use_ai_vision {
                if let Some(ref engine) = self.vision_engine {
                    if let Some(img) = screenshot {
                        if let Ok(bounds) = self.try_ai_vision(&locator.primary, engine, img).await {
                            // Convert bounds to element
                            // This would need proper implementation
                            let _ = bounds;
                        }
                    }
                }
            }

            tokio::time::sleep(Duration::from_millis(self.config.retry_interval_ms)).await;
        }

        Err(last_error.unwrap_or_else(|| {
            Error::InvalidCommand(format!(
                "Element not found after {}ms using {:?}",
                locator.timeout_ms, locator.primary
            ))
        }))
    }

    /// Try a specific location strategy
    async fn try_strategy(
        &self,
        strategy: &LocatorStrategy,
        snapshot: &Snapshot,
        _screenshot: Option<&DynamicImage>,
    ) -> Result<LocatedElement> {
        match strategy {
            LocatorStrategy::Ref(ref_id) => {
                self.find_by_ref(snapshot, ref_id)
            }
            LocatorStrategy::Text(text) => {
                self.find_by_text(snapshot, text)
            }
            LocatorStrategy::Semantic { role, name } => {
                self.find_by_semantic(snapshot, role, Some(name))
            }
            LocatorStrategy::AccessibilityId(id) => {
                self.find_by_accessibility_id(snapshot, id)
            }
            LocatorStrategy::Position { x, y } => {
                self.find_by_position(snapshot, *x, *y)
            }
            _ => Err(Error::InvalidCommand(
                "Strategy not yet implemented".to_string(),
            )),
        }
    }

    /// Find element by reference ID
    fn find_by_ref(&self, snapshot: &Snapshot, ref_id: &str) -> Result<LocatedElement> {
        for node in &snapshot.nodes {
            if node.ref_id == ref_id {
                return self.node_to_element(node, LocatorStrategy::Ref(ref_id.to_string()));
            }
        }
        Err(Error::InvalidCommand(format!(
            "Element with ref {} not found",
            ref_id
        )))
    }

    /// Find element by text content (fuzzy matching)
    fn find_by_text(&self, snapshot: &Snapshot, text: &str) -> Result<LocatedElement> {
        let mut best_match: Option<(f64, &ElementNode)> = None;

        for node in &snapshot.nodes {
            if let Some(name) = &node.name {
                let similarity = fuzzy_match(name, text);
                if similarity > 0.8 {
                    if best_match.as_ref().map_or(true, |(score, _)| similarity > *score) {
                        best_match = Some((similarity, node));
                    }
                }
            }
        }

        if let Some((confidence, node)) = best_match {
            let mut element = self.node_to_element(node, LocatorStrategy::Text(text.to_string()))?;
            element.confidence = confidence;
            Ok(element)
        } else {
            Err(Error::InvalidCommand(format!(
                "Element with text '{}' not found",
                text
            )))
        }
    }

    /// Find element by semantic role and name
    fn find_by_semantic(
        &self,
        snapshot: &Snapshot,
        role: &str,
        name: Option<&str>,
    ) -> Result<LocatedElement> {
        for node in &snapshot.nodes {
            if node.role == role {
                if let Some(ref node_name) = node.name {
                    if let Some(search_name) = name {
                        if node_name.contains(search_name) || fuzzy_match(node_name, search_name) > 0.8 {
                            return self.node_to_element(
                                node,
                                LocatorStrategy::Semantic {
                                    role: role.to_string(),
                                    name: search_name.to_string(),
                                },
                            );
                        }
                    } else {
                        return self.node_to_element(
                            node,
                            LocatorStrategy::Semantic {
                                role: role.to_string(),
                                name: node_name.clone(),
                            },
                        );
                    }
                } else if name.is_none() {
                    return self.node_to_element(
                        node,
                        LocatorStrategy::Semantic {
                            role: role.to_string(),
                            name: String::new(),
                        },
                    );
                }
            }
        }
        Err(Error::InvalidCommand(format!(
            "Element with role '{}' not found",
            role
        )))
    }

    /// Find element by accessibility ID
    fn find_by_accessibility_id(&self, _snapshot: &Snapshot, id: &str) -> Result<LocatedElement> {
        // This would search in the accessibility tree
        Err(Error::InvalidCommand(format!(
            "Accessibility ID '{}' not found",
            id
        )))
    }

    /// Find element at a specific position
    fn find_by_position(&self, snapshot: &Snapshot, x: i32, y: i32) -> Result<LocatedElement> {
        for node in &snapshot.nodes {
            if let Some(attrs) = &node.attributes {
                if let (Some(node_x), Some(node_y), Some(node_w), Some(node_h)) = (
                    attrs.get("x").and_then(|v| v.as_i64()),
                    attrs.get("y").and_then(|v| v.as_i64()),
                    attrs.get("width").and_then(|v| v.as_i64()),
                    attrs.get("height").and_then(|v| v.as_i64()),
                ) {
                    if x >= node_x as i32
                        && x <= (node_x + node_w) as i32
                        && y >= node_y as i32
                        && y <= (node_y + node_h) as i32
                    {
                        return self.node_to_element(
                            node,
                            LocatorStrategy::Position { x, y },
                        );
                    }
                }
            }
        }
        Err(Error::InvalidCommand(format!(
            "No element found at position ({}, {})",
            x, y
        )))
    }

    /// Attempt to auto-heal a broken locator
    async fn try_heal(
        &self,
        locator: &SmartLocator,
        snapshot: &Snapshot,
        screenshot: Option<&DynamicImage>,
    ) -> Result<LocatedElement> {
        // Try to find similar elements using visual fingerprint
        if let Some(ref fingerprint) = locator.visual_fingerprint {
            for node in &snapshot.nodes {
                // Compute fingerprint for this node
                if let Some(node_fingerprint) = self.compute_fingerprint(node, screenshot) {
                    let similarity = compare_fingerprints(fingerprint, &node_fingerprint);
                    if similarity >= self.config.visual_similarity_threshold {
                        let mut element = self.node_to_element(
                            node,
                            LocatorStrategy::VisualSimilarity {
                                reference_image: String::new(),
                                threshold: similarity,
                            },
                        )?;
                        element.was_healed = true;
                        element.confidence = similarity;
                        return Ok(element);
                    }
                }
            }
        }

        // Try learning from healing database
        if let Some(pattern) = self.healing_db.find_pattern(locator) {
            // Apply the learned pattern
            let _ = pattern;
        }

        Err(Error::InvalidCommand("Could not auto-heal element".to_string()))
    }

    /// Try AI vision-based location
    async fn try_ai_vision(
        &self,
        strategy: &LocatorStrategy,
        engine: &Box<dyn VisionEngine>,
        screenshot: &DynamicImage,
    ) -> Result<Vec<BoundingBox>> {
        let description = match strategy {
            LocatorStrategy::AIVision(desc) => desc,
            LocatorStrategy::Text(text) => text,
            LocatorStrategy::Semantic { role, name } => {
                &format!("{} element named '{}'", role, name)
            }
            _ => return Err(Error::InvalidCommand("No AI description available".to_string())),
        };

        engine.locate_by_description(description, screenshot)
    }

    /// Convert a snapshot node to a LocatedElement
    fn node_to_element(
        &self,
        node: &ElementNode,
        strategy: LocatorStrategy,
    ) -> Result<LocatedElement> {
        let bounds = if let Some(attrs) = &node.attributes {
            BoundingBox {
                x: attrs.get("x").and_then(|v| v.as_i64()).unwrap_or(0) as i32,
                y: attrs.get("y").and_then(|v| v.as_i64()).unwrap_or(0) as i32,
                width: attrs.get("width").and_then(|v| v.as_i64()).unwrap_or(0) as u32,
                height: attrs.get("height").and_then(|v| v.as_i64()).unwrap_or(0) as u32,
            }
        } else {
            BoundingBox {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            }
        };

        let properties = ElementProperties {
            role: node.role.clone(),
            name: node.name.clone(),
            description: node.attributes
                .as_ref()
                .and_then(|a| a.get("description"))
                .and_then(|v| v.as_str())
                .map(|s| s.to_string()),
            is_enabled: node.attributes
                .as_ref()
                .and_then(|a| a.get("enabled"))
                .and_then(|v| v.as_bool())
                .unwrap_or(true),
            is_visible: node.attributes
                .as_ref()
                .and_then(|a| a.get("visible"))
                .and_then(|v| v.as_bool())
                .unwrap_or(true),
            extra: HashMap::new(),
        };

        Ok(LocatedElement {
            ref_id: node.ref_id.clone(),
            bounds,
            properties,
            matched_strategy: strategy,
            confidence: 1.0,
            was_healed: false,
        })
    }

    /// Compute visual fingerprint for an element
    fn compute_fingerprint(
        &self,
        node: &ElementNode,
        screenshot: Option<&DynamicImage>,
    ) -> Option<VisualFingerprint> {
        if let Some(img) = screenshot {
            if let Some(attrs) = &node.attributes {
                let x = attrs.get("x")?.as_i64()? as u32;
                let y = attrs.get("y")?.and_then(|v| v.as_i64())? as u32;
                let width = attrs.get("width")?.and_then(|v| v.as_u64())? as u32;
                let height = attrs.get("height")?.and_then(|v| v.as_u64())? as u32;

                if x + width <= img.width() && y + height <= img.height() {
                    let cropped = img.crop(x, y, width, height);
                    return Some(compute_image_fingerprint(&cropped, node.name.clone()));
                }
            }
        }
        None
    }

    /// Learn from a successful healing
    pub fn learn_healing(&mut self, original: &LocatorStrategy, healed: &LocatorStrategy, context: &str) {
        self.healing_db.record_successful_healing(original, healed, context);
    }
}

impl HealingDatabase {
    fn new() -> Self {
        Self {
            element_signatures: HashMap::new(),
            successful_locators: HashMap::new(),
            change_patterns: vec![],
        }
    }

    fn find_pattern(&self, _locator: &SmartLocator) -> Option<&ChangePattern> {
        // Analyze change patterns to find applicable ones
        self.change_patterns.first()
    }

    fn record_successful_healing(&mut self, _original: &LocatorStrategy, _healed: &LocatorStrategy, _context: &str) {
        // Record this healing for future reference
    }
}

/// Compute visual fingerprint from image
fn compute_image_fingerprint(image: &DynamicImage, text_content: Option<String>) -> VisualFingerprint {
    let (width, height) = (image.width(), image.height());
    
    // Compute color histogram (64 bins - 4 bits per channel)
    let mut color_histogram = vec![0u32; 64];
    for (_, _, pixel) in image.pixels() {
        let Rgba([r, g, b, _]) = pixel;
        let bin = ((r as usize >> 6) << 4) | ((g as usize >> 6) << 2) | (b as usize >> 6);
        if bin < 64 {
            color_histogram[bin] += 1;
        }
    }

    // Simplified edge detection (using pixel differences)
    let mut edge_signature = vec![];
    for y in (0..height).step_by(4) {
        for x in (0..width).step_by(4) {
            if x + 1 < width {
                let current = image.get_pixel(x, y);
                let next = image.get_pixel(x + 1, y);
                let diff = pixel_diff(&current, &next);
                edge_signature.push(diff);
            }
        }
    }

    VisualFingerprint {
        width,
        height,
        color_histogram,
        edge_signature,
        keypoints: vec![], // Would compute real keypoints in production
        text_content,
    }
}

fn pixel_diff(a: &Rgba<u8>, b: &Rgba<u8>) -> f64 {
    let r_diff = a.0[0] as i32 - b.0[0] as i32;
    let g_diff = a.0[1] as i32 - b.0[1] as i32;
    let b_diff = a.0[2] as i32 - b.0[2] as i32;
    ((r_diff * r_diff + g_diff * g_diff + b_diff * b_diff) as f64 / 3.0).sqrt()
}

/// Compare two fingerprints for similarity
fn compare_fingerprints(a: &VisualFingerprint, b: &VisualFingerprint) -> f64 {
    // Check dimensions
    let dim_similarity = if a.width == b.width && a.height == b.height {
        1.0
    } else {
        let w_ratio = (a.width as f64).min(b.width as f64) / (a.width as f64).max(b.width as f64);
        let h_ratio = (a.height as f64).min(b.height as f64) / (a.height as f64).max(b.height as f64);
        w_ratio * h_ratio
    };

    // Compare color histograms
    let hist_similarity = if !a.color_histogram.is_empty() && !b.color_histogram.is_empty() {
        let mut dot_product = 0.0;
        let mut a_norm = 0.0;
        let mut b_norm = 0.0;
        for i in 0..a.color_histogram.len().min(b.color_histogram.len()) {
            let a_val = a.color_histogram[i] as f64;
            let b_val = b.color_histogram[i] as f64;
            dot_product += a_val * b_val;
            a_norm += a_val * a_val;
            b_norm += b_val * b_val;
        }
        if a_norm > 0.0 && b_norm > 0.0 {
            dot_product / (a_norm.sqrt() * b_norm.sqrt())
        } else {
            0.0
        }
    } else {
        0.0
    };

    // Weighted combination
    dim_similarity * 0.3 + hist_similarity * 0.7
}

/// Fuzzy string matching (Levenshtein distance based)
fn fuzzy_match(a: &str, b: &str) -> f64 {
    let distance = levenshtein_distance(a, b);
    let max_len = a.len().max(b.len()) as f64;
    if max_len == 0.0 {
        return 1.0;
    }
    1.0 - (distance as f64 / max_len)
}

fn levenshtein_distance(a: &str, b: &str) -> usize {
    let a_chars: Vec<char> = a.chars().collect();
    let b_chars: Vec<char> = b.chars().collect();
    let a_len = a_chars.len();
    let b_len = b_chars.len();

    if a_len == 0 {
        return b_len;
    }
    if b_len == 0 {
        return a_len;
    }

    let mut matrix = vec![vec![0; b_len + 1]; a_len + 1];

    for i in 0..=a_len {
        matrix[i][0] = i;
    }
    for j in 0..=b_len {
        matrix[0][j] = j;
    }

    for i in 1..=a_len {
        for j in 1..=b_len {
            let cost = if a_chars[i - 1] == b_chars[j - 1] { 0 } else { 1 };
            matrix[i][j] = (matrix[i - 1][j] + 1)
                .min(matrix[i][j - 1] + 1)
                .min(matrix[i - 1][j - 1] + cost);
        }
    }

    matrix[a_len][b_len]
}

/// Builder for creating smart locators
pub struct SmartLocatorBuilder {
    primary: Option<LocatorStrategy>,
    fallbacks: Vec<LocatorStrategy>,
    timeout_ms: u64,
    auto_heal: bool,
}

impl SmartLocatorBuilder {
    pub fn new() -> Self {
        Self {
            primary: None,
            fallbacks: vec![],
            timeout_ms: 10000,
            auto_heal: true,
        }
    }

    pub fn primary(mut self, strategy: LocatorStrategy) -> Self {
        self.primary = Some(strategy);
        self
    }

    pub fn fallback(mut self, strategy: LocatorStrategy) -> Self {
        self.fallbacks.push(strategy);
        self
    }

    pub fn timeout(mut self, ms: u64) -> Self {
        self.timeout_ms = ms;
        self
    }

    pub fn auto_heal(mut self, enabled: bool) -> Self {
        self.auto_heal = enabled;
        self
    }

    pub fn build(self) -> Result<SmartLocator> {
        let primary = self.primary.ok_or_else(|| {
            Error::InvalidCommand("Primary strategy required".to_string())
        })?;

        Ok(SmartLocator {
            primary,
            fallbacks: self.fallbacks,
            timeout_ms: self.timeout_ms,
            auto_heal: self.auto_heal,
            healing_history: vec![],
            last_successful_strategy: None,
            visual_fingerprint: None,
        })
    }
}

/// Convenience functions for common locator patterns
pub mod locators {
    use super::*;

    pub fn by_ref(ref_id: &str) -> SmartLocator {
        SmartLocatorBuilder::new()
            .primary(LocatorStrategy::Ref(ref_id.to_string()))
            .build()
            .unwrap()
    }

    pub fn by_text(text: &str) -> SmartLocator {
        SmartLocatorBuilder::new()
            .primary(LocatorStrategy::Text(text.to_string()))
            .fallback(LocatorStrategy::Semantic {
                role: "button".to_string(),
                name: text.to_string(),
            })
            .fallback(LocatorStrategy::AIVision(format!("button with text '{}'", text)))
            .build()
            .unwrap()
    }

    pub fn by_semantic(role: &str, name: Option<&str>) -> SmartLocator {
        SmartLocatorBuilder::new()
            .primary(LocatorStrategy::Semantic {
                role: role.to_string(),
                name: name.unwrap_or("").to_string(),
            })
            .fallback(LocatorStrategy::Text(name.unwrap_or("").to_string()))
            .build()
            .unwrap()
    }

    pub fn by_position(x: i32, y: i32) -> SmartLocator {
        SmartLocatorBuilder::new()
            .primary(LocatorStrategy::Position { x, y })
            .auto_heal(false)
            .build()
            .unwrap()
    }

    pub fn resilient(ref_id: &str, text: &str, role: &str) -> SmartLocator {
        SmartLocatorBuilder::new()
            .primary(LocatorStrategy::Ref(ref_id.to_string()))
            .fallback(LocatorStrategy::Text(text.to_string()))
            .fallback(LocatorStrategy::Semantic {
                role: role.to_string(),
                name: text.to_string(),
            })
            .fallback(LocatorStrategy::AIVision(format!("{} named '{}'", role, text)))
            .auto_heal(true)
            .build()
            .unwrap()
    }
}
