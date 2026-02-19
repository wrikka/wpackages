use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use parking_lot::RwLock;
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Trigger {
    pub id: Uuid,
    pub name: String,
    pub pattern: String,
    pub pattern_type: PatternType,
    pub action: TriggerAction,
    pub enabled: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PatternType {
    Regex,
    Contains,
    StartsWith,
    EndsWith,
    Exact,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TriggerAction {
    ExecuteCommand { command: String },
    ShowNotification { title: String, message: String },
    RunScript { script: String },
    SetBadge { badge: String },
    ChangePrompt { prompt: String },
    Log { message: String },
}

pub struct TriggerSystem {
    triggers: Arc<RwLock<HashMap<Uuid, Trigger>>>,
    compiled_patterns: Arc<RwLock<HashMap<Uuid, Regex>>>,
}

impl TriggerSystem {
    pub fn new() -> Self {
        Self {
            triggers: Arc::new(RwLock::new(HashMap::new())),
            compiled_patterns: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub fn add_trigger(&self, trigger: Trigger) -> Result<()> {
        let id = trigger.id;

        if let PatternType::Regex = trigger.pattern_type {
            let regex = Regex::new(&trigger.pattern).context("Invalid regex pattern")?;
            self.compiled_patterns.write().insert(id, regex);
        }

        self.triggers.write().insert(id, trigger);
        Ok(())
    }

    pub fn remove_trigger(&self, trigger_id: Uuid) -> Result<()> {
        self.triggers.write().remove(&trigger_id);
        self.compiled_patterns.write().remove(&trigger_id);
        Ok(())
    }

    pub fn get_triggers(&self) -> Vec<Trigger> {
        self.triggers.read().values().cloned().collect()
    }

    pub fn get_trigger(&self, trigger_id: Uuid) -> Option<Trigger> {
        self.triggers.read().get(&trigger_id).cloned()
    }

    pub fn enable_trigger(&self, trigger_id: Uuid) -> Result<()> {
        if let Some(mut trigger) = self.triggers.write().get_mut(&trigger_id) {
            trigger.enabled = true;
        }
        Ok(())
    }

    pub fn disable_trigger(&self, trigger_id: Uuid) -> Result<()> {
        if let Some(mut trigger) = self.triggers.write().get_mut(&trigger_id) {
            trigger.enabled = false;
        }
        Ok(())
    }

    pub fn evaluate(&self, text: &str) -> Vec<TriggerAction> {
        let mut actions = Vec::new();
        let triggers = self.triggers.read();

        for trigger in triggers.values() {
            if !trigger.enabled {
                continue;
            }

            let matches = match &trigger.pattern_type {
                PatternType::Regex => self
                    .compiled_patterns
                    .read()
                    .get(&trigger.id)
                    .map(|regex| regex.is_match(text))
                    .unwrap_or(false),
                PatternType::Contains => text.contains(&trigger.pattern),
                PatternType::StartsWith => text.starts_with(&trigger.pattern),
                PatternType::EndsWith => text.ends_with(&trigger.pattern),
                PatternType::Exact => text == &trigger.pattern,
            };

            if matches {
                actions.push(trigger.action.clone());
            }
        }

        actions
    }
}

impl Default for TriggerSystem {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_trigger_system() {
        let system = TriggerSystem::new();

        let trigger = Trigger {
            id: Uuid::new_v4(),
            name: "Error Trigger".to_string(),
            pattern: "error".to_string(),
            pattern_type: PatternType::Contains,
            action: TriggerAction::ShowNotification {
                title: "Error Detected".to_string(),
                message: "An error occurred".to_string(),
            },
            enabled: true,
            created_at: Utc::now(),
        };

        system.add_trigger(trigger).unwrap();

        let actions = system.evaluate("This is an error message");
        assert_eq!(actions.len(), 1);
    }
}
