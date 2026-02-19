use crate::config::AppConfig;
use crate::types::Command;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Clone)]
pub struct CommandService {
    commands: Arc<RwLock<HashMap<String, Command>>>,
}

impl CommandService {
    pub fn new() -> Self {
        Self {
            commands: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn load_commands(&self, config: &AppConfig) {
        let mut commands = self.commands.write().await;
        commands.clear();

        // Load built-in commands
        commands.insert("new_tab".to_string(), Command {
            id: "new_tab".to_string(),
            title: "New Tab".to_string(),
            description: Some("Create a new tab".to_string()),
        });

        // Load commands from config
        if let Some(config_commands) = &config.commands {
            for cmd in config_commands {
                commands.insert(cmd.id.clone(), cmd.clone());
            }
        }
    }

    pub async fn list_commands(&self) -> Vec<Command> {
        let commands = self.commands.read().await;
        let mut command_list: Vec<Command> = commands.values().cloned().collect();
        command_list.sort_by(|a, b| a.title.cmp(&b.title));
        command_list
    }

    pub async fn execute_command(&self, command_id: &str) {
        // Placeholder for command execution logic
        tracing::info!("Executing command: {}", command_id);
    }
}

impl Default for CommandService {
    fn default() -> Self {
        Self::new()
    }
}
