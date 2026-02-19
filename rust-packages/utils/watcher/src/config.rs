use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::time::Duration;

// Action Definitions

/// Defines an action to be taken when an event occurs.
#[doc = "This enum allows for defining different types of actions, such as executing a shell command or sending an HTTP request."]
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Action {
    Command(CommandAction),
    Http(HttpAction),
}

/// Defines an action that executes a shell command.
#[doc = "The command and its arguments will be executed in a non-blocking manner."]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandAction {
    pub command: String,
    #[serde(default)]
    pub args: Vec<String>,
    #[serde(default)]
    pub working_dir: Option<PathBuf>,
}

/// Defines an action that sends an HTTP request.
#[doc = "This is useful for triggering webhooks or notifying external services."]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpAction {
    pub url: String,
    #[serde(default = "default_http_method")]
    pub method: String,
    #[serde(default)]
    pub headers: std::collections::HashMap<String, String>,
    #[serde(default)]
    pub body: Option<String>,
}

fn default_http_method() -> String {
    "POST".to_string()
}

// Core Configuration

/// Main configuration for the watcher.
#[doc = "This struct is the primary way to customize the watcher's behavior."]
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Config {
    #[serde(default)]
    pub backend: Backend,
    #[serde(default)]
    pub debouncing: Debouncing,
    #[serde(default)]
    pub filtering: Filtering,
    #[serde(default)]
    pub polling: PollingConfig,
    #[serde(default = "default_true")]
    pub follow_symlinks: bool,
    #[serde(default = "default_true")]
    pub watch_metadata: bool,
    #[serde(default)]
    pub actions: Vec<Action>,
}

/// Specifies the watcher backend to use.
#[doc = "Allows for explicit selection of a backend or automatic detection."]
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Default)]
pub enum Backend {
    #[default]
    Automatic,
    Native,
    Polling,
}

/// Configuration for event debouncing and aggregation.
#[doc = "Helps to control the flow of events and reduce noise from rapid changes."]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Debouncing {
    pub timeout: Duration,
    pub aggregate: bool,
}

impl Default for Debouncing {
    fn default() -> Self {
        Self { 
            timeout: Duration::from_millis(500), 
            aggregate: true 
        }
    }
}

/// Configuration for filtering which paths should be watched.
#[doc = "Supports include/exclude patterns and respecting VCS ignore files."]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Filtering {
    pub include: Vec<String>,
    pub exclude: Vec<String>,
    pub ignore_vcs: bool,
}

impl Default for Filtering {
    fn default() -> Self {
        Self { 
            include: Vec::new(), 
            exclude: Vec::new(), 
            ignore_vcs: true 
        }
    }
}

/// Configuration specific to the `Polling` backend.
#[doc = "These settings only apply when the polling backend is active."]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PollingConfig {
    pub interval: Duration,
    pub compare_contents: bool,
}

impl Default for PollingConfig {
    fn default() -> Self {
        Self { 
            interval: Duration::from_secs(1), 
            compare_contents: false 
        }
    }
}

fn default_true() -> bool {
    true
}
