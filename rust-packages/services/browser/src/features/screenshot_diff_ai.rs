use serde::{Deserialize, Serialize};
use image::{DynamicImage, GenericImageView, Rgba};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScreenshotDiff {
    pub baseline_path: String,
    pub current_path: String,
    pub diff_path: String,
    pub overall_similarity: f64,
    pub regions: Vec<DiffRegion>,
    pub ai_analysis: Option<AIDiffAnalysis>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiffRegion {
    pub x: u32,
    pub y: u32,
    pub width: u32,
    pub height: u32,
    pub pixel_diff_percentage: f64,
    pub description: String,
    pub severity: DiffSeverity,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DiffSeverity {
    Critical,
    Major,
    Minor,
    Trivial,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIDiffAnalysis {
    pub summary: String,
    pub key_differences: Vec<String>,
    pub recommendations: Vec<String>,
    pub confidence: f64,
}

#[derive(Debug, Clone)]
pub struct ScreenshotDiffAI {
    llm_endpoint: Option<String>,
    model: Option<String>,
    similarity_threshold: f64,
}

impl ScreenshotDiffAI {
    pub fn new(similarity_threshold: f64) -> Self {
        Self {
            llm_endpoint: None,
            model: None,
            similarity_threshold,
        }
    }

    pub fn with_llm(mut self, endpoint: String, model: String) -> Self {
        self.llm_endpoint = Some(endpoint);
        self.model = Some(model);
        self
    }

    pub fn compare(&self, baseline: &DynamicImage, current: &DynamicImage) -> anyhow::Result<ScreenshotDiff> {
        let (width, height) = baseline.dimensions();
        let mut diff_image = DynamicImage::new_rgba8(width, height);
        
        let mut regions: Vec<DiffRegion> = Vec::new();
        let mut total_diff_pixels = 0;
        let region_size = 50;
        let mut region_diffs: HashMap<(u32, u32), (u32, u32)> = HashMap::new();

        for y in 0..height {
            for x in 0..width {
                let baseline_pixel = baseline.get_pixel(x, y);
                let current_pixel = current.get_pixel(x, y);

                if self.pixels_different(&baseline_pixel.0, &current_pixel.0) {
                    total_diff_pixels += 1;
                    let region_x = x / region_size;
                    let region_y = y / region_size;
                    let entry = region_diffs.entry((region_x, region_y)).or_insert((0, 0));
                    entry.0 += 1;
                    entry.1 += 1;
                    diff_image.put_pixel(x, y, Rgba([255, 0, 0, 255]));
                } else {
                    diff_image.put_pixel(x, y, Rgba([0, 0, 0, 0]));
                }
            }
        }

        let total_pixels = (width * height) as f64;
        let overall_similarity = 1.0 - (total_diff_pixels as f64 / total_pixels);

        for ((rx, ry), (diff_count, _)) in region_diffs {
            let region_pixels = (region_size * region_size) as f64;
            let diff_percentage = diff_count as f64 / region_pixels;
            
            let severity = if diff_percentage > 0.5 {
                DiffSeverity::Critical
            } else if diff_percentage > 0.3 {
                DiffSeverity::Major
            } else if diff_percentage > 0.1 {
                DiffSeverity::Minor
            } else {
                DiffSeverity::Trivial
            };

            regions.push(DiffRegion {
                x: rx * region_size,
                y: ry * region_size,
                width: region_size,
                height: region_size,
                pixel_diff_percentage: diff_percentage,
                description: format!("Region has {:.1}% differences", diff_percentage * 100.0),
                severity,
            });
        }

        regions.sort_by(|a, b| {
            let a_val = match a.severity {
                DiffSeverity::Critical => 4,
                DiffSeverity::Major => 3,
                DiffSeverity::Minor => 2,
                DiffSeverity::Trivial => 1,
            };
            let b_val = match b.severity {
                DiffSeverity::Critical => 4,
                DiffSeverity::Major => 3,
                DiffSeverity::Minor => 2,
                DiffSeverity::Trivial => 1,
            };
            b_val.cmp(&a_val)
        });

        Ok(ScreenshotDiff {
            baseline_path: String::new(),
            current_path: String::new(),
            diff_path: String::new(),
            overall_similarity,
            regions,
            ai_analysis: None,
        })
    }

    fn pixels_different(&self, p1: &[u8], p2: &[u8]) -> bool {
        let threshold = 30;
        let diff: u32 = p1.iter().zip(p2.iter())
            .map(|(a, b)| (*a as i32 - *b as i32).abs() as u32)
            .sum();
        diff > threshold
    }

    pub async fn analyze_with_ai(&self, diff: &ScreenshotDiff) -> anyhow::Result<AIDiffAnalysis> {
        if self.llm_endpoint.is_none() || self.model.is_none() {
            return Ok(AIDiffAnalysis {
                summary: "AI analysis not available - no LLM configured".to_string(),
                key_differences: diff.regions.iter().map(|r| r.description.clone()).collect(),
                recommendations: vec!["Consider configuring an LLM for better analysis".to_string()],
                confidence: 0.0,
            });
        }

        let prompt = format!(
            "Analyze the following screenshot comparison results:\n\n\
             Overall Similarity: {:.2}%\n\
             Number of different regions: {}\n\n\
             Regions with differences:\n{}\n\n\
             Provide a summary of what changed and recommendations.",
            diff.overall_similarity * 100.0,
            diff.regions.len(),
            diff.regions.iter()
                .map(|r| format!("  - {}: {}", 
                    serde_json::to_string(&r.severity).unwrap_or_default().replace('"', ""),
                    r.description))
                .collect::<Vec<_>>()
                .join("\n")
        );

        let client = reqwest::Client::new();
        let request_body = serde_json::json!({
            "model": self.model.as_ref().unwrap(),
            "messages": [
                {
                    "role": "system",
                    "content": "You are a visual regression testing expert. Analyze screenshot differences."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.3,
            "response_format": { "type": "json_object" }
        });

        let response = client
            .post(self.llm_endpoint.as_ref().unwrap())
            .json(&request_body)
            .send()
            .await?;

        let response_json: serde_json::Value = response.json().await?;
        let content = response_json["choices"][0]["message"]["content"]
            .as_str()
            .ok_or_else(|| anyhow::anyhow!("Invalid LLM response"))?;

        let ai_response: AIDiffAnalysis = serde_json::from_str(content)?;
        Ok(ai_response)
    }

    pub fn passes_threshold(&self, similarity: f64) -> bool {
        similarity >= self.similarity_threshold
    }

    pub fn generate_report(&self, diff: &ScreenshotDiff) -> String {
        let mut report = format!(
            "Screenshot Diff Report\n\
             ====================\n\n\
             Overall Similarity: {:.2}%\n\
             Threshold: {:.2}%\n\
             Result: {}\n\n",
            diff.overall_similarity * 100.0,
            self.similarity_threshold * 100.0,
            if self.passes_threshold(diff.overall_similarity) { "PASS" } else { "FAIL" }
        );

        if !diff.regions.is_empty() {
            report.push_str("Difference Regions:\n");
            for region in &diff.regions {
                report.push_str(&format!(
                    "  [{}] at ({}, {}) - {}x{}: {}\n",
                    serde_json::to_string(&region.severity).unwrap_or_default().replace('"', ""),
                    region.x, region.y, region.width, region.height,
                    region.description
                ));
            }
        }

        if let Some(ref ai) = diff.ai_analysis {
            report.push_str(&format!("\nAI Analysis:\n  Summary: {}\n  Confidence: {:.0}%\n", ai.summary, ai.confidence * 100.0));
            if !ai.key_differences.is_empty() {
                report.push_str("  Key Differences:\n");
                for diff in &ai.key_differences {
                    report.push_str(&format!("    - {}\n", diff));
                }
            }
        }

        report
    }
}
