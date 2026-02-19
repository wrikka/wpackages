//! Voice Commands
//!
//! Feature 8: Voice control for automation

use std::sync::Arc;
use serde::{Deserialize, Serialize};
use async_trait::async_trait;
use crate::error::{Error, Result};
use crate::types::Action;

/// Voice command
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceCommand {
    pub text: String,
    pub confidence: f32,
    pub language: String,
}

/// Voice recognition result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecognitionResult {
    pub command: VoiceCommand,
    pub action: Option<Action>,
    pub params: Option<serde_json::Value>,
}

/// Voice recognizer trait
#[async_trait]
pub trait VoiceRecognizer: Send + Sync {
    /// Recognize speech from audio
    async fn recognize(&self, audio: &[u8]) -> Result<VoiceCommand>;

    /// Start listening
    async fn start_listening(&mut self) -> Result<()>;

    /// Stop listening
    async fn stop_listening(&mut self) -> Result<()>;

    /// Check if listening
    fn is_listening(&self) -> bool;
}

/// Voice command parser
pub struct VoiceCommandParser {
    commands: Vec<CommandMapping>,
}

/// Command mapping from voice to action
#[derive(Debug, Clone)]
struct CommandMapping {
    patterns: Vec<String>,
    action: Action,
    param_extractors: Vec<ParamExtractor>,
}

/// Parameter extractor
#[derive(Debug, Clone)]
enum ParamExtractor {
    Number,
    Text,
    Selector,
}

impl VoiceCommandParser {
    /// Create new voice command parser
    pub fn new() -> Self {
        Self {
            commands: Self::default_commands(),
        }
    }

    /// Default command mappings
    fn default_commands() -> Vec<CommandMapping> {
        vec![
            CommandMapping {
                patterns: vec!["take snapshot".to_string(), "capture screen".to_string()],
                action: Action::Snapshot,
                param_extractors: vec![],
            },
            CommandMapping {
                patterns: vec!["click on".to_string(), "click".to_string()],
                action: Action::Click,
                param_extractors: vec![ParamExtractor::Selector],
            },
            CommandMapping {
                patterns: vec!["type".to_string(), "write".to_string()],
                action: Action::Type,
                param_extractors: vec![ParamExtractor::Text],
            },
            CommandMapping {
                patterns: vec!["press".to_string(), "hit".to_string()],
                action: Action::Press,
                param_extractors: vec![ParamExtractor::Text],
            },
        ]
    }

    /// Parse voice command to action
    pub fn parse(&self, voice: &VoiceCommand) -> Option<RecognitionResult> {
        let text = voice.text.to_lowercase();

        for mapping in &self.commands {
            for pattern in &mapping.patterns {
                if text.contains(pattern) {
                    let params = self.extract_params(&text, pattern, &mapping.param_extractors);
                    return Some(RecognitionResult {
                        command: voice.clone(),
                        action: Some(mapping.action.clone()),
                        params,
                    });
                }
            }
        }

        None
    }

    /// Extract parameters from text
    fn extract_params(
        &self,
        text: &str,
        pattern: &str,
        extractors: &[ParamExtractor],
    ) -> Option<serde_json::Value> {
        let binding = text.replace(pattern, "");
        let remainder = binding.trim();
        if remainder.is_empty() || extractors.is_empty() {
            return None;
        }

        let mut params = serde_json::Map::new();
        for (i, extractor) in extractors.iter().enumerate() {
            match extractor {
                ParamExtractor::Text => {
                    params.insert("text".to_string(), serde_json::json!(remainder));
                }
                ParamExtractor::Selector => {
                    params.insert("selector".to_string(), serde_json::json!(remainder));
                }
                ParamExtractor::Number => {
                    if let Ok(num) = remainder.parse::<i32>() {
                        params.insert(format!("param{}", i), serde_json::json!(num));
                    }
                }
            }
        }

        Some(serde_json::Value::Object(params))
    }
}

impl Default for VoiceCommandParser {
    fn default() -> Self {
        Self::new()
    }
}

/// Mock voice recognizer for testing
pub struct MockVoiceRecognizer {
    listening: bool,
}

impl MockVoiceRecognizer {
    pub const fn new() -> Self {
        Self { listening: false }
    }
}

impl Default for MockVoiceRecognizer {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl VoiceRecognizer for MockVoiceRecognizer {
    async fn recognize(&self, _audio: &[u8]) -> Result<VoiceCommand> {
        Ok(VoiceCommand {
            text: "take snapshot".to_string(),
            confidence: 0.95,
            language: "en".to_string(),
        })
    }

    async fn start_listening(&mut self) -> Result<()> {
        self.listening = true;
        Ok(())
    }

    async fn stop_listening(&mut self) -> Result<()> {
        self.listening = false;
        Ok(())
    }

    fn is_listening(&self) -> bool {
        self.listening
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_snapshot_command() {
        let parser = VoiceCommandParser::new();
        let voice = VoiceCommand {
            text: "take snapshot".to_string(),
            confidence: 0.95,
            language: "en".to_string(),
        };
        let result = parser.parse(&voice);
        assert!(matches!(result, Some(RecognitionResult { action: Some(Action::Snapshot), .. })));
    }

    #[test]
    fn test_parse_type_command() {
        let parser = VoiceCommandParser::new();
        let voice = VoiceCommand {
            text: "type hello world".to_string(),
            confidence: 0.95,
            language: "en".to_string(),
        };
        let result = parser.parse(&voice);
        assert!(matches!(result, Some(RecognitionResult { action: Some(Action::Type), .. })));
    }
}
