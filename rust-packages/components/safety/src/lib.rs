//! # AI Safety Library
//!
//! Safety guardrails and content filtering for AI systems.

pub mod content_filter;
pub mod guardrails;
pub mod moderation;
pub mod pii;
pub mod types;

pub use content_filter::*;
pub use guardrails::*;
pub use moderation::*;
pub use pii::*;
pub use types::*;

pub mod prelude {
    pub use crate::guardrails::{Guardrail, GuardrailResult, SafetyConfig};
    pub use crate::content_filter::{ContentFilter, FilterRule};
    pub use crate::moderation::{ModerationResult, ModerationCategory};
    pub use crate::pii::{PiiDetector, PiiType};
}
