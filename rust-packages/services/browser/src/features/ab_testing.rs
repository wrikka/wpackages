use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ABTest {
    pub id: String,
    pub name: String,
    pub description: String,
    pub variants: Vec<TestVariant>,
    pub traffic_allocation: TrafficAllocation,
    pub metrics: Vec<TestMetric>,
    pub status: TestStatus,
    pub start_date: DateTime<Utc>,
    pub end_date: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestVariant {
    pub id: String,
    pub name: String,
    pub description: String,
    pub traffic_percentage: f64,
    pub changes: Vec<VariantChange>,
    pub results: VariantResults,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VariantChange {
    pub change_type: ChangeType,
    pub selector: String,
    pub original_value: String,
    pub new_value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ChangeType {
    Text,
    Color,
    Layout,
    Image,
    ButtonText,
    Visibility,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VariantResults {
    pub impressions: u64,
    pub conversions: u64,
    pub conversion_rate: f64,
    pub custom_metrics: HashMap<String, f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrafficAllocation {
    pub total_visitors: u64,
    pub control_percentage: f64,
    pub variant_percentages: Vec<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestMetric {
    pub name: String,
    pub metric_type: MetricType,
    pub target_value: f64,
    pub higher_is_better: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MetricType {
    ConversionRate,
    ClickThroughRate,
    BounceRate,
    TimeOnPage,
    RevenuePerVisitor,
    Custom(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TestStatus {
    Draft,
    Running,
    Paused,
    Completed,
    Stopped,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ABTestResult {
    pub test_id: String,
    pub winner: Option<String>,
    pub confidence_level: f64,
    pub p_value: f64,
    pub is_statistically_significant: bool,
    pub uplift: f64,
    pub recommendation: String,
}

#[derive(Debug, Clone)]
pub struct AutomatedABTesting {
    tests: HashMap<String, ABTest>,
    visitor_assignments: HashMap<String, String>,
}

impl AutomatedABTesting {
    pub fn new() -> Self {
        Self {
            tests: HashMap::new(),
            visitor_assignments: HashMap::new(),
        }
    }

    pub fn create_test(&mut self, name: &str, description: &str, variants: Vec<TestVariant>, metrics: Vec<TestMetric>) -> ABTest {
        let test = ABTest {
            id: Uuid::new_v4().to_string(),
            name: name.to_string(),
            description: description.to_string(),
            variants,
            traffic_allocation: TrafficAllocation {
                total_visitors: 0,
                control_percentage: 50.0,
                variant_percentages: vec![50.0],
            },
            metrics,
            status: TestStatus::Draft,
            start_date: Utc::now(),
            end_date: None,
        };

        self.tests.insert(test.id.clone(), test.clone());
        test
    }

    pub fn start_test(&mut self, test_id: &str) -> anyhow::Result<()> {
        if let Some(test) = self.tests.get_mut(test_id) {
            if test.status == TestStatus::Draft || test.status == TestStatus::Paused {
                test.status = TestStatus::Running;
                Ok(())
            } else {
                Err(anyhow::anyhow!("Test cannot be started from current status: {:?}", test.status))
            }
        } else {
            Err(anyhow::anyhow!("Test not found: {}", test_id))
        }
    }

    pub fn pause_test(&mut self, test_id: &str) -> anyhow::Result<()> {
        if let Some(test) = self.tests.get_mut(test_id) {
            if test.status == TestStatus::Running {
                test.status = TestStatus::Paused;
                Ok(())
            } else {
                Err(anyhow::anyhow!("Only running tests can be paused"))
            }
        } else {
            Err(anyhow::anyhow!("Test not found: {}", test_id))
        }
    }

    pub fn stop_test(&mut self, test_id: &str) -> anyhow::Result<()> {
        if let Some(test) = self.tests.get_mut(test_id) {
            test.status = TestStatus::Stopped;
            test.end_date = Some(Utc::now());
            Ok(())
        } else {
            Err(anyhow::anyhow!("Test not found: {}", test_id))
        }
    }

    pub fn assign_visitor_to_variant(&mut self, test_id: &str, visitor_id: &str) -> Option<String> {
        let assignment_key = format!("{}:{}", test_id, visitor_id);
        
        if let Some(variant_id) = self.visitor_assignments.get(&assignment_key) {
            return Some(variant_id.clone());
        }

        let test = self.tests.get_mut(test_id)?;
        if test.status != TestStatus::Running {
            return None;
        }

        let random_value = rand::random::<f64>() * 100.0;
        let mut cumulative = 0.0;
        let mut assigned_variant = None;

        for variant in &test.variants {
            cumulative += variant.traffic_percentage;
            if random_value <= cumulative {
                assigned_variant = Some(variant.id.clone());
                break;
            }
        }

        if let Some(variant_id) = &assigned_variant {
            self.visitor_assignments.insert(assignment_key, variant_id.clone());
            
            if let Some(variant) = test.variants.iter_mut().find(|v| v.id == *variant_id) {
                variant.results.impressions += 1;
            }
            test.traffic_allocation.total_visitors += 1;
        }

        assigned_variant
    }

    pub fn record_conversion(&mut self, test_id: &str, variant_id: &str, metric_name: &str, value: f64) -> anyhow::Result<()> {
        let test = self.tests.get_mut(test_id)
            .ok_or_else(|| anyhow::anyhow!("Test not found"))?;

        let variant = test.variants.iter_mut()
            .find(|v| v.id == variant_id)
            .ok_or_else(|| anyhow::anyhow!("Variant not found"))?;

        if metric_name == "conversion" {
            variant.results.conversions += 1;
        }

        *variant.results.custom_metrics.entry(metric_name.to_string()).or_insert(0.0) += value;
        
        variant.results.conversion_rate = if variant.results.impressions > 0 {
            (variant.results.conversions as f64 / variant.results.impressions as f64) * 100.0
        } else {
            0.0
        };

        Ok(())
    }

    pub fn analyze_results(&self, test_id: &str) -> Option<ABTestResult> {
        let test = self.tests.get(test_id)?;
        
        if test.variants.len() < 2 {
            return None;
        }

        let control = &test.variants[0];
        let control_rate = control.results.conversion_rate;

        let mut best_variant = None;
        let mut best_uplift = 0.0;
        let mut p_value = 1.0;

        for variant in test.variants.iter().skip(1) {
            let variant_rate = variant.results.conversion_rate;
            
            if control_rate > 0.0 {
                let uplift = ((variant_rate - control_rate) / control_rate) * 100.0;
                
                if uplift > best_uplift {
                    best_uplift = uplift;
                    best_variant = Some(variant.id.clone());
                }
            }
        }

        let is_significant = p_value < 0.05;
        let confidence_level = if is_significant { 95.0 } else { 80.0 };

        let recommendation = if is_significant && best_uplift > 0.0 {
            format!("Implement variant '{}' with {:.2}% uplift", 
                best_variant.as_ref().unwrap(), best_uplift)
        } else if is_significant {
            "Keep control - no significant improvement".to_string()
        } else {
            "Continue test - need more data for significance".to_string()
        };

        Some(ABTestResult {
            test_id: test_id.to_string(),
            winner: best_variant,
            confidence_level,
            p_value,
            is_statistically_significant: is_significant,
            uplift: best_uplift,
            recommendation,
        })
    }

    pub fn get_test_report(&self, test_id: &str) -> Option<TestReport> {
        let test = self.tests.get(test_id)?;
        let analysis = self.analyze_results(test_id)?;

        Some(TestReport {
            test: test.clone(),
            analysis,
            duration_days: test.end_date.map(|end| {
                end.signed_duration_since(test.start_date).num_days()
            }).unwrap_or_else(|| {
                Utc::now().signed_duration_since(test.start_date).num_days()
            }),
        })
    }

    pub fn list_tests(&self, status: Option<TestStatus>) -> Vec<&ABTest> {
        self.tests.values()
            .filter(|t| status.as_ref().map(|s| std::mem::discriminant(s) == std::mem::discriminant(&t.status)).unwrap_or(true))
            .collect()
    }

    pub fn get_test(&self, test_id: &str) -> Option<&ABTest> {
        self.tests.get(test_id)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestReport {
    pub test: ABTest,
    pub analysis: ABTestResult,
    pub duration_days: i64,
}
