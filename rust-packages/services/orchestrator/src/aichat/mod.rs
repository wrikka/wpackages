//! AI Chat Logic Module
//!
//! Provides core logic for AI chat functionality without UI dependencies.

pub mod services;
pub mod types;

pub use services::*;
pub use types::*;

pub type AiChatResult<T> = std::result::Result<T, super::AiSuiteError>;
