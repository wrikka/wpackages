use crate::config::{CommandAction, HttpAction};
use crate::error::{Result, WatcherError};
use crate::event::Event;
use async_trait::async_trait;
use log::{debug, error, info};

/// A trait for processing filesystem events.
#[doc = "Implement this trait to create custom actions that can be triggered by file changes."]
#[async_trait]
pub trait EventProcessor: Send + Sync {
    /// Processes a single event.
    async fn process(&self, event: &Event) -> Result<()>;
}

/// An `EventProcessor` that executes a shell command in response to an event.
#[derive(Debug, Clone)]
pub struct CommandProcessor {
    action: CommandAction,
}

impl CommandProcessor {
    pub fn new(action: CommandAction) -> Self {
        Self { action }
    }
}

#[async_trait]
impl EventProcessor for CommandProcessor {
    async fn process(&self, _event: &Event) -> Result<()> {
        info!("Executing command: {} with args {:?}", self.action.command, self.action.args);
        let mut cmd = tokio::process::Command::new(&self.action.command);
        cmd.args(&self.action.args);
        if let Some(cwd) = &self.action.working_dir {
            cmd.current_dir(cwd);
        }

        let status = cmd.status().await.map_err(|e| WatcherError::ActionError(e.to_string()))?;

        if status.success() {
            debug!("Command executed successfully.");
            Ok(())
        } else {
            Err(WatcherError::ActionError(format!("Command exited with status: {}", status)))
        }
    }
}

/// An `EventProcessor` that sends an HTTP request in response to an event.
#[derive(Debug, Clone)]
pub struct HttpProcessor {
    action: HttpAction,
}

impl HttpProcessor {
    pub fn new(action: HttpAction) -> Self {
        Self { action }
    }
}

#[async_trait]
impl EventProcessor for HttpProcessor {
    async fn process(&self, _event: &Event) -> Result<()> {
        info!("Executing HTTP request: {} {}", self.action.method, self.action.url);
        let client = reqwest::Client::new();
        let method = reqwest::Method::from_bytes(self.action.method.to_uppercase().as_bytes())
            .map_err(|_| WatcherError::ActionError(format!("Invalid HTTP method: {}", self.action.method)))?;

        let mut request = client.request(method, &self.action.url);

        for (key, value) in &self.action.headers {
            request = request.header(key, value);
        }

        if let Some(body) = &self.action.body {
            request = request.body(body.clone());
        }

        let response = request.send().await.map_err(|e| WatcherError::ActionError(e.to_string()))?;

        if response.status().is_success() {
            debug!("HTTP request successful: {}", response.status());
            Ok(())
        } else {
            Err(WatcherError::ActionError(format!("HTTP request failed with status: {}", response.status())))
        }
    }
}

