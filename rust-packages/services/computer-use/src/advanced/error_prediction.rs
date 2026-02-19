//! Error Prediction (Feature 7)
//!
//! AI-powered prediction of which actions are likely to fail before execution

use crate::advanced::learning::LearningSystem;
use crate::types::{Action, Pattern};
use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Risk level for action execution
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    Critical,
}

/// Prediction result for an action
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorPrediction {
    pub action: Action,
    pub risk_level: RiskLevel,
    pub failure_probability: f32,
    pub predicted_error: Option<String>,
    pub confidence: f32,
    pub contributing_factors: Vec<RiskFactor>,
    pub suggested_preventions: Vec<String>,
    pub similar_failures: Vec<PastFailure>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskFactor {
    pub factor: String,
    pub impact: f32,
    pub category: RiskCategory,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RiskCategory {
    UiChange,
    Timing,
    Permissions,
    Network,
    State,
    ElementNotFound,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PastFailure {
    pub action_type: String,
    pub error_message: String,
    pub context: String,
    pub timestamp: u64,
}

/// Error prediction engine
pub struct ErrorPredictionEngine {
    learning: LearningSystem,
    risk_models: HashMap<String, RiskModel>,
    failure_history: Vec<FailureRecord>,
    context_analyzer: ContextAnalyzer,
}

#[derive(Debug, Clone)]
struct RiskModel {
    action_pattern: Pattern,
    failure_rate: f32,
    typical_errors: Vec<String>,
}

#[derive(Debug, Clone)]
struct FailureRecord {
    action: Action,
    error: String,
    context: ExecutionContext,
    timestamp: u64,
}

#[derive(Debug, Clone, Default)]
struct ExecutionContext {
    pub active_app: Option<String>,
    pub window_title: Option<String>,
    pub recent_actions: Vec<String>,
    pub system_state: HashMap<String, String>,
}

struct ContextAnalyzer;

impl ErrorPredictionEngine {
    pub fn new() -> Self {
        Self {
            learning: LearningSystem::new(),
            risk_models: HashMap::new(),
            failure_history: Vec::new(),
            context_analyzer: ContextAnalyzer,
        }
    }

    /// Predict if an action will fail
    pub async fn predict(&self, action: &Action, context: &ExecutionContext) -> Result<ErrorPrediction> {
        // 1. Analyze action-specific risks
        let action_risks = self.analyze_action_risks(action);
        
        // 2. Check historical failure patterns
        let similar_failures = self.find_similar_failures(action);
        
        // 3. Analyze current context risks
        let context_risks = self.context_analyzer.analyze(context);
        
        // 4. Combine all risk factors
        let all_factors: Vec<RiskFactor> = action_risks
            .into_iter()
            .chain(context_risks)
            .collect();

        // 5. Calculate overall failure probability
        let failure_prob = self.calculate_failure_probability(&all_factors, &similar_failures);
        
        // 6. Determine risk level
        let risk_level = self.probability_to_risk_level(failure_prob);

        // 7. Generate predictions and suggestions
        let predicted_error = self.predict_error_type(&all_factors);
        let suggestions = self.generate_preventions(&all_factors, failure_prob);

        Ok(ErrorPrediction {
            action: action.clone(),
            risk_level,
            failure_probability: failure_prob,
            predicted_error,
            confidence: self.calculate_confidence(&all_factors),
            contributing_factors: all_factors,
            suggested_preventions: suggestions,
            similar_failures,
        })
    }

    /// Predict for multiple actions
    pub async fn predict_batch(&self, actions: &[Action], context: &ExecutionContext) -> Vec<Result<ErrorPrediction>> {
        let mut results = Vec::new();
        for action in actions {
            results.push(self.predict(action, context).await);
        }
        results
    }

    /// Check if action is safe to execute
    pub async fn is_safe(&self, action: &Action, context: &ExecutionContext) -> Result<bool> {
        let prediction = self.predict(action, context).await?;
        Ok(prediction.risk_level <= RiskLevel::Medium)
    }

    /// Get high-risk actions requiring attention
    pub async fn get_risky_actions(&self, actions: &[Action], context: &ExecutionContext) -> Vec<ErrorPrediction> {
        let mut risky = Vec::new();
        
        for action in actions {
            if let Ok(prediction) = self.predict(action, context).await {
                if prediction.risk_level >= RiskLevel::High {
                    risky.push(prediction);
                }
            }
        }
        
        risky
    }

    /// Record actual failure for learning
    pub fn record_failure(&mut self, action: &Action, error: &str, context: &ExecutionContext) {
        let record = FailureRecord {
            action: action.clone(),
            error: error.to_string(),
            context: context.clone(),
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
        };
        
        self.failure_history.push(record);
        self.update_risk_models();
    }

    /// Record successful execution
    pub fn record_success(&mut self, action: &Action, context: &ExecutionContext) {
        // Update success patterns
        let _ = self.learning.learn_from_feedback(crate::types::Feedback {
            task_id: uuid::Uuid::new_v4().to_string(),
            action_taken: format!("{:?}", action),
            outcome: crate::types::Outcome::Success,
            user_correction: None,
        });
    }

    fn analyze_action_risks(&self, action: &Action) -> Vec<RiskFactor> {
        let mut risks = Vec::new();

        // Check for common risky patterns
        match action {
            Action::Click => {
                risks.push(RiskFactor {
                    factor: "Element click may fail if element moves".to_string(),
                    impact: 0.3,
                    category: RiskCategory::ElementNotFound,
                });
            }
            Action::Type => {
                risks.push(RiskFactor {
                    factor: "Typing may fail if element loses focus".to_string(),
                    impact: 0.2,
                    category: RiskCategory::Timing,
                });
            }
            Action::Launch => {
                risks.push(RiskFactor {
                    factor: "App launch may fail if not installed".to_string(),
                    impact: 0.4,
                    category: RiskCategory::Unknown,
                });
            }
            _ => {}
        }

        risks
    }

    fn find_similar_failures(&self, action: &Action) -> Vec<PastFailure> {
        let action_type = format!("{:?}", action);
        
        self.failure_history
            .iter()
            .filter(|r| format!("{:?}", r.action) == action_type)
            .map(|r| PastFailure {
                action_type: action_type.clone(),
                error_message: r.error.clone(),
                context: format!("{:?}", r.context.active_app),
                timestamp: r.timestamp,
            })
            .take(5)
            .collect()
    }

    fn calculate_failure_probability(&self, factors: &[RiskFactor], past_failures: &[PastFailure]) -> f32 {
        let base_prob: f32 = factors.iter().map(|f| f.impact).sum();
        let history_factor = if past_failures.len() >= 3 {
            0.3
        } else if past_failures.len() >= 1 {
            0.15
        } else {
            0.0
        };

        (base_prob + history_factor).min(0.99)
    }

    fn calculate_confidence(&self, factors: &[RiskFactor]) -> f32 {
        let known_factors = factors.iter().filter(|f| f.category != RiskCategory::Unknown).count();
        let total = factors.len().max(1);
        
        (known_factors as f32 / total as f32).min(0.95)
    }

    fn probability_to_risk_level(&self, prob: f32) -> RiskLevel {
        if prob < 0.2 {
            RiskLevel::Low
        } else if prob < 0.5 {
            RiskLevel::Medium
        } else if prob < 0.8 {
            RiskLevel::High
        } else {
            RiskLevel::Critical
        }
    }

    fn predict_error_type(&self, factors: &[RiskFactor]) -> Option<String> {
        factors
            .iter()
            .max_by(|a, b| a.impact.partial_cmp(&b.impact).unwrap())
            .map(|f| format!("{:?}: {}", f.category, f.factor))
    }

    fn generate_preventions(&self, factors: &[RiskFactor], _failure_prob: f32) -> Vec<String> {
        factors
            .iter()
            .filter(|f| f.impact > 0.3)
            .map(|f| format!("Consider: {}", self.suggestion_for_factor(f)))
            .collect()
    }

    fn suggestion_for_factor(&self, factor: &RiskFactor) -> String {
        match factor.category {
            RiskCategory::UiChange => "Add element verification before action".to_string(),
            RiskCategory::Timing => "Add explicit wait condition".to_string(),
            RiskCategory::Permissions => "Check and request permissions first".to_string(),
            RiskCategory::Network => "Add retry logic for network operations".to_string(),
            RiskCategory::State => "Verify application state before action".to_string(),
            RiskCategory::ElementNotFound => "Use smart element detection with fallback".to_string(),
            RiskCategory::Unknown => factor.factor.clone(),
        }
    }

    fn update_risk_models(&mut self) {
        // Update risk models based on recent failures
        for record in &self.failure_history {
            let key = format!("{:?}", record.action);
            let model = self.risk_models.entry(key.clone()).or_insert(RiskModel {
                action_pattern: Pattern { name: key, occurrences: 0 },
                failure_rate: 0.0,
                typical_errors: Vec::new(),
            });
            
            model.action_pattern.occurrences += 1;
            if !model.typical_errors.contains(&record.error) {
                model.typical_errors.push(record.error.clone());
            }
        }
    }
}

impl ContextAnalyzer {
    fn analyze(&self, context: &ExecutionContext) -> Vec<RiskFactor> {
        let mut risks = Vec::new();

        // Check for unstable system state
        if context.active_app.is_none() {
            risks.push(RiskFactor {
                factor: "No active application detected".to_string(),
                impact: 0.5,
                category: RiskCategory::State,
            });
        }

        // Check for recent errors
        if context.recent_actions.len() > 10 {
            risks.push(RiskFactor {
                factor: "Many recent actions, may be in unstable state".to_string(),
                impact: 0.2,
                category: RiskCategory::State,
            });
        }

        risks
    }
}
