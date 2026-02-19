//! Context-Aware Actions
//!
//! Feature 13: Adaptive behavior based on application context

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use crate::error::Result;
use crate::types::{Action, Position, UIElement};

/// Application context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppContext {
    pub name: String,
    pub process_name: String,
    pub window_title: String,
    pub app_type: AppType,
    pub detected_elements: Vec<String>,
    pub suggested_actions: Vec<Action>,
}

/// Application type
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum AppType {
    Browser,
    Editor,
    Terminal,
    FileExplorer,
    Email,
    Chat,
    Office,
    IDE,
    Media,
    Game,
    Unknown,
}

/// Context rule
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextRule {
    pub app_pattern: String,
    pub app_type: AppType,
    pub priority_actions: Vec<Action>,
    pub avoid_actions: Vec<Action>,
    pub custom_selectors: HashMap<String, String>,
}

/// Context manager
pub struct ContextManager {
    rules: Vec<ContextRule>,
    current_context: Option<AppContext>,
}

impl ContextManager {
    /// Create new context manager
    pub fn new() -> Self {
        Self {
            rules: Self::default_rules(),
            current_context: None,
        }
    }

    /// Default context rules
    fn default_rules() -> Vec<ContextRule> {
        vec![
            ContextRule {
                app_pattern: "chrome".to_string(),
                app_type: AppType::Browser,
                priority_actions: vec![Action::Click, Action::Type, Action::Snapshot],
                avoid_actions: vec![],
                custom_selectors: [
                    ("address_bar", "input[name='url']"),
                    ("search", "input[type='search']"),
                ].iter().map(|(k, v)| (k.to_string(), v.to_string())).collect(),
            },
            ContextRule {
                app_pattern: "code".to_string(),
                app_type: AppType::IDE,
                priority_actions: vec![Action::Type, Action::Press],
                avoid_actions: vec![],
                custom_selectors: [
                    ("editor", ".editor"),
                    ("terminal", ".terminal"),
                ].iter().map(|(k, v)| (k.to_string(), v.to_string())).collect(),
            },
            ContextRule {
                app_pattern: "explorer".to_string(),
                app_type: AppType::FileExplorer,
                priority_actions: vec![Action::Click, Action::Type],
                avoid_actions: vec![],
                custom_selectors: HashMap::new(),
            },
            ContextRule {
                app_pattern: "notepad".to_string(),
                app_type: AppType::Editor,
                priority_actions: vec![Action::Type],
                avoid_actions: vec![],
                custom_selectors: HashMap::new(),
            },
        ]
    }

    /// Detect context from window info
    pub fn detect(&mut self, window_title: &str, process_name: &str) -> AppContext {
        let process_lower = process_name.to_lowercase();
        let title_lower = window_title.to_lowercase();

        // Find matching rule
        let rule = self.rules.iter()
            .find(|r| process_lower.contains(&r.app_pattern.to_lowercase()))
            .or_else(|| {
                self.rules.iter()
                    .find(|r| title_lower.contains(&r.app_pattern.to_lowercase()))
            });

        let context = if let Some(rule) = rule {
            AppContext {
                name: process_name.to_string(),
                process_name: process_name.to_string(),
                window_title: window_title.to_string(),
                app_type: rule.app_type.clone(),
                detected_elements: Vec::new(),
                suggested_actions: rule.priority_actions.clone(),
            }
        } else {
            AppContext {
                name: process_name.to_string(),
                process_name: process_name.to_string(),
                window_title: window_title.to_string(),
                app_type: AppType::Unknown,
                detected_elements: Vec::new(),
                suggested_actions: vec![Action::Snapshot],
            }
        };

        self.current_context = Some(context.clone());
        context
    }

    /// Get current context
    pub fn current(&self) -> Option<&AppContext> {
        self.current_context.as_ref()
    }

    /// Check if action is appropriate for current context
    pub fn is_action_appropriate(&self, action: &Action) -> bool {
        if let Some(ctx) = &self.current_context {
            let rule = self.rules.iter()
                .find(|r| r.app_type == ctx.app_type);

            if let Some(rule) = rule {
                return !rule.avoid_actions.contains(action);
            }
        }
        true
    }

    /// Get suggested actions for current context
    pub fn suggested_actions(&self) -> Vec<Action> {
        self.current_context
            .as_ref()
            .map(|c| c.suggested_actions.clone())
            .unwrap_or_default()
    }

    /// Get custom selector for element type
    pub fn get_selector(&self, element_type: &str) -> Option<String> {
        if let Some(ctx) = &self.current_context {
            let rule = self.rules.iter()
                .find(|r| r.app_type == ctx.app_type);

            if let Some(rule) = rule {
                return rule.custom_selectors.get(element_type).cloned();
            }
        }
        None
    }

    /// Adapt action based on context
    pub fn adapt_action(&self, action: &Action, params: &mut HashMap<String, String>) {
        if let Some(ctx) = &self.current_context {
            match ctx.app_type {
                AppType::Browser => {
                    // Add browser-specific handling
                }
                AppType::IDE => {
                    // Add IDE-specific handling
                }
                _ => {}
            }
        }
    }

    /// Clear current context
    pub fn clear(&mut self) {
        self.current_context = None;
    }
}

impl Default for ContextManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_browser() {
        let mut manager = ContextManager::new();
        let ctx = manager.detect("Google Chrome", "chrome");
        assert_eq!(ctx.app_type, AppType::Browser);
    }

    #[test]
    fn test_detect_ide() {
        let mut manager = ContextManager::new();
        let ctx = manager.detect("Visual Studio Code", "code");
        assert_eq!(ctx.app_type, AppType::IDE);
    }

    #[test]
    fn test_suggested_actions() {
        let mut manager = ContextManager::new();
        manager.detect("Chrome", "chrome");
        let actions = manager.suggested_actions();
        assert!(!actions.is_empty());
    }

    #[test]
    fn test_get_selector() {
        let mut manager = ContextManager::new();
        manager.detect("Chrome", "chrome");
        let selector = manager.get_selector("address_bar");
        assert!(selector.is_some());
    }
}
