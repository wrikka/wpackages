//! Natural Language Scripting
//!
//! Feature 12: Write automation scripts in natural language

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use crate::error::{Error, Result};
use crate::types::Action;

/// Parsed script
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParsedScript {
    pub commands: Vec<ParsedCommand>,
    pub variables: HashMap<String, String>,
    pub comments: Vec<String>,
}

/// Parsed command
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParsedCommand {
    pub raw: String,
    pub action: Action,
    pub params: HashMap<String, String>,
    pub line_number: usize,
}

/// Natural language parser
pub struct NLParser {
    keywords: HashMap<String, Action>,
    param_patterns: Vec<ParamPattern>,
}

/// Parameter pattern
struct ParamPattern {
    prefix: String,
    param_name: String,
}

impl NLParser {
    /// Create new parser
    pub fn new() -> Self {
        Self {
            keywords: Self::default_keywords(),
            param_patterns: Self::default_param_patterns(),
        }
    }

    /// Default keyword mappings
    fn default_keywords() -> HashMap<String, Action> {
        let mut map = HashMap::new();
        
        // Snapshot
        map.insert("take snapshot".to_string(), Action::Snapshot);
        map.insert("capture screen".to_string(), Action::Snapshot);
        map.insert("screenshot".to_string(), Action::Screenshot);
        
        // Click
        map.insert("click".to_string(), Action::Click);
        map.insert("tap".to_string(), Action::Click);
        map.insert("press".to_string(), Action::Press);
        
        // Type
        map.insert("type".to_string(), Action::Type);
        map.insert("write".to_string(), Action::Type);
        map.insert("enter".to_string(), Action::Type);
        
        // Navigation
        map.insert("wait for".to_string(), Action::WaitForElement);
        map.insert("launch".to_string(), Action::Launch);
        map.insert("open".to_string(), Action::Launch);
        
        map
    }

    /// Default parameter patterns
    fn default_param_patterns() -> Vec<ParamPattern> {
        vec![
            ParamPattern { prefix: "on".to_string(), param_name: "selector".to_string() },
            ParamPattern { prefix: "in".to_string(), param_name: "selector".to_string() },
            ParamPattern { prefix: "at".to_string(), param_name: "position".to_string() },
            ParamPattern { prefix: "text".to_string(), param_name: "text".to_string() },
            ParamPattern { prefix: "key".to_string(), param_name: "key".to_string() },
        ]
    }

    /// Parse a script
    pub fn parse(&self, script: &str) -> Result<ParsedScript> {
        let mut commands = Vec::new();
        let mut variables = HashMap::new();
        let mut comments = Vec::new();

        for (line_num, line) in script.lines().enumerate() {
            let line = line.trim();

            // Skip empty lines
            if line.is_empty() {
                continue;
            }

            // Handle comments
            if line.starts_with('#') || line.starts_with("//") {
                comments.push(line.to_string());
                continue;
            }

            // Handle variable definitions
            if line.starts_with("let ") || line.starts_with("var ") {
                if let Some((name, value)) = self.parse_variable(line) {
                    variables.insert(name, value);
                }
                continue;
            }

            // Parse command
            if let Some(cmd) = self.parse_command(line, line_num + 1) {
                commands.push(cmd);
            }
        }

        Ok(ParsedScript {
            commands,
            variables,
            comments,
        })
    }

    /// Parse a single command
    fn parse_command(&self, line: &str, line_number: usize) -> Option<ParsedCommand> {
        let line_lower = line.to_lowercase();

        // Find matching action
        for (keyword, action) in &self.keywords {
            if line_lower.contains(keyword) {
                let params = self.extract_params(line, keyword);
                return Some(ParsedCommand {
                    raw: line.to_string(),
                    action: action.clone(),
                    params,
                    line_number,
                });
            }
        }

        None
    }

    /// Extract parameters from line
    fn extract_params(&self, line: &str, keyword: &str) -> HashMap<String, String> {
        let mut params = HashMap::new();
        
        // Get text after keyword
        let remainder = line.to_lowercase()
            .replace(keyword, "")
            .trim()
            .to_string();

        // Extract quoted text
        if let Some(text) = self.extract_quoted(&remainder) {
            params.insert("text".to_string(), text);
        } else if !remainder.is_empty() {
            // Use remainder as selector or text
            params.insert("selector".to_string(), remainder.clone());
        }

        params
    }

    /// Extract quoted text
    fn extract_quoted(&self, text: &str) -> Option<String> {
        let start = text.find('"')?;
        let end = text.rfind('"')?;
        if start < end {
            Some(text[start + 1..end].to_string())
        } else {
            None
        }
    }

    /// Parse variable definition
    fn parse_variable(&self, line: &str) -> Option<(String, String)> {
        let line = line.trim_start_matches("let ")
            .trim_start_matches("var ")
            .trim();

        let parts: Vec<&str> = line.splitn(2, '=').collect();
        if parts.len() == 2 {
            let name = parts[0].trim().to_string();
            let value = parts[1].trim().trim_matches('"').to_string();
            Some((name, value))
        } else {
            None
        }
    }

    /// Convert script to commands
    pub fn to_commands(&self, script: &ParsedScript) -> Vec<serde_json::Value> {
        script.commands
            .iter()
            .map(|cmd| {
                let mut json = serde_json::Map::new();
                json.insert("action".to_string(), serde_json::json!(cmd.action));
                for (k, v) in &cmd.params {
                    json.insert(k.clone(), serde_json::json!(v));
                }
                serde_json::Value::Object(json)
            })
            .collect()
    }
}

impl Default for NLParser {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_snapshot() {
        let parser = NLParser::new();
        let script = "take snapshot";
        let parsed = parser.parse(script).unwrap();
        assert_eq!(parsed.commands.len(), 1);
        assert!(matches!(parsed.commands[0].action, Action::Snapshot));
    }

    #[test]
    fn test_parse_click() {
        let parser = NLParser::new();
        let script = "click on button";
        let parsed = parser.parse(script).unwrap();
        assert_eq!(parsed.commands.len(), 1);
        assert!(matches!(parsed.commands[0].action, Action::Click));
    }

    #[test]
    fn test_parse_with_variable() {
        let parser = NLParser::new();
        let script = r#"
let name = "test"
click on name
"#;
        let parsed = parser.parse(script).unwrap();
        assert_eq!(parsed.variables.get("name"), Some(&"test".to_string()));
    }

    #[test]
    fn test_parse_comments() {
        let parser = NLParser::new();
        let script = r#"
# This is a comment
take snapshot
// Another comment
"#;
        let parsed = parser.parse(script).unwrap();
        assert_eq!(parsed.comments.len(), 2);
    }
}
