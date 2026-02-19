//! Feature 31: Natural Language Interface

use crate::types::*;
use anyhow::Result;

/// Feature 31: Natural Language Interface
#[derive(Default)]
pub struct NaturalLanguageInterface {
    language_model: Option<String>,
}

impl NaturalLanguageInterface {
    /// Accept commands in natural language
    pub fn accept_command(&self, text: &str) -> Result<Command> {
        let lower_text = text.to_lowercase();
        if lower_text.contains("click") {
            let parts: Vec<&str> = lower_text.split("click").collect();
            let target = parts.get(1).unwrap_or(&"").trim();
            Ok(Command {
                action: "click".to_string(),
                parameters: vec![target.to_string()],
            })
        } else if lower_text.starts_with("type") {
            let parts: Vec<&str> = lower_text.splitn(2, "type").collect();
            let content_to_type = parts.get(1).unwrap_or(&"").trim();
            Ok(Command {
                action: "type".to_string(),
                parameters: vec![content_to_type.to_string()],
            })
        } else {
            Ok(Command {
                action: "unknown".to_string(),
                parameters: vec![text.to_string()],
            })
        }
    }

    /// Clarify ambiguous requests
    pub fn clarify(&self, text: &str) -> Option<Clarification> {
        let lower_text = text.to_lowercase();
        if lower_text.contains("button") && !lower_text.contains("the") {
            return Some(Clarification {
                question: "Which button are you referring to?".to_string(),
                options: vec!["The submit button".to_string(), "The cancel button".to_string()],
            });
        }
        None
    }

    /// Provide natural responses
    pub fn respond(&self, query: &str) -> String {
        let lower_query = query.to_lowercase();
        if lower_query.contains("hello") {
            "Hello! How can I help you today?".to_string()
        } else if lower_query.contains("thank you") {
            "You're welcome!".to_string()
        } else {
            "Request processed.".to_string()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_natural_language() {
        let interface = NaturalLanguageInterface::default();
        let command = interface.accept_command("click button").unwrap();
        assert_eq!(command.action, "click");
    }
}
