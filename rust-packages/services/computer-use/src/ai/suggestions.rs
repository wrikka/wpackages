//! AI Suggestion Engine
//!
//! Proactively suggests next actions based on current context.

use crate::error::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

/// AI Suggestion Engine
pub struct SuggestionEngine {
    context_history: Arc<Mutex<Vec<ContextSnapshot>>>,
    patterns: Arc<Mutex<HashMap<String, ActionPattern>>>,
    user_preferences: Arc<Mutex<UserPreferences>>,
    llm_client: Option<Box<dyn LLMClient>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextSnapshot {
    pub timestamp: u64,
    pub active_window: WindowInfo,
    pub recent_actions: Vec<String>,
    pub clipboard_content: Option<String>,
    pub focused_element: Option<ElementInfo>,
    pub screen_text: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowInfo {
    pub title: String,
    pub app_name: String,
    pub process_id: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElementInfo {
    pub element_type: String,
    pub text: Option<String>,
    pub location: (i32, i32),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionPattern {
    pub id: String,
    pub name: String,
    pub trigger_conditions: Vec<TriggerCondition>,
    pub suggested_action: SuggestedAction,
    pub confidence_threshold: f64,
    pub usage_count: u64,
    pub success_rate: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TriggerCondition {
    ActiveWindow { title_pattern: String },
    ElementFocused { element_type: String, text_pattern: Option<String> },
    ClipboardContent { pattern: String },
    RecentActions { actions: Vec<String> },
    TimeOfDay { start_hour: u32, end_hour: u32 },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SuggestedAction {
    pub action_type: String,
    pub description: String,
    pub params: HashMap<String, serde_json::Value>,
    pub reason: String,
    pub confidence: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserPreferences {
    pub dismissed_suggestions: Vec<String>,
    pub favorite_actions: Vec<String>,
    pub notification_enabled: bool,
    pub min_confidence: f64,
    pub max_suggestions: usize,
}

#[async_trait::async_trait]
pub trait LLMClient: Send + Sync {
    async fn analyze_context(&self, context: &ContextSnapshot) -> Result<Vec<SuggestedAction>>;
}

impl SuggestionEngine {
    pub fn new() -> Self {
        Self {
            context_history: Arc::new(Mutex::new(vec![])),
            patterns: Arc::new(Mutex::new(HashMap::new())),
            user_preferences: Arc::new(Mutex::new(UserPreferences {
                dismissed_suggestions: vec![],
                favorite_actions: vec![],
                notification_enabled: true,
                min_confidence: 0.7,
                max_suggestions: 3,
            })),
            llm_client: None,
        }
    }

    pub fn with_llm(mut self, client: Box<dyn LLMClient>) -> Self {
        self.llm_client = Some(client);
        self
    }

    /// Update current context
    pub async fn update_context(&self, context: ContextSnapshot) -> Vec<SuggestedAction> {
        // Store context
        self.context_history.lock().await.push(context.clone());
        
        // Keep only last 100 snapshots
        let mut history = self.context_history.lock().await;
        if history.len() > 100 {
            *history = history.split_off(history.len() - 100);
        }
        drop(history);

        // Generate suggestions
        let mut suggestions = vec![];

        // Pattern-based suggestions
        let pattern_suggestions = self.check_patterns(&context).await;
        suggestions.extend(pattern_suggestions);

        // LLM-based suggestions
        if let Some(ref client) = self.llm_client {
            if let Ok(llm_suggestions) = client.analyze_context(&context).await {
                suggestions.extend(llm_suggestions);
            }
        }

        // Sort by confidence and filter
        let prefs = self.user_preferences.lock().await;
        suggestions.sort_by(|a, b| b.confidence.partial_cmp(&a.confidence).unwrap());
        suggestions.retain(|s| s.confidence >= prefs.min_confidence);
        suggestions.truncate(prefs.max_suggestions);

        suggestions
    }

    /// Register a pattern
    pub async fn register_pattern(&self, pattern: ActionPattern) {
        self.patterns.lock().await.insert(pattern.id.clone(), pattern);
    }

    /// Record feedback on suggestion
    pub async fn record_feedback(&self, suggestion_id: &str, accepted: bool) {
        let mut patterns = self.patterns.lock().await;
        if let Some(pattern) = patterns.get_mut(suggestion_id) {
            pattern.usage_count += 1;
            if accepted {
                pattern.success_rate = (pattern.success_rate * (pattern.usage_count - 1) as f64 + 1.0) 
                    / pattern.usage_count as f64;
            } else {
                pattern.success_rate = (pattern.success_rate * (pattern.usage_count - 1) as f64) 
                    / pattern.usage_count as f64;
            }
        }
    }

    /// Dismiss a suggestion type
    pub async fn dismiss_suggestion(&self, suggestion_type: &str) {
        self.user_preferences.lock().await.dismissed_suggestions.push(suggestion_type.to_string());
    }

    async fn check_patterns(&self, context: &ContextSnapshot) -> Vec<SuggestedAction> {
        let patterns = self.patterns.lock().await;
        let dismissed = self.user_preferences.lock().await.dismissed_suggestions.clone();
        let mut suggestions = vec![];

        for pattern in patterns.values() {
            if dismissed.contains(&pattern.id) {
                continue;
            }

            let matches = pattern.trigger_conditions.iter().all(|condition| {
                self.matches_condition(condition, context)
            });

            if matches && pattern.success_rate >= pattern.confidence_threshold {
                suggestions.push(pattern.suggested_action.clone());
            }
        }

        suggestions
    }

    fn matches_condition(&self, condition: &TriggerCondition, context: &ContextSnapshot) -> bool {
        match condition {
            TriggerCondition::ActiveWindow { title_pattern } => {
                context.active_window.title.contains(title_pattern)
                    || context.active_window.app_name.contains(title_pattern)
            }
            TriggerCondition::ElementFocused { element_type, text_pattern } => {
                context.focused_element.as_ref().map_or(false, |e| {
                    e.element_type == *element_type &&
                    text_pattern.as_ref().map_or(true, |p| {
                        e.text.as_ref().map_or(false, |t| t.contains(p))
                    })
                })
            }
            TriggerCondition::ClipboardContent { pattern } => {
                context.clipboard_content.as_ref().map_or(false, |c| c.contains(pattern))
            }
            TriggerCondition::RecentActions { actions } => {
                let recent: Vec<_> = context.recent_actions.iter().rev().take(5).collect();
                actions.iter().all(|a| recent.contains(&a))
            }
            TriggerCondition::TimeOfDay { start_hour, end_hour } => {
                let hour = chrono::Local::now().hour();
                hour >= *start_hour && hour <= *end_hour
            }
        }
    }
}

/// Built-in suggestion patterns
pub fn default_patterns() -> Vec<ActionPattern> {
    vec![
        ActionPattern {
            id: "copy-paste-suggestion".to_string(),
            name: "Copy-Paste Sequence".to_string(),
            trigger_conditions: vec![
                TriggerCondition::RecentActions { actions: vec!["copy".to_string()] },
            ],
            suggested_action: SuggestedAction {
                action_type: "paste".to_string(),
                description: "You just copied content. Want to paste it?".to_string(),
                params: HashMap::new(),
                reason: "Common copy-paste workflow".to_string(),
                confidence: 0.85,
            },
            confidence_threshold: 0.7,
            usage_count: 0,
            success_rate: 0.8,
        },
        ActionPattern {
            id: "form-completion".to_string(),
            name: "Form Field Navigation".to_string(),
            trigger_conditions: vec![
                TriggerCondition::ElementFocused { element_type: "input".to_string(), text_pattern: None },
            ],
            suggested_action: SuggestedAction {
                action_type: "tab".to_string(),
                description: "Press Tab to move to next field".to_string(),
                params: HashMap::new(),
                reason: "Form navigation pattern".to_string(),
                confidence: 0.75,
            },
            confidence_threshold: 0.6,
            usage_count: 0,
            success_rate: 0.9,
        },
    ]
}

use async_trait::async_trait;
use chrono::Timelike;
