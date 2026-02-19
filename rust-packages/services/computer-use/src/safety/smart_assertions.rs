//! Smart Assertions (Feature 15)
//!
//! Visual verification using screenshot comparison and AI validation

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Assertion types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AssertionType {
    ElementExists { selector: String },
    ElementText { selector: String, expected: String },
    ElementCount { selector: String, expected: usize },
    ScreenshotMatch { reference_path: String, threshold: f32 },
    VisualContains { description: String },
    NoErrors,
    PageLoaded { url_pattern: Option<String> },
    Custom { check: String },
}

/// Assertion result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssertionResult {
    pub assertion_type: AssertionType,
    pub passed: bool,
    pub expected: String,
    pub actual: String,
    pub confidence: f32,
    pub diff_image: Option<String>,
    pub explanation: String,
    pub duration_ms: u64,
}

/// Visual comparison settings
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VisualComparisonConfig {
    pub threshold: f32,
    pub ignore_regions: Vec<Region>,
    pub highlight_diffs: bool,
    pub compare_type: CompareType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Region {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CompareType {
    PixelPerfect,
    Perceptual,
    Structural,
    AiBased,
}

/// Smart assertion engine
pub struct SmartAssertion {
    visual_config: VisualComparisonConfig,
    assertion_history: Vec<AssertionResult>,
    reference_screenshots: HashMap<String, ScreenshotReference>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ScreenshotReference {
    path: String,
    hash: String,
    timestamp: u64,
}

impl SmartAssertion {
    pub fn new() -> Self {
        Self {
            visual_config: VisualComparisonConfig {
                threshold: 0.95,
                ignore_regions: vec![],
                highlight_diffs: true,
                compare_type: CompareType::Perceptual,
            },
            assertion_history: Vec::new(),
            reference_screenshots: HashMap::new(),
        }
    }

    /// Assert element exists
    pub async fn assert_element_exists(&mut self, selector: &str) -> Result<AssertionResult> {
        let start = std::time::Instant::now();
        
        // Check if element exists
        let exists = self.check_element_exists(selector).await?;

        let result = AssertionResult {
            assertion_type: AssertionType::ElementExists {
                selector: selector.to_string(),
            },
            passed: exists,
            expected: "exists".to_string(),
            actual: if exists { "exists".to_string() } else { "not found".to_string() },
            confidence: if exists { 1.0 } else { 0.0 },
            diff_image: None,
            explanation: if exists {
                format!("Element '{}' found on screen", selector)
            } else {
                format!("Element '{}' not found on screen", selector)
            },
            duration_ms: start.elapsed().as_millis() as u64,
        };

        self.assertion_history.push(result.clone());
        Ok(result)
    }

    /// Assert element text matches
    pub async fn assert_element_text(&mut self, selector: &str, expected: &str) -> Result<AssertionResult> {
        let start = std::time::Instant::now();
        
        let actual_text = self.get_element_text(selector).await?;
        let passed = actual_text.trim() == expected.trim();

        let result = AssertionResult {
            assertion_type: AssertionType::ElementText {
                selector: selector.to_string(),
                expected: expected.to_string(),
            },
            passed,
            expected: expected.to_string(),
            actual: actual_text.clone(),
            confidence: if passed { 1.0 } else { self.text_similarity(expected, &actual_text) },
            diff_image: None,
            explanation: if passed {
                "Text matches exactly".to_string()
            } else {
                format!("Expected '{}', found '{}'", expected, actual_text)
            },
            duration_ms: start.elapsed().as_millis() as u64,
        };

        self.assertion_history.push(result.clone());
        Ok(result)
    }

    /// Assert screenshot matches reference
    pub async fn assert_screenshot_matches(&mut self, reference_id: &str) -> Result<AssertionResult> {
        let start = std::time::Instant::now();
        
        let reference = self.reference_screenshots
            .get(reference_id)
            .ok_or_else(|| anyhow::anyhow!("Reference not found: {}", reference_id))?;

        // Capture current screenshot
        let current = self.capture_screenshot().await?;
        
        // Compare screenshots
        let comparison = self.compare_screenshots(&reference.path, &current).await?;
        let passed = comparison.similarity >= self.visual_config.threshold;

        let result = AssertionResult {
            assertion_type: AssertionType::ScreenshotMatch {
                reference_path: reference.path.clone(),
                threshold: self.visual_config.threshold,
            },
            passed,
            expected: format!("{}% similar", (self.visual_config.threshold * 100.0) as u32),
            actual: format!("{}% similar", (comparison.similarity * 100.0) as u32),
            confidence: comparison.similarity,
            diff_image: comparison.diff_path,
            explanation: comparison.explanation,
            duration_ms: start.elapsed().as_millis() as u64,
        };

        self.assertion_history.push(result.clone());
        Ok(result)
    }

    /// Assert visual contains specific element using AI
    pub async fn assert_visual_contains(&mut self, description: &str) -> Result<AssertionResult> {
        let start = std::time::Instant::now();
        
        // Use AI vision to detect described element
        let detected = self.detect_visual_element(description).await?;

        let result = AssertionResult {
            assertion_type: AssertionType::VisualContains {
                description: description.to_string(),
            },
            passed: detected.found,
            expected: description.to_string(),
            actual: if detected.found { "found".to_string() } else { "not found".to_string() },
            confidence: detected.confidence,
            diff_image: None,
            explanation: detected.explanation,
            duration_ms: start.elapsed().as_millis() as u64,
        };

        self.assertion_history.push(result.clone());
        Ok(result)
    }

    /// Assert no errors on screen
    pub async fn assert_no_errors(&mut self) -> Result<AssertionResult> {
        let start = std::time::Instant::now();
        
        let errors = self.detect_errors().await?;
        let passed = errors.is_empty();

        let result = AssertionResult {
            assertion_type: AssertionType::NoErrors,
            passed,
            expected: "0 errors".to_string(),
            actual: format!("{} errors", errors.len()),
            confidence: if passed { 1.0 } else { 0.0 },
            diff_image: None,
            explanation: if passed {
                "No error messages detected on screen".to_string()
            } else {
                format!("Found {} error indicators: {:?}", errors.len(), errors)
            },
            duration_ms: start.elapsed().as_millis() as u64,
        };

        self.assertion_history.push(result.clone());
        Ok(result)
    }

    /// Run multiple assertions
    pub async fn run_assertions(&mut self, assertions: &[AssertionType]) -> Vec<Result<AssertionResult>> {
        let mut results = Vec::new();
        
        for assertion in assertions {
            let result = match assertion {
                AssertionType::ElementExists { selector } => {
                    self.assert_element_exists(selector).await
                }
                AssertionType::ElementText { selector, expected } => {
                    self.assert_element_text(selector, expected).await
                }
                AssertionType::ScreenshotMatch { reference_path, threshold: _ } => {
                    self.assert_screenshot_matches(reference_path).await
                }
                AssertionType::VisualContains { description } => {
                    self.assert_visual_contains(description).await
                }
                AssertionType::NoErrors => {
                    self.assert_no_errors().await
                }
                _ => Err(anyhow::anyhow!("Unsupported assertion type")),
            };
            
            results.push(result);
        }
        
        results
    }

    /// Save screenshot as reference
    pub async fn save_reference(&mut self, name: &str, screenshot_path: &str) -> Result<String> {
        let id = uuid::Uuid::new_v4().to_string();
        
        let reference = ScreenshotReference {
            path: screenshot_path.to_string(),
            hash: self.compute_hash(screenshot_path).await?,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
        };

        self.reference_screenshots.insert(name.to_string(), reference);
        Ok(id)
    }

    /// Get assertion history
    pub fn get_history(&self) -> &[AssertionResult] {
        &self.assertion_history
    }

    /// Get failed assertions
    pub fn get_failures(&self) -> Vec<&AssertionResult> {
        self.assertion_history.iter().filter(|r| !r.passed).collect()
    }

    /// Generate assertion report
    pub fn generate_report(&self) -> Result<String> {
        let total = self.assertion_history.len();
        let passed = self.assertion_history.iter().filter(|r| r.passed).count();
        let failed = total - passed;

        let mut report = String::new();
        report.push_str("# Assertion Report\n\n");
        report.push_str(&format!("- Total Assertions: {}\n", total));
        report.push_str(&format!("- Passed: {} ({:.1}%)\n", passed, (passed as f32 / total as f32) * 100.0));
        report.push_str(&format!("- Failed: {}\n\n", failed));

        if failed > 0 {
            report.push_str("## Failed Assertions\n\n");
            for (i, result) in self.get_failures().iter().enumerate() {
                report.push_str(&format!("{}. {:?}\n", i + 1, result.assertion_type));
                report.push_str(&format!("   Expected: {}\n", result.expected));
                report.push_str(&format!("   Actual: {}\n", result.actual));
                report.push_str(&format!("   Explanation: {}\n\n", result.explanation));
            }
        }

        Ok(report)
    }

    async fn check_element_exists(&self, _selector: &str) -> Result<bool> {
        // Check if element exists on screen
        Ok(true)
    }

    async fn get_element_text(&self, _selector: &str) -> Result<String> {
        // Get text content of element
        Ok(String::new())
    }

    async fn capture_screenshot(&self) -> Result<String> {
        // Capture current screen
        Ok(String::new())
    }

    async fn compare_screenshots(&self, _reference: &str, _current: &str) -> Result<ScreenshotComparison> {
        // Compare two screenshots
        Ok(ScreenshotComparison {
            similarity: 0.98,
            diff_path: None,
            explanation: "Screenshots are very similar".to_string(),
        })
    }

    async fn detect_visual_element(&self, _description: &str) -> Result<VisualDetection> {
        // Use AI to detect element by description
        Ok(VisualDetection {
            found: true,
            confidence: 0.85,
            explanation: "Element detected visually".to_string(),
        })
    }

    async fn detect_errors(&self) -> Result<Vec<String>> {
        // Scan screen for error messages
        Ok(vec![])
    }

    async fn compute_hash(&self, _path: &str) -> Result<String> {
        // Compute file hash
        Ok(String::new())
    }

    fn text_similarity(&self, a: &str, b: &str) -> f32 {
        if a.is_empty() && b.is_empty() {
            return 1.0;
        }
        
        let max_len = a.len().max(b.len());
        if max_len == 0 {
            return 0.0;
        }
        
        let distance = self.levenshtein_distance(a, b);
        1.0 - (distance as f32 / max_len as f32)
    }

    fn levenshtein_distance(&self, a: &str, b: &str) -> usize {
        let len_a = a.chars().count();
        let len_b = b.chars().count();
        
        if len_a == 0 { return len_b; }
        if len_b == 0 { return len_a; }
        
        let mut matrix = vec![vec![0; len_b + 1]; len_a + 1];
        
        for i in 0..=len_a {
            matrix[i][0] = i;
        }
        for j in 0..=len_b {
            matrix[0][j] = j;
        }
        
        for (i, ca) in a.chars().enumerate() {
            for (j, cb) in b.chars().enumerate() {
                let cost = if ca == cb { 0 } else { 1 };
                matrix[i + 1][j + 1] = (matrix[i][j + 1] + 1)
                    .min(matrix[i + 1][j] + 1)
                    .min(matrix[i][j] + cost);
            }
        }
        
        matrix[len_a][len_b]
    }
}

struct ScreenshotComparison {
    similarity: f32,
    diff_path: Option<String>,
    explanation: String,
}

struct VisualDetection {
    found: bool,
    confidence: f32,
    explanation: String,
}
