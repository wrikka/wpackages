use crate::types::command::{Command, CommandHandler};
use crate::types::CommandId;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tracing::warn;

// Helper trait to allow cloning Box<dyn CommandHandler>.
// This is a common pattern for working with trait objects that need to be cloneable.
#[async_trait::async_trait]
pub trait CloneableCommandHandler: CommandHandler {
    fn clone_box(&self) -> Box<dyn CloneableCommandHandler>;
}

#[async_trait::async_trait]
impl<T> CloneableCommandHandler for T
where
    T: CommandHandler + Clone + 'static,
{
    fn clone_box(&self) -> Box<dyn CloneableCommandHandler> {
        Box::new(self.clone())
    }
}

/// A thread-safe registry for all commands provided by extensions.
#[derive(Clone, Default)]
pub struct CommandRegistry {
    inner: Arc<Mutex<RegistryInner>>,
}

#[derive(Default)]
struct RegistryInner {
    commands: HashMap<CommandId, Command>,
    handlers: HashMap<CommandId, Box<dyn CloneableCommandHandler>>,
}

impl CommandRegistry {
    pub fn new() -> Self {
        Self::default()
    }

    /// Registers a new command and its handler.
    pub fn register<H>(&self, command: Command, handler: H)
    where
        H: CommandHandler + Clone + 'static,
    {
        let mut inner = self.inner.lock().unwrap();
        let command_id = command.id.clone();
        if inner.commands.contains_key(&command_id) {
            warn!("Overwriting an existing command: {}", command_id);
        }
        inner.commands.insert(command_id.clone(), command);
        inner.handlers.insert(command_id, Box::new(handler));
    }

    /// Returns a list of all registered commands.
    pub fn get_all_commands(&self) -> Vec<Command> {
        let inner = self.inner.lock().unwrap();
        inner.commands.values().cloned().collect()
    }

    /// Executes a command by its ID.
    pub async fn execute_command(&self, command_id: &CommandId) -> crate::error::Result<()> {
        let handler_clone = {
            let inner = self.inner.lock().unwrap();
            inner.handlers.get(command_id).map(|h| h.clone_box())
        };

        if let Some(handler) = handler_clone {
            handler.execute().await;
            Ok(())
        } else {
            Err(crate::error::AppError::CommandNotFound(
                command_id.to_string(),
            ))
        }
    }
}
