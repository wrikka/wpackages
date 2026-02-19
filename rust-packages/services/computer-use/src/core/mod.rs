//! Core Capabilities (Features 1-10 + New Features)
//!
//! This module implements the foundational features for AI Computer Use:
//! 1. Smart Element Detection
//! 2. Self-Healing Automation
//! 3. Multi-Modal Input
//! 4. Visual Workflow Builder
//! 5. Intelligent Wait Conditions
//! 6. Cross-App Data Flow
//! 7. Error Prediction
//! 8. Session Replay & Debug
//! 9. Permission-Based Actions
//! 10. Scheduled Automation

pub mod vision;
pub mod screen_analysis;
pub mod multimodal;
pub mod ui_grounding;
pub mod action_planning;
pub mod task_decomposition;
pub mod reasoning;
pub mod action_execution;
pub mod error_recovery;
pub mod platform;
pub mod smart_detection;
pub mod multimodal_input;
pub mod wait_conditions;
pub mod data_flow;
pub mod session_replay;
pub mod context_aware;
pub mod headless_service;

// Re-export core types from crate::types
pub use crate::types::{Action, BoundingBox, Position, ScreenInfo, TaskGoal, UIElement};

pub use vision::*;
pub use screen_analysis::*;
pub use multimodal::*;
pub use ui_grounding::*;
pub use action_planning::*;
pub use task_decomposition::*;
pub use reasoning::*;
pub use action_execution::*;
pub use error_recovery::*;
pub use platform::*;
pub use smart_detection::*;
pub use multimodal_input::*;
pub use wait_conditions::*;
pub use data_flow::*;
pub use session_replay::*;
pub use context_aware::*;
pub use headless_service::*;
