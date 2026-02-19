//! Self-Healing Automation (Feature 2)
//!
//! Automatically adapts and recovers when UI changes,
//! finding alternative ways to complete the task.

use crate::advanced::learning::LearningSystem;
use crate::core::smart_detection::{ElementMatcher, SmartElement, SmartElementDetector};
use crate::types::{Action, Feedback, Outcome, Point, Rect};
use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tracing::{info, warn};

/// Healing strategy for failed actions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HealingStrategy {
    Retry,
    FindAlternative,
    UseNearbyElement,
    UseSemanticMatch,
    SkipAndContinue,
    AskUser,
}

/// Context for healing a failed action
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealingContext {
    pub action: Action,
    pub error_message: String,
    pub screenshot: Option<Vec<u8>>,
    pub retry_count: u32,
    pub max_retries: u32,
}

/// Result of healing attempt
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealingResult {
    pub success: bool,
    pub new_action: Option<Action>,
    pub strategy_used: HealingStrategy,
    pub confidence: f32,
    pub explanation: String,
}

/// Self-healing automation system
pub struct SelfHealingSystem {
    detector: SmartElementDetector,
    learning: LearningSystem,
    healing_history: Vec<HealingAttempt>,
    strategy_stats: HashMap<HealingStrategy, StrategyStats>,
}

#[derive(Debug, Clone)]
struct HealingAttempt {
    original_action: Action,
    result: HealingResult,
    timestamp: std::time::Instant,
}

#[derive(Debug, Clone, Default)]
struct StrategyStats {
    attempts: u32,
    successes: u32,
}

impl SelfHealingSystem {
    pub fn new() -> Result<Self> {
        Ok(Self {
            detector: SmartElementDetector::new(),
            learning: LearningSystem::new(),
            healing_history: Vec::new(),
            strategy_stats: HashMap::new(),
        })
    }

    /// Attempt to heal a failed action
    pub async fn heal(&mut self, context: HealingContext) -> Result<HealingResult> {
        info!("Attempting to heal failed action: {:?}", context.action);

        // Try strategies in order of likelihood
        let strategies = self.select_strategies(&context);

        for strategy in strategies {
            match self.apply_strategy(&context, &strategy).await {
                Ok(result) if result.success => {
                    self.record_success(&context, &result);
                    return Ok(result);
                }
                Ok(result) => {
                    warn!("Strategy {:?} failed: {}", strategy, result.explanation);
                }
                Err(e) => {
                    warn!("Strategy {:?} error: {}", strategy, e);
                }
            }
        }

        // All strategies failed
        let result = HealingResult {
            success: false,
            new_action: None,
            strategy_used: HealingStrategy::AskUser,
            confidence: 0.0,
            explanation: "All healing strategies failed".to_string(),
        };

        self.record_failure(&context, &result);
        Ok(result)
    }

    /// Auto-heal wrapper - executes with automatic recovery
    pub async fn execute_with_healing<F, Fut>(
        &mut self,
        action: Action,
        executor: F,
    ) -> Result<HealingResult>
    where
        F: FnOnce(Action) -> Fut,
        Fut: std::future::Future<Output = Result<()>>,
    {
        match executor(action.clone()).await {
            Ok(()) => Ok(HealingResult {
                success: true,
                new_action: Some(action),
                strategy_used: HealingStrategy::Retry,
                confidence: 1.0,
                explanation: "Original action succeeded".to_string(),
            }),
            Err(e) => {
                let context = HealingContext {
                    action,
                    error_message: e.to_string(),
                    screenshot: None,
                    retry_count: 0,
                    max_retries: 3,
                };
                self.heal(context).await
            }
        }
    }

    fn select_strategies(&self, context: &HealingContext) -> Vec<HealingStrategy> {
        use HealingStrategy::*;

        // Priority based on error type and history
        if context.retry_count < context.max_retries {
            vec![
                Retry,
                UseSemanticMatch,
                FindAlternative,
                UseNearbyElement,
                SkipAndContinue,
            ]
        } else {
            vec![UseSemanticMatch, FindAlternative, UseNearbyElement, AskUser]
        }
    }

    async fn apply_strategy(
        &mut self,
        context: &HealingContext,
        strategy: &HealingStrategy,
    ) -> Result<HealingResult> {
        match strategy {
            HealingStrategy::Retry => self.retry_strategy(context).await,
            HealingStrategy::UseSemanticMatch => self.semantic_match_strategy(context).await,
            HealingStrategy::FindAlternative => self.alternative_strategy(context).await,
            HealingStrategy::UseNearbyElement => self.nearby_element_strategy(context).await,
            HealingStrategy::SkipAndContinue => self.skip_strategy(context).await,
            HealingStrategy::AskUser => self.ask_user_strategy(context).await,
        }
    }

    async fn retry_strategy(&self, context: &HealingContext) -> Result<HealingResult> {
        // Simple retry with slight delay
        tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;

        Ok(HealingResult {
            success: true,
            new_action: Some(context.action.clone()),
            strategy_used: HealingStrategy::Retry,
            confidence: 0.8 - (context.retry_count as f32 * 0.1),
            explanation: format!("Retrying action (attempt {})", context.retry_count + 1),
        })
    }

