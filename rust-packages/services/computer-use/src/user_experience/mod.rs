//! User Experience (Features 31-40 + New Features)
//!
//! This module implements user experience features:
//! 31. Natural Language Interface
//! 32. Visual Feedback & Progress Display
//! 33. Personalized Workflow Learning
//! 34. Intelligent Help & Suggestions
//! 35. Multi-Language Support
//! 36. Voice Command Integration
//! 37. Keyboard Shortcut Optimization
//! 38. Customizable Automation Rules
//! 39. Performance Analytics
//! 40. Seamless Integration Ecosystem
//!
//! New Features:
//! - Visual Workflow Builder
//! - Analytics Engine
//! - Natural Language to Script

pub mod natural_language;
pub mod visual_feedback;
pub mod personalization;
pub mod help_system;
pub mod multi_language;
pub mod voice_integration;
pub mod keyboard_shortcuts;
pub mod automation_rules;
pub mod analytics;
pub mod integration;
pub mod workflow_builder;
pub mod analytics_engine;
pub mod natural_language_script;

pub use natural_language::*;
pub use visual_feedback::*;
pub use personalization::*;
pub use help_system::*;
pub use multi_language::*;
pub use voice_integration::*;
pub use keyboard_shortcuts::*;
pub use automation_rules::*;
pub use analytics::*;
pub use integration::*;
pub use workflow_builder::*;
pub use analytics_engine::*;
pub use natural_language_script::*;
