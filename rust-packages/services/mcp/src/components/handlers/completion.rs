use crate::error::Result;
use crate::types::protocol::{Id, Response};
use serde_json::json;

pub struct CompletionHandler {
    completions: Vec<CompletionItem>,
}

#[derive(Debug, Clone)]
pub struct CompletionItem {
    pub label: String,
    pub description: Option<String>,
}

impl CompletionHandler {
    pub fn new() -> Self {
        Self {
            completions: Vec::new(),
        }
    }

    pub fn add_completion(&mut self, item: CompletionItem) {
        self.completions.push(item);
    }

    pub fn complete(&self, reference: CompletionRef, request_id: Id) -> Result<Response> {
        let items: Vec<serde_json::Value> = self.completions
            .iter()
            .filter(|item| {
                if let Some(prefix) = &reference.argument.name {
                    item.label.starts_with(prefix)
                } else {
                    true
                }
            })
            .map(|item| {
                json!({
                    "label": item.label,
                    "description": item.description,
                })
            })
            .collect();

        Ok(Response::success(request_id, json!({ "completion": { "items": items } })))
    }
}

#[derive(Debug, Clone)]
pub struct CompletionRef {
    pub r#type: String,
    pub argument: CompletionArgument,
}

#[derive(Debug, Clone)]
pub struct CompletionArgument {
    pub name: Option<String>,
    pub value: Option<String>,
}

impl Default for CompletionHandler {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_complete() {
        let mut handler = CompletionHandler::new();
        handler.add_completion(CompletionItem {
            label: "file.txt".to_string(),
            description: Some("A text file".to_string()),
        });

        let reference = CompletionRef {
            r#type: "resource".to_string(),
            argument: CompletionArgument {
                name: Some("file".to_string()),
                value: None,
            },
        };

        let response = handler.complete(reference, Id::Num(1)).unwrap();
        assert!(response.result.is_some());
    }
}