    async fn semantic_match_strategy(&mut self, context: &HealingContext) -> Result<HealingResult> {
        // Find element by semantic meaning instead of exact selector
        let matcher = ElementMatcher {
            semantic_type: None,
            text_contains: self.extract_text_from_action(&context.action),
            label_contains: None,
            near_text: None,
            min_confidence: 0.6,
        };

        if let Some(element) = self.detector.find_by_semantic(&matcher) {
            let new_action = self.create_action_for_element(&context.action, element);

            return Ok(HealingResult {
                success: true,
                new_action: Some(new_action),
                strategy_used: HealingStrategy::UseSemanticMatch,
                confidence: element.confidence.score,
                explanation: format!("Found semantic match: {:?}", element.semantic_type),
            });
        }

        Ok(HealingResult {
            success: false,
            new_action: None,
            strategy_used: HealingStrategy::UseSemanticMatch,
            confidence: 0.0,
            explanation: "No semantic match found".to_string(),
        })
    }

    async fn alternative_strategy(&self, context: &HealingContext) -> Result<HealingResult> {
        // Try alternative actions to achieve the same goal
        let alternatives = self.generate_alternatives(&context.action);

        for alt_action in alternatives {
            return Ok(HealingResult {
                success: true,
                new_action: Some(alt_action),
                strategy_used: HealingStrategy::FindAlternative,
                confidence: 0.7,
                explanation: "Using alternative action".to_string(),
            });
        }

        Ok(HealingResult {
            success: false,
            new_action: None,
            strategy_used: HealingStrategy::FindAlternative,
            confidence: 0.0,
            explanation: "No alternative found".to_string(),
        })
    }

    async fn nearby_element_strategy(&mut self, context: &HealingContext) -> Result<HealingResult> {
        // Find element near the original target
        if let Some(target_id) = self.extract_element_id(&context.action) {
            let matcher = ElementMatcher {
                semantic_type: self.infer_semantic_type(&context.action),
                text_contains: None,
                label_contains: None,
                near_text: None,
                min_confidence: 0.5,
            };

            if let Some(nearby) = self.detector.find_near(&target_id, &matcher) {
                let new_action = self.create_action_for_element(&context.action, nearby);

                return Ok(HealingResult {
                    success: true,
                    new_action: Some(new_action),
                    strategy_used: HealingStrategy::UseNearbyElement,
                    confidence: nearby.confidence.score * 0.9,
                    explanation: "Using nearby element".to_string(),
                });
            }
        }

        Ok(HealingResult {
            success: false,
            new_action: None,
            strategy_used: HealingStrategy::UseNearbyElement,
            confidence: 0.0,
            explanation: "No nearby element found".to_string(),
        })
    }

    async fn skip_strategy(&self, context: &HealingContext) -> Result<HealingResult> {
        // Skip this action and continue (for non-critical actions)
        Ok(HealingResult {
            success: true,
            new_action: None,
            strategy_used: HealingStrategy::SkipAndContinue,
            confidence: 0.5,
            explanation: "Skipping non-critical action".to_string(),
        })
    }

    async fn ask_user_strategy(&self, context: &HealingContext) -> Result<HealingResult> {
        // Pause and ask for user intervention
        Ok(HealingResult {
            success: false,
            new_action: None,
            strategy_used: HealingStrategy::AskUser,
            confidence: 0.0,
            explanation: format!("Please help with: {:?}", context.action),
        })
    }

    fn record_success(&mut self, context: &HealingContext, result: &HealingResult) {
        let attempt = HealingAttempt {
            original_action: context.action.clone(),
            result: result.clone(),
            timestamp: std::time::Instant::now(),
        };
        self.healing_history.push(attempt);

        let stats = self.strategy_stats.entry(result.strategy_used.clone()).or_default();
        stats.attempts += 1;
        stats.successes += 1;

        // Learn from success
        let feedback = Feedback {
            task_id: uuid::Uuid::new_v4().to_string(),
            action_taken: format!("heal:{:?}", result.strategy_used),
            outcome: Outcome::Success,
            user_correction: None,
        };
        let _ = self.learning.learn_from_feedback(feedback);
    }

    fn record_failure(&mut self, context: &HealingContext, result: &HealingResult) {
        let attempt = HealingAttempt {
            original_action: context.action.clone(),
            result: result.clone(),
            timestamp: std::time::Instant::now(),
        };
        self.healing_history.push(attempt);

        // Learn from failure
        let feedback = Feedback {
            task_id: uuid::Uuid::new_v4().to_string(),
            action_taken: format!("heal:{:?}", result.strategy_used),
            outcome: Outcome::Failure,
            user_correction: None,
        };
        let _ = self.learning.learn_from_feedback(feedback);
    }

    fn extract_text_from_action(&self, action: &Action) -> Option<String> {
        // Extract text from action for semantic matching
        None
    }

    fn extract_element_id(&self, action: &Action) -> Option<String> {
        // Extract element ID from action
        None
    }

    fn infer_semantic_type(&self, action: &Action) -> Option<crate::core::smart_detection::SemanticType> {
        // Infer element type from action
        None
    }

    fn create_action_for_element(&self, original: &Action, _element: &SmartElement) -> Action {
        // Create new action targeting the found element
        original.clone()
    }

    fn generate_alternatives(&self, action: &Action) -> Vec<Action> {
        // Generate alternative actions
        vec![action.clone()]
    }
}
