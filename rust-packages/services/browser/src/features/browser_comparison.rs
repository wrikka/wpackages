use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrowserComparisonConfig {
    pub browsers: Vec<BrowserConfig>,
    pub test_scenarios: Vec<TestScenario>,
    pub metrics_to_collect: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrowserConfig {
    pub name: String,
    pub browser_type: BrowserType,
    pub version: String,
    pub user_agent: String,
    pub viewport: ViewportConfig,
    pub launch_options: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BrowserType {
    Chrome,
    Firefox,
    Safari,
    Edge,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ViewportConfig {
    pub width: u32,
    pub height: u32,
    pub device_scale_factor: f64,
    pub is_mobile: bool,
    pub has_touch: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestScenario {
    pub id: String,
    pub name: String,
    pub url: String,
    pub actions: Vec<TestAction>,
    pub assertions: Vec<TestAssertion>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestAction {
    pub action_type: String,
    pub selector: Option<String>,
    pub value: Option<String>,
    pub wait_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestAssertion {
    pub assertion_type: String,
    pub selector: Option<String>,
    pub expected_value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComparisonResult {
    pub browser_name: String,
    pub scenario_id: String,
    pub timestamp: DateTime<Utc>,
    pub success: bool,
    pub metrics: BrowserMetrics,
    pub screenshots: Vec<String>,
    pub errors: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrowserMetrics {
    pub load_time_ms: u64,
    pub dom_content_loaded_ms: u64,
    pub first_paint_ms: Option<u64>,
    pub first_contentful_paint_ms: Option<u64>,
    pub largest_contentful_paint_ms: Option<u64>,
    pub total_transfer_size: u64,
    pub request_count: u32,
    pub memory_usage_mb: Option<f64>,
}

#[derive(Debug, Clone)]
pub struct BrowserComparison {
    config: BrowserComparisonConfig,
    results: Vec<ComparisonResult>,
}

impl BrowserComparison {
    pub fn new(config: BrowserComparisonConfig) -> Self {
        Self {
            config,
            results: Vec::new(),
        }
    }

    pub async fn run_comparison(&mut self) -> anyhow::Result<Vec<ComparisonResult>> {
        let mut all_results = Vec::new();

        for browser in &self.config.browsers {
            for scenario in &self.config.test_scenarios {
                let result = self.run_scenario(browser, scenario).await?;
                all_results.push(result);
            }
        }

        self.results = all_results.clone();
        Ok(all_results)
    }

    async fn run_scenario(
        &self,
        browser: &BrowserConfig,
        scenario: &TestScenario,
    ) -> anyhow::Result<ComparisonResult> {
        let start_time = Utc::now();
        let mut errors = Vec::new();
        let mut screenshots = Vec::new();

        let metrics = BrowserMetrics {
            load_time_ms: 0,
            dom_content_loaded_ms: 0,
            first_paint_ms: None,
            first_contentful_paint_ms: None,
            largest_contentful_paint_ms: None,
            total_transfer_size: 0,
            request_count: 0,
            memory_usage_mb: None,
        };

        let success = errors.is_empty();

        Ok(ComparisonResult {
            browser_name: browser.name.clone(),
            scenario_id: scenario.id.clone(),
            timestamp: start_time,
            success,
            metrics,
            screenshots,
            errors,
        })
    }

    pub fn generate_report(&self) -> BrowserComparisonReport {
        let mut browser_summaries: HashMap<String, BrowserSummary> = HashMap::new();

        for result in &self.results {
            let summary = browser_summaries
                .entry(result.browser_name.clone())
                .or_insert_with(|| BrowserSummary {
                    browser_name: result.browser_name.clone(),
                    total_tests: 0,
                    passed_tests: 0,
                    failed_tests: 0,
                    average_load_time_ms: 0.0,
                    total_transfer_size: 0,
                });

            summary.total_tests += 1;
            if result.success {
                summary.passed_tests += 1;
            } else {
                summary.failed_tests += 1;
            }
            summary.total_transfer_size += result.metrics.total_transfer_size;
        }

        for summary in browser_summaries.values_mut() {
            let browser_results: Vec<&ComparisonResult> = self.results
                .iter()
                .filter(|r| r.browser_name == summary.browser_name)
                .collect();
            
            let total_load: u64 = browser_results.iter().map(|r| r.metrics.load_time_ms).sum();
            if !browser_results.is_empty() {
                summary.average_load_time_ms = total_load as f64 / browser_results.len() as f64;
            }
        }

        BrowserComparisonReport {
            timestamp: Utc::now(),
            browser_count: self.config.browsers.len(),
            scenario_count: self.config.test_scenarios.len(),
            results: self.results.clone(),
            summaries: browser_summaries.into_values().collect(),
        }
    }

    pub fn compare_browsers(&self, browser1: &str, browser2: &str) -> Option<BrowserDiff> {
        let results1: Vec<&ComparisonResult> = self.results
            .iter()
            .filter(|r| r.browser_name == browser1)
            .collect();
        let results2: Vec<&ComparisonResult> = self.results
            .iter()
            .filter(|r| r.browser_name == browser2)
            .collect();

        if results1.is_empty() || results2.is_empty() {
            return None;
        }

        let avg_load1 = results1.iter().map(|r| r.metrics.load_time_ms).sum::<u64>() as f64 / results1.len() as f64;
        let avg_load2 = results2.iter().map(|r| r.metrics.load_time_ms).sum::<u64>() as f64 / results2.len() as f64;

        let avg_size1 = results1.iter().map(|r| r.metrics.total_transfer_size).sum::<u64>() as f64 / results1.len() as f64;
        let avg_size2 = results2.iter().map(|r| r.metrics.total_transfer_size).sum::<u64>() as f64 / results2.len() as f64;

        Some(BrowserDiff {
            browser1: browser1.to_string(),
            browser2: browser2.to_string(),
            load_time_diff_ms: avg_load1 - avg_load2,
            size_diff_bytes: (avg_size1 - avg_size2) as i64,
            success_rate_diff: self.calculate_success_rate_diff(&results1, &results2),
        })
    }

    fn calculate_success_rate_diff(
        &self,
        results1: &[&ComparisonResult],
        results2: &[&ComparisonResult],
    ) -> f64 {
        let success1 = results1.iter().filter(|r| r.success).count() as f64 / results1.len().max(1) as f64;
        let success2 = results2.iter().filter(|r| r.success).count() as f64 / results2.len().max(1) as f64;
        success1 - success2
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrowserComparisonReport {
    pub timestamp: DateTime<Utc>,
    pub browser_count: usize,
    pub scenario_count: usize,
    pub results: Vec<ComparisonResult>,
    pub summaries: Vec<BrowserSummary>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrowserSummary {
    pub browser_name: String,
    pub total_tests: u32,
    pub passed_tests: u32,
    pub failed_tests: u32,
    pub average_load_time_ms: f64,
    pub total_transfer_size: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrowserDiff {
    pub browser1: String,
    pub browser2: String,
    pub load_time_diff_ms: f64,
    pub size_diff_bytes: i64,
    pub success_rate_diff: f64,
}
