use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NaturalLanguageQuery {
    pub query: String,
    pub context: Option<HashMap<String, String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParsedAction {
    pub action_type: NLActionType,
    pub target: Option<String>,
    pub value: Option<String>,
    pub confidence: f64,
    pub explanation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum NLActionType {
    Click,
    Type,
    Navigate,
    Wait,
    Scroll,
    Find,
    Extract,
    Assert,
}

#[derive(Debug, Clone)]
pub struct NaturalLanguageQueryEngine {
    llm_endpoint: String,
    model: String,
}

impl NaturalLanguageQueryEngine {
    pub fn new(llm_endpoint: String, model: String) -> Self {
        Self {
            llm_endpoint,
            model,
        }
    }

    pub async fn parse(&self, query: &str, page_context: &str) -> anyhow::Result<ParsedAction> {
        let prompt = format!(
            "Parse the following natural language query into a browser action.\n\n\
             Query: \"{}\"\n\n\
             Page Context:\n{}\n\n\
             Available elements: Look for buttons, links, inputs, etc.\n\n\
             Respond with JSON containing:\n\
             - action_type: click, type, navigate, wait, scroll, find, extract, assert\n\
             - target: element reference (e.g., @e1) or selector\n\
             - value: text to type or other value\n\
             - confidence: 0.0 to 1.0\n\
             - explanation: brief explanation of the action\n\n",
            query, page_context
        );

        let client = reqwest::Client::new();
        let request_body = serde_json::json!({
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a browser automation parser. Convert natural language to structured actions."
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

        let parsed: ParsedAction = serde_json::from_str(content)?;
        Ok(parsed)
    }

    pub fn parse_simple(&self, query: &str) -> Option<ParsedAction> {
        let query_lower = query.to_lowercase();

        if query_lower.contains("click") {
            let target = self.extract_target(&query_lower, &["button", "link", "on"]);
            return Some(ParsedAction {
                action_type: NLActionType::Click,
                target,
                value: None,
                confidence: 0.8,
                explanation: "Simple click action".to_string(),
            });
        }

        if query_lower.contains("type") || query_lower.contains("enter") {
            let target = self.extract_target(&query_lower, &["in", "into", "on"]);
            let value = self.extract_quoted_text(query);
            return Some(ParsedAction {
                action_type: NLActionType::Type,
                target,
                value,
                confidence: 0.75,
                explanation: "Type text action".to_string(),
            });
        }

        if query_lower.contains("go to") || query_lower.contains("navigate to") {
            let value = self.extract_url(query);
            return Some(ParsedAction {
                action_type: NLActionType::Navigate,
                target: None,
                value,
                confidence: 0.9,
                explanation: "Navigation action".to_string(),
            });
        }

        if query_lower.contains("wait") {
            return Some(ParsedAction {
                action_type: NLActionType::Wait,
                target: None,
                value: self.extract_duration(query),
                confidence: 0.85,
                explanation: "Wait action".to_string(),
            });
        }

        if query_lower.contains("scroll") {
            return Some(ParsedAction {
                action_type: NLActionType::Scroll,
                target: self.extract_target(&query_lower, &["to", "down", "up"]),
                value: None,
                confidence: 0.7,
                explanation: "Scroll action".to_string(),
            });
        }

        None
    }

    fn extract_target(&self, query: &str, prefixes: &[&str]) -> Option<String> {
        for prefix in prefixes {
            if let Some(pos) = query.find(prefix) {
                let after = &query[pos + prefix.len()..];
                let words: Vec<&str> = after.split_whitespace().collect();
                if !words.is_empty() {
                    return Some(words[0].trim_matches(|c: char| !c.is_alphanumeric()).to_string());
                }
            }
        }
        None
    }

    fn extract_quoted_text(&self, query: &str) -> Option<String> {
        if let Some(start) = query.find('"') {
            if let Some(end) = query[start + 1..].find('"') {
                return Some(query[start + 1..start + 1 + end].to_string());
            }
        }
        if let Some(start) = query.find('\'') {
            if let Some(end) = query[start + 1..].find('\'') {
                return Some(query[start + 1..start + 1 + end].to_string());
            }
        }
        None
    }

    fn extract_url(&self, query: &str) -> Option<String> {
        let url_regex = regex::Regex::new(r"https?://[^\s]+").ok()?;
        url_regex.find(query).map(|m| m.as_str().to_string())
    }

    fn extract_duration(&self, query: &str) -> Option<String> {
        let num_regex = regex::Regex::new(r"(\d+)\s*(seconds?|secs?|s)").ok()?;
        if let Some(caps) = num_regex.captures(query) {
            return caps.get(1).map(|m| format!("{}000", m.as_str()));
        }
        Some("2000".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_simple_click() {
        let engine = NaturalLanguageQueryEngine::new(
            "http://localhost:11434".to_string(),
            "llama3.2".to_string(),
        );

        let result = engine.parse_simple("click the submit button");
        assert!(result.is_some());
        let action = result.unwrap();
        assert!(matches!(action.action_type, NLActionType::Click));
    }

    #[test]
    fn test_extract_quoted_text() {
        let engine = NaturalLanguageQueryEngine::new(
            "http://localhost:11434".to_string(),
            "llama3.2".to_string(),
        );

        let text = engine.extract_quoted_text("type \"hello world\" in the input");
        assert_eq!(text, Some("hello world".to_string()));
    }
}
