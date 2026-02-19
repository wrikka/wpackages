use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceCommand {
    pub transcript: String,
    pub confidence: f64,
    pub language: String,
    pub timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParsedVoiceCommand {
    pub original: VoiceCommand,
    pub parsed_action: VoiceAction,
    pub target_elements: Vec<String>,
    pub parameters: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum VoiceAction {
    Click,
    Type,
    Navigate,
    Scroll,
    Wait,
    GoBack,
    GoForward,
    Refresh,
    Find,
    TakeScreenshot,
    Help,
}

#[derive(Debug, Clone)]
pub struct VoiceActionRecorder {
    command_history: Vec<ParsedVoiceCommand>,
    action_sequence: Vec<RecordedAction>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecordedAction {
    pub action_type: String,
    pub selector: Option<String>,
    pub value: Option<String>,
    pub timestamp: i64,
    pub voice_command: Option<VoiceCommand>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceRecording {
    pub name: String,
    pub description: Option<String>,
    pub actions: Vec<RecordedAction>,
    pub created_at: i64,
    pub metadata: HashMap<String, String>,
}

impl VoiceActionRecorder {
    pub fn new() -> Self {
        Self {
            command_history: Vec::new(),
            action_sequence: Vec::new(),
        }
    }

    pub fn process_voice_command(&mut self, command: VoiceCommand) -> anyhow::Result<ParsedVoiceCommand> {
        let parsed = self.parse_command(&command)?;
        
        let recorded_action = RecordedAction {
            action_type: format!("{:?}", parsed.parsed_action),
            selector: parsed.target_elements.first().cloned(),
            value: parsed.parameters.get("text").cloned(),
            timestamp: command.timestamp,
            voice_command: Some(command.clone()),
        };
        
        self.action_sequence.push(recorded_action);
        self.command_history.push(parsed.clone());
        
        Ok(parsed)
    }

    fn parse_command(&self, command: &VoiceCommand) -> anyhow::Result<ParsedVoiceCommand> {
        let transcript = command.transcript.to_lowercase();
        
        let (action, elements, params) = if transcript.contains("click") || transcript.contains("tap") {
            let target = self.extract_target(&transcript, &["click", "tap", "on", "the"]);
            (VoiceAction::Click, vec![target.unwrap_or_default()], HashMap::new())
        } else if transcript.contains("type") || transcript.contains("enter") {
            let text = self.extract_text(&transcript);
            let target = self.extract_target(&transcript, &["in", "into", "on"]);
            let mut params = HashMap::new();
            if let Some(t) = text {
                params.insert("text".to_string(), t);
            }
            (VoiceAction::Type, vec![target.unwrap_or_default()], params)
        } else if transcript.contains("go to") || transcript.contains("navigate to") || transcript.contains("open") {
            let url = self.extract_url(&transcript);
            let mut params = HashMap::new();
            if let Some(u) = url {
                params.insert("url".to_string(), u);
            }
            (VoiceAction::Navigate, vec![], params)
        } else if transcript.contains("scroll") {
            let direction = if transcript.contains("up") {
                "up"
            } else if transcript.contains("left") {
                "left"
            } else if transcript.contains("right") {
                "right"
            } else {
                "down"
            };
            let mut params = HashMap::new();
            params.insert("direction".to_string(), direction.to_string());
            (VoiceAction::Scroll, vec![], params)
        } else if transcript.contains("wait") || transcript.contains("pause") {
            let duration = self.extract_duration(&transcript).unwrap_or(2);
            let mut params = HashMap::new();
            params.insert("duration_seconds".to_string(), duration.to_string());
            (VoiceAction::Wait, vec![], params)
        } else if transcript.contains("back") || transcript.contains("previous") {
            (VoiceAction::GoBack, vec![], HashMap::new())
        } else if transcript.contains("forward") || transcript.contains("next") {
            (VoiceAction::GoForward, vec![], HashMap::new())
        } else if transcript.contains("refresh") || transcript.contains("reload") {
            (VoiceAction::Refresh, vec![], HashMap::new())
        } else if transcript.contains("find") || transcript.contains("search for") {
            let query = self.extract_text(&transcript);
            let mut params = HashMap::new();
            if let Some(q) = query {
                params.insert("query".to_string(), q);
            }
            (VoiceAction::Find, vec![], params)
        } else if transcript.contains("screenshot") || transcript.contains("take a picture") {
            (VoiceAction::TakeScreenshot, vec![], HashMap::new())
        } else {
            (VoiceAction::Help, vec![], HashMap::new())
        };

        Ok(ParsedVoiceCommand {
            original: command.clone(),
            parsed_action: action,
            target_elements: elements,
            parameters: params,
        })
    }

    fn extract_target(&self, transcript: &str, prefixes: &[&str]) -> Option<String> {
        let words: Vec<&str> = transcript.split_whitespace().collect();
        
        for (i, word) in words.iter().enumerate() {
            if prefixes.contains(word) && i + 1 < words.len() {
                let target = words[i + 1..].join(" ");
                return Some(target.trim().to_string());
            }
        }
        None
    }

    fn extract_text(&self, transcript: &str) -> Option<String> {
        if let Some(start) = transcript.find('"') {
            if let Some(end) = transcript[start + 1..].find('"') {
                return Some(transcript[start + 1..start + 1 + end].to_string());
            }
        }
        
        let words: Vec<&str> = transcript.split_whitespace().collect();
        if let Some(pos) = words.iter().position(|w| *w == "type" || *w == "enter") {
            let remaining: Vec<&str> = words.iter().skip(pos + 1).copied().collect();
            if !remaining.is_empty() {
                return Some(remaining.join(" "));
            }
        }
        
        None
    }

    fn extract_url(&self, transcript: &str) -> Option<String> {
        let url_regex = regex::Regex::new(r"https?://[^\s]+").ok()?;
        url_regex.find(transcript).map(|m| m.as_str().to_string())
    }

    fn extract_duration(&self, transcript: &str) -> Option<u64> {
        let num_regex = regex::Regex::new(r"(\d+)").ok()?;
        num_regex.captures(transcript)
            .and_then(|c| c.get(1))
            .map(|m| m.as_str().parse().ok())
            .flatten()
    }

    pub fn export_recording(&self, name: &str) -> VoiceRecording {
        VoiceRecording {
            name: name.to_string(),
            description: None,
            actions: self.action_sequence.clone(),
            created_at: chrono::Utc::now().timestamp(),
            metadata: HashMap::new(),
        }
    }

    pub fn clear(&mut self) {
        self.command_history.clear();
        self.action_sequence.clear();
    }

    pub fn get_action_count(&self) -> usize {
        self.action_sequence.len()
    }

    pub fn get_command_history(&self) -> &[ParsedVoiceCommand] {
        &self.command_history
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_click_command() {
        let recorder = VoiceActionRecorder::new();
        let command = VoiceCommand {
            transcript: "click the submit button".to_string(),
            confidence: 0.95,
            language: "en".to_string(),
            timestamp: 0,
        };

        let parsed = recorder.parse_command(&command).unwrap();
        assert!(matches!(parsed.parsed_action, VoiceAction::Click));
    }

    #[test]
    fn test_parse_navigate_command() {
        let recorder = VoiceActionRecorder::new();
        let command = VoiceCommand {
            transcript: "go to https://example.com".to_string(),
            confidence: 0.9,
            language: "en".to_string(),
            timestamp: 0,
        };

        let parsed = recorder.parse_command(&command).unwrap();
        assert!(matches!(parsed.parsed_action, VoiceAction::Navigate));
    }
}
