use crate::error::Result;
use crate::types::protocol::{Id, Response};
use serde_json::json;

pub struct PromptHandler {
    prompts: Vec<Prompt>,
}

#[derive(Debug, Clone)]
pub struct Prompt {
    pub name: String,
    pub description: String,
    pub arguments: Vec<PromptArgument>,
}

#[derive(Debug, Clone)]
pub struct PromptArgument {
    pub name: String,
    pub description: Option<String>,
    pub required: bool,
}

impl PromptHandler {
    pub fn new() -> Self {
        Self {
            prompts: Vec::new(),
        }
    }

    pub fn add_prompt(&mut self, prompt: Prompt) {
        self.prompts.push(prompt);
    }

    pub fn list_prompts(&self, request_id: Id) -> Result<Response> {
        let prompts: Vec<serde_json::Value> = self.prompts
            .iter()
            .map(|p| {
                let args: Vec<serde_json::Value> = p.arguments
                    .iter()
                    .map(|a| {
                        json!({
                            "name": a.name,
                            "description": a.description,
                            "required": a.required,
                        })
                    })
                    .collect();

                json!({
                    "name": p.name,
                    "description": p.description,
                    "arguments": args,
                })
            })
            .collect();

        Ok(Response::success(request_id, json!({ "prompts": prompts })))
    }

    pub fn get_prompt(&self, name: &str, args: serde_json::Value, request_id: Id) -> Result<Response> {
        let _prompt = self.prompts
            .iter()
            .find(|p| p.name == name)
            .ok_or_else(|| crate::error::McpError::Protocol(format!("Prompt not found: {}", name)))?;

        let messages = json!([{
            "role": "user",
            "content": {
                "type": "text",
                "text": format!("Prompt '{}' with args: {}", name, args),
            }
        }]);

        Ok(Response::success(request_id, json!({ "messages": messages })))
    }
}

impl Default for PromptHandler {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_list_prompts() {
        let mut handler = PromptHandler::new();
        handler.add_prompt(Prompt {
            name: "test_prompt".to_string(),
            description: "A test prompt".to_string(),
            arguments: Vec::new(),
        });

        let response = handler.list_prompts(Id::Num(1)).unwrap();
        assert!(response.result.is_some());
    }
}
