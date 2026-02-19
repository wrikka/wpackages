use crate::error::Result;
use crate::types::protocol::{Id, Response};
use serde_json::json;

#[derive(Debug, Clone)]
pub struct ElicitationRequest {
    pub r#type: String,
    pub data: serde_json::Value,
}

#[derive(Debug, Clone)]
pub struct FormField {
    pub name: String,
    pub r#type: String,
    pub label: Option<String>,
    pub required: bool,
    pub options: Option<Vec<String>>,
}

pub struct ElicitationHandler {
    pending_requests: Vec<ElicitationRequest>,
}

impl ElicitationHandler {
    pub fn new() -> Self {
        Self {
            pending_requests: Vec::new(),
        }
    }

    pub fn create_form_elicitation(
        &mut self,
        fields: Vec<FormField>,
        request_id: Id,
    ) -> Result<Response> {
        let elicitation_id = format!("elicitation_{}", self.pending_requests.len());

        let fields_json: Vec<serde_json::Value> = fields
            .iter()
            .map(|f| {
                json!({
                    "name": f.name,
                    "type": f.r#type,
                    "label": f.label,
                    "required": f.required,
                    "options": f.options,
                })
            })
            .collect();

        self.pending_requests.push(ElicitationRequest {
            r#type: "form".to_string(),
            data: json!({ "fields": fields_json }),
        });

        Ok(Response::success(request_id, json!({
            "id": elicitation_id,
            "type": "form",
            "data": {
                "fields": fields_json,
            }
        })))
    }

    pub fn create_url_elicitation(
        &mut self,
        url: String,
        request_id: Id,
    ) -> Result<Response> {
        let elicitation_id = format!("elicitation_{}", self.pending_requests.len());

        self.pending_requests.push(ElicitationRequest {
            r#type: "url".to_string(),
            data: json!({ "url": url }),
        });

        Ok(Response::success(request_id, json!({
            "id": elicitation_id,
            "type": "url",
            "data": {
                "url": url,
            }
        })))
    }

    pub fn handle_complete(&mut self, elicitation_id: String, _result: serde_json::Value) -> Result<()> {
        self.pending_requests.retain(|r| {
            !r.data.get("id")
                .and_then(|id| id.as_str())
                .map(|id| id == elicitation_id)
                .unwrap_or(false)
        });
        Ok(())
    }
}

impl Default for ElicitationHandler {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_form_elicitation() {
        let mut handler = ElicitationHandler::new();
        let fields = vec![
            FormField {
                name: "name".to_string(),
                r#type: "text".to_string(),
                label: Some("Name".to_string()),
                required: true,
                options: None,
            }
        ];

        let response = handler.create_form_elicitation(fields, Id::Num(1)).unwrap();
        assert!(response.result.is_some());
    }
}
