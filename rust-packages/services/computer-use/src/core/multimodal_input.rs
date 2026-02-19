//! Multi-Modal Input (Feature 3)
//!
//! Support for voice commands, gestures, and handwritten input as triggers

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Types of multi-modal input
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InputMode {
    Voice,
    Gesture,
    Handwritten,
    Keyboard,
    Mouse,
    Touch,
    Pen,
    EyeTracking,
    BrainComputer, // Future: BCI
}

/// Raw input event from any modality
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InputEvent {
    pub mode: InputMode,
    pub timestamp: u64,
    pub confidence: f32,
    pub raw_data: InputData,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InputData {
    Voice {
        transcript: String,
        audio_samples: Vec<f32>,
        language: String,
        speaker_id: Option<String>,
    },
    Gesture {
        gesture_type: GestureType,
        start_point: (f32, f32),
        end_point: (f32, f32),
        velocity: f32,
    },
    Handwritten {
        strokes: Vec<Stroke>,
        recognized_text: String,
    },
    Keyboard {
        key: String,
        modifiers: Vec<String>,
    },
    Mouse {
        x: f32,
        y: f32,
        button: Option<String>,
        action: String,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum GestureType {
    Tap,
    DoubleTap,
    LongPress,
    SwipeLeft,
    SwipeRight,
    SwipeUp,
    SwipeDown,
    PinchIn,
    PinchOut,
    Rotate,
    Custom(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Stroke {
    pub points: Vec<(f32, f32, u64)>,
    pub pressure: Vec<f32>,
}

/// Processed command from multi-modal input
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MultiModalCommand {
    pub intent: String,
    pub entities: Vec<Entity>,
    pub confidence: f32,
    pub source_mode: InputMode,
    pub fallback_modes: Vec<InputMode>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Entity {
    pub entity_type: String,
    pub value: String,
    pub confidence: f32,
    pub start_pos: usize,
    pub end_pos: usize,
}

/// Multi-modal input processor
pub struct MultiModalProcessor {
    active_modes: Vec<InputMode>,
    command_history: Vec<MultiModalCommand>,
    fusion_weights: HashMap<InputMode, f32>,
}

impl MultiModalProcessor {
    pub fn new() -> Self {
        let mut fusion_weights = HashMap::new();
        fusion_weights.insert(InputMode::Voice, 1.0);
        fusion_weights.insert(InputMode::Keyboard, 1.0);
        fusion_weights.insert(InputMode::Mouse, 0.9);
        fusion_weights.insert(InputMode::Gesture, 0.85);
        fusion_weights.insert(InputMode::Handwritten, 0.8);
        fusion_weights.insert(InputMode::Touch, 0.9);

        Self {
            active_modes: vec![
                InputMode::Voice,
                InputMode::Keyboard,
                InputMode::Mouse,
            ],
            command_history: Vec::new(),
            fusion_weights,
        }
    }

    /// Enable input mode
    pub fn enable_mode(&mut self, mode: InputMode) {
        if !self.active_modes.contains(&mode) {
            self.active_modes.push(mode);
        }
    }

    /// Disable input mode
    pub fn disable_mode(&mut self, mode: InputMode) {
        self.active_modes.retain(|m| m != &mode);
    }

    /// Process input event and convert to command
    pub async fn process_event(&mut self, event: InputEvent) -> Result<Option<MultiModalCommand>> {
        if !self.active_modes.contains(&event.mode) {
            return Ok(None);
        }

        let command = match event.raw_data {
            InputData::Voice { transcript, .. } => self.process_voice(&transcript, event.confidence),
            InputData::Gesture { gesture_type, .. } => self.process_gesture(&gesture_type, event.confidence),
            InputData::Handwritten { recognized_text, .. } => {
                self.process_handwritten(&recognized_text, event.confidence)
            }
            InputData::Keyboard { key, modifiers } => self.process_keyboard(&key, &modifiers),
            InputData::Mouse { x, y, button, action } => self.process_mouse(x, y, button.as_deref(), &action),
        };

        if let Some(ref cmd) = command {
            self.command_history.push(cmd.clone());
        }

        Ok(command)
    }

    /// Fuse multiple inputs for higher confidence
    pub fn fuse_inputs(&self, inputs: Vec<MultiModalCommand>) -> Option<MultiModalCommand> {
        if inputs.is_empty() {
            return None;
        }

        // Weighted voting based on confidence and mode
        let mut intent_scores: HashMap<String, f32> = HashMap::new();

        for input in &inputs {
            let weight = self.fusion_weights.get(&input.source_mode).unwrap_or(&0.5);
            let score = input.confidence * weight;

            *intent_scores.entry(input.intent.clone()).or_insert(0.0) += score;
        }

        // Select highest scoring intent
        intent_scores
            .into_iter()
            .max_by(|a, b| a.1.partial_cmp(&b.1).unwrap())
            .map(|(intent, score)| MultiModalCommand {
                intent,
                entities: Vec::new(),
                confidence: score,
                source_mode: InputMode::Voice, // Fused
                fallback_modes: inputs.iter().map(|i| i.source_mode.clone()).collect(),
            })
    }

    fn process_voice(&self, transcript: &str, confidence: f32) -> Option<MultiModalCommand> {
        // Parse voice command using NLP
        let intent = self.extract_intent(transcript);
        let entities = self.extract_entities(transcript);

        Some(MultiModalCommand {
            intent,
            entities,
            confidence,
            source_mode: InputMode::Voice,
            fallback_modes: vec![],
        })
    }

    fn process_gesture(&self, gesture: &GestureType, confidence: f32) -> Option<MultiModalCommand> {
        let intent = match gesture {
            GestureType::SwipeLeft => "scroll_left".to_string(),
            GestureType::SwipeRight => "scroll_right".to_string(),
            GestureType::SwipeUp => "scroll_up".to_string(),
            GestureType::SwipeDown => "scroll_down".to_string(),
            GestureType::Tap => "click".to_string(),
            GestureType::DoubleTap => "double_click".to_string(),
            GestureType::PinchIn => "zoom_out".to_string(),
            GestureType::PinchOut => "zoom_in".to_string(),
            _ => "custom_gesture".to_string(),
        };

        Some(MultiModalCommand {
            intent,
            entities: vec![],
            confidence,
            source_mode: InputMode::Gesture,
            fallback_modes: vec![],
        })
    }

    fn process_handwritten(&self, text: &str, confidence: f32) -> Option<MultiModalCommand> {
        Some(MultiModalCommand {
            intent: "type_text".to_string(),
            entities: vec![Entity {
                entity_type: "text".to_string(),
                value: text.to_string(),
                confidence,
                start_pos: 0,
                end_pos: text.len(),
            }],
            confidence,
            source_mode: InputMode::Handwritten,
            fallback_modes: vec![],
        })
    }

    fn process_keyboard(&self, key: &str, _modifiers: &[String]) -> Option<MultiModalCommand> {
        let intent = match key.as_str() {
            "Enter" => "confirm",
            "Escape" => "cancel",
            "Tab" => "next_field",
            _ => "key_press",
        };

        Some(MultiModalCommand {
            intent: intent.to_string(),
            entities: vec![Entity {
                entity_type: "key".to_string(),
                value: key.to_string(),
                confidence: 1.0,
                start_pos: 0,
                end_pos: key.len(),
            }],
            confidence: 1.0,
            source_mode: InputMode::Keyboard,
            fallback_modes: vec![],
        })
    }

    fn process_mouse(&self, x: f32, y: f32, button: Option<&str>, action: &str) -> Option<MultiModalCommand> {
        let intent = match action.as_str() {
            "click" => "click",
            "double_click" => "double_click",
            "drag" => "drag",
            "scroll" => "scroll",
            _ => "mouse_action",
        };

        Some(MultiModalCommand {
            intent: intent.to_string(),
            entities: vec![
                Entity {
                    entity_type: "x".to_string(),
                    value: x.to_string(),
                    confidence: 1.0,
                    start_pos: 0,
                    end_pos: 0,
                },
                Entity {
                    entity_type: "y".to_string(),
                    value: y.to_string(),
                    confidence: 1.0,
                    start_pos: 0,
                    end_pos: 0,
                },
                Entity {
                    entity_type: "button".to_string(),
                    value: button.unwrap_or("left").to_string(),
                    confidence: 1.0,
                    start_pos: 0,
                    end_pos: 0,
                },
            ],
            confidence: 1.0,
            source_mode: InputMode::Mouse,
            fallback_modes: vec![],
        })
    }

    fn extract_intent(&self, text: &str) -> String {
        let lower = text.to_lowercase();
        if lower.contains("click") || lower.contains("press") {
            "click".to_string()
        } else if lower.contains("type") || lower.contains("enter") {
            "type_text".to_string()
        } else if lower.contains("scroll") {
            "scroll".to_string()
        } else if lower.contains("open") || lower.contains("launch") {
            "open_application".to_string()
        } else if lower.contains("close") || lower.contains("exit") {
            "close_application".to_string()
        } else {
            "unknown".to_string()
        }
    }

    fn extract_entities(&self, text: &str) -> Vec<Entity> {
        let mut entities = Vec::new();

        // Simple entity extraction
        let words: Vec<&str> = text.split_whitespace().collect();
        for (i, word) in words.iter().enumerate() {
            if word.starts_with('\'') && word.ends_with('\'') {
                entities.push(Entity {
                    entity_type: "quoted_text".to_string(),
                    value: word.trim_matches('\'').to_string(),
                    confidence: 0.9,
                    start_pos: i,
                    end_pos: i + 1,
                });
            }
        }

        entities
    }
}
