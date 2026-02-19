use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Action {
    pub action_type: ActionType,
    pub target: Option<String>,
    pub value: Option<String>,
    pub description: String,
    pub confidence: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ActionType {
    Click,
    Type,
    Navigate,
    Wait,
    Scroll,
    Hover,
    Extract,
    Assert,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionPlan {
    pub goal: String,
    pub actions: Vec<Action>,
    pub estimated_duration_ms: u64,
    pub fallback_actions: Vec<Action>,
}

#[derive(Debug, Clone)]
pub struct AiActionPlanner {
    llm_endpoint: String,
    model: String,
}

impl AiActionPlanner {
    pub fn new(llm_endpoint: String, model: String) -> Self {
        Self {
            llm_endpoint,
            model,
        }
    }

    pub async fn generate_plan(
        &self,
        goal: &str,
        page_snapshot: &str,
        context: Option<HashMap<String, String>>,
    ) -> anyhow::Result<ActionPlan> {
        let prompt = self.build_prompt(goal, page_snapshot, context);
        let actions = self.call_llm(&prompt).await?;
        
        Ok(ActionPlan {
            goal: goal.to_string(),
            actions,
            estimated_duration_ms: self.estimate_duration(&actions),
            fallback_actions: self.generate_fallbacks(&actions),
        })
    }

    fn build_prompt(
        &self,
        goal: &str,
        snapshot: &str,
        context: Option<HashMap<String, String>>,
    ) -> String {
        let mut prompt = format!(
            "You are a browser automation expert. Given the goal and page snapshot, \
             generate a sequence of actions to achieve the goal.\n\n\
             Goal: {}\n\n\
             Page Snapshot:\n{}\n\n\
             Available actions: click, type, navigate, wait, scroll, hover, extract, assert\n\n\
             Respond in JSON format with an array of actions. Each action should have:\n\
             - action_type: one of the available actions\n\
             - target: element reference (e.g., @e1) or URL\n\
             - value: text to type or other value\n\
             - description: human-readable description\n\
             - confidence: 0.0 to 1.0\n\n",
            goal, snapshot
        );

        if let Some(ctx) = context {
            prompt.push_str(&format!("\nContext: {:?}\n", ctx));
        }

        prompt
    }

    async fn call_llm(&self, prompt: &str) -> anyhow::Result<Vec<Action>> {
        let client = reqwest::Client::new();
        let request_body = serde_json::json!({
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a browser automation expert. Respond only with valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.1,
            "response_format": { "type": "json_object" }
        });

        let response = client
            .post(&self.llm_endpoint)
            .json(&request_body)
            .send()
            .await?;

        let response_json: serde_json::Value = response.json().await?;
        let content = response_json["choices"][0]["message"]["content"]
            .as_str()
            .ok_or_else(|| anyhow::anyhow!("Invalid LLM response"))?;

        let actions: Vec<Action> = serde_json::from_str(content)?;
        Ok(actions)
    }

    fn estimate_duration(&self, actions: &[Action]) -> u64 {
        let base_ms = 1000;
        let total = actions.iter().fold(0, |acc, action| {
            let action_ms = match action.action_type {
                ActionType::Click => 500,
                ActionType::Type => 1000,
                ActionType::Navigate => 3000,
                ActionType::Wait => 2000,
                ActionType::Scroll => 300,
                ActionType::Hover => 200,
                ActionType::Extract => 500,
                ActionType::Assert => 200,
            };
            acc + action_ms
        });
        base_ms + total as u64
    }

    fn generate_fallbacks(&self, primary_actions: &[Action]) -> Vec<Action> {
        let mut fallbacks = Vec::new();
        
        for action in primary_actions {
            let fallback = Action {
                action_type: ActionType::Wait,
                target: None,
                value: Some("2000".to_string()),
                description: format!("Wait and retry after failed: {}", action.description),
                confidence: 0.5,
            };
            fallbacks.push(fallback);
        }

        fallbacks
    }

    pub async fn adapt_plan(
        &self,
        current_plan: &ActionPlan,
        failed_action_index: usize,
        error_message: &str,
        new_snapshot: &str,
    ) -> anyhow::Result<ActionPlan> {
        let mut remaining = current_plan.actions.clone();
        if failed_action_index < remaining.len() {
            remaining.remove(failed_action_index);
        }

        let prompt = format!(
            "Action failed at step {}. Error: {}\n\n\
             New page snapshot:\n{}\n\n\
             Generate an alternative action to replace the failed one.",
            failed_action_index, error_message, new_snapshot
        );

        let new_actions = self.call_llm(&prompt).await?;
        
        let mut adapted_actions = current_plan.actions[..failed_action_index].to_vec();
        adapted_actions.extend(new_actions);
        adapted_actions.extend_from_slice(&remaining);

        Ok(ActionPlan {
            goal: current_plan.goal.clone(),
            actions: adapted_actions,
            estimated_duration_ms: self.estimate_duration(&adapted_actions),
            fallback_actions: current_plan.fallback_actions.clone(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_action_serialization() {
        let action = Action {
            action_type: ActionType::Click,
            target: Some("@e1".to_string()),
            value: None,
            description: "Click login button".to_string(),
            confidence: 0.95,
        };

        let json = serde_json::to_string(&action).unwrap();
        assert!(json.contains("click"));
        assert!(json.contains("@e1"));
    }

    #[test]
    fn test_estimate_duration() {
        let planner = AiActionPlanner::new(
            "http://localhost:11434".to_string(),
            "llama3.2".to_string(),
        );

        let actions = vec![
            Action {
                action_type: ActionType::Navigate,
                target: Some("https://example.com".to_string()),
                value: None,
                description: "Navigate to example".to_string(),
                confidence: 1.0,
            },
            Action {
                action_type: ActionType::Click,
                target: Some("@e1".to_string()),
                value: None,
                description: "Click button".to_string(),
                confidence: 0.9,
            },
        ];

        let duration = planner.estimate_duration(&actions);
        assert_eq!(duration, 1000 + 3000 + 500);
    }
}
