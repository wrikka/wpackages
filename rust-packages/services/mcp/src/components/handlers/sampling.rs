use crate::error::Result;
use crate::types::protocol::{Id, Response};
use serde_json::json;

#[derive(Debug, Clone)]
pub struct SamplingMessage {
    pub role: String,
    pub content: SamplingContent,
}

#[derive(Debug, Clone)]
pub struct SamplingContent {
    pub r#type: String,
    pub text: Option<String>,
}

#[derive(Debug, Clone)]
pub struct ModelPreferences {
    pub hints: Option<Vec<String>>,
    pub cost_priority: Option<String>,
    pub speed_priority: Option<String>,
}

pub struct SamplingHandler {
    enabled: bool,
}

impl SamplingHandler {
    pub fn new() -> Self {
        Self {
            enabled: false,
        }
    }

    pub fn enable(&mut self) {
        self.enabled = true;
    }

    pub fn create_message(
        &self,
        messages: Vec<SamplingMessage>,
        _model_preferences: Option<ModelPreferences>,
        _include_context: Option<bool>,
        request_id: Id,
    ) -> Result<Response> {
        if !self.enabled {
            return Err(crate::error::McpError::Protocol("Sampling not enabled".to_string()));
        }

        let response_messages: Vec<serde_json::Value> = messages
            .iter()
            .map(|m| {
                json!({
                    "role": m.role,
                    "content": {
                        "type": m.content.r#type,
                        "text": m.content.text,
                    }
                })
            })
            .collect();

        Ok(Response::success(request_id, json!({
            "model": "placeholder-model",
            "stopReason": "endTurn",
            "role": "assistant",
            "content": {
                "type": "text",
                "text": "Sampling response placeholder",
            },
            "messages": response_messages,
        })))
    }
}

impl Default for SamplingHandler {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sampling_not_enabled() {
        let handler = SamplingHandler::new();
        let result = handler.create_message(
            vec![],
            None,
            None,
            Id::Num(1),
        );
        assert!(result.is_err());
    }
}
