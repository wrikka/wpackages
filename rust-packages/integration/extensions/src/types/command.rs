use crate::types::id::CommandId;
use async_trait::async_trait;
use std::fmt::Debug;

/// Represents a command that can be executed from the Command Palette.
#[derive(Debug, Clone)]
pub struct Command {
    pub id: CommandId,
    pub title: String,
    pub category: Option<String>,
}

/// A trait for a handler that executes a command's logic.
/// Extensions will provide implementations of this trait.
#[async_trait]
pub trait CommandHandler: Send + Sync {
    /// Executes the command.
    async fn execute(&self);
}
