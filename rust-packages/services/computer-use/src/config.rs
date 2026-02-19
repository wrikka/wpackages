//! Configuration management for computer-use
//!
//! Uses figment for configuration from multiple sources:
//! - Config.toml file
//! - Environment variables (COMPUTER_USE_*)
//! - Command-line arguments

use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

use crate::error::{Error, Result};

/// Main configuration structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    /// Application settings
    pub app: AppConfig,
    /// Daemon settings
    pub daemon: DaemonConfig,
    /// Logging settings
    pub logging: LoggingConfig,
    /// Memory settings
    pub memory: MemoryConfig,
    /// Safety settings
    pub safety: SafetyConfig,
    /// Vision settings
    pub vision: VisionConfig,
    /// Learning settings
    pub learning: LearningConfig,
    /// Multi-agent settings
    pub multi_agent: MultiAgentConfig,
    /// Knowledge graph settings
    pub knowledge_graph: KnowledgeGraphConfig,
    /// Scheduler settings
    pub scheduler: SchedulerConfig,
    /// Analytics settings
    pub analytics: AnalyticsConfig,
}

/// Application configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    /// Application name
    pub name: String,
    /// Application version
    pub version: String,
    /// Environment (development, production, test)
    pub environment: Environment,
}

/// Runtime environment
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum Environment {
    #[default]
    Development,
    Production,
    Test,
}

impl Environment {
    /// Check if running in development mode
    pub const fn is_development(&self) -> bool {
        matches!(self, Environment::Development)
    }

    /// Check if running in production mode
    pub const fn is_production(&self) -> bool {
        matches!(self, Environment::Production)
    }

    /// Check if running in test mode
    pub const fn is_test(&self) -> bool {
        matches!(self, Environment::Test)
    }
}

/// Daemon configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DaemonConfig {
    /// Host to bind to
    pub host: String,
    /// Minimum port range
    pub port_min: u16,
    /// Maximum port range
    pub port_max: u16,
    /// Default session name
    pub session_default: String,
}

/// Logging configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoggingConfig {
    /// Log level (trace, debug, info, warn, error)
    pub level: String,
    /// Log format (pretty, json, compact)
    pub format: String,
    /// Enable file logging
    pub file_enabled: bool,
    /// Log file path
    pub file_path: PathBuf,
}

/// Memory configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryConfig {
    /// Enable memory system
    pub enabled: bool,
    /// Maximum entries in memory
    pub max_entries: usize,
    /// Time-to-live in seconds
    pub ttl_seconds: u64,
}

/// Safety configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SafetyConfig {
    /// Enable safety system
    pub enabled: bool,
    /// Require confirmation for dangerous operations
    pub require_confirmation: bool,
    /// List of dangerous command patterns
    pub dangerous_commands: Vec<String>,
    /// Enable sandbox mode
    pub sandbox_enabled: bool,
}

/// Vision configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VisionConfig {
    /// Enable vision system
    pub enabled: bool,
    /// Enable OCR
    pub ocr_enabled: bool,
    /// Screenshot format (png, jpeg)
    pub screenshot_format: String,
    /// Screenshot quality (1-100)
    pub screenshot_quality: u8,
}

/// Learning configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LearningConfig {
    /// Enable learning system
    pub enabled: bool,
    /// Enable feedback collection
    pub feedback_collection: bool,
    /// Model update interval in seconds
    pub model_update_interval: u64,
}

/// Multi-agent configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MultiAgentConfig {
    /// Enable multi-agent system
    pub enabled: bool,
    /// Maximum number of agents
    pub max_agents: usize,
    /// Communication channel size
    pub communication_channel_size: usize,
}

/// Knowledge graph configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeGraphConfig {
    /// Enable knowledge graph
    pub enabled: bool,
    /// Maximum nodes
    pub max_nodes: usize,
    /// Maximum edges
    pub max_edges: usize,
}

/// Scheduler configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchedulerConfig {
    /// Enable scheduler
    pub enabled: bool,
    /// Maximum concurrent tasks
    pub max_concurrent_tasks: usize,
    /// Task timeout in seconds
    pub task_timeout_seconds: u64,
}

/// Analytics configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalyticsConfig {
    /// Enable analytics
    pub enabled: bool,
    /// Track performance metrics
    pub track_performance: bool,
    /// Track error metrics
    pub track_errors: bool,
    /// Report interval in seconds
    pub report_interval: u64,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            app: AppConfig {
                name: "computer-use".to_string(),
                version: env!("CARGO_PKG_VERSION").to_string(),
                environment: Environment::default(),
            },
            daemon: DaemonConfig {
                host: "127.0.0.1".to_string(),
                port_min: 40000,
                port_max: 60000,
                session_default: "default".to_string(),
            },
            logging: LoggingConfig {
                level: "info".to_string(),
                format: "pretty".to_string(),
                file_enabled: false,
                file_path: PathBuf::from("logs/computer-use.log"),
            },
            memory: MemoryConfig {
                enabled: true,
                max_entries: 10000,
                ttl_seconds: 86400,
            },
            safety: SafetyConfig {
                enabled: true,
                require_confirmation: true,
                dangerous_commands: vec![
                    "rm".to_string(),
                    "format".to_string(),
                    "delete".to_string(),
                    "kill".to_string(),
                ],
                sandbox_enabled: false,
            },
            vision: VisionConfig {
                enabled: true,
                ocr_enabled: true,
                screenshot_format: "png".to_string(),
                screenshot_quality: 90,
            },
            learning: LearningConfig {
                enabled: true,
                feedback_collection: true,
                model_update_interval: 3600,
            },
            multi_agent: MultiAgentConfig {
                enabled: true,
                max_agents: 10,
                communication_channel_size: 100,
            },
            knowledge_graph: KnowledgeGraphConfig {
                enabled: true,
                max_nodes: 100000,
                max_edges: 500000,
            },
            scheduler: SchedulerConfig {
                enabled: true,
                max_concurrent_tasks: 5,
                task_timeout_seconds: 300,
            },
            analytics: AnalyticsConfig {
                enabled: true,
                track_performance: true,
                track_errors: true,
                report_interval: 60,
            },
        }
    }
}

impl Config {
    /// Load configuration from file and environment
    pub fn load() -> Result<Self> {
        Self::load_from_path("Config.toml")
    }

    /// Load configuration from specific path
    pub fn load_from_path(path: impl AsRef<std::path::Path>) -> Result<Self> {
        let path = path.as_ref();

        let config = Figment::new()
            .merge(Toml::file(path))
            .merge(Env::prefixed("COMPUTER_USE_").split("__"))
            .extract()
            .map_err(|e| Error::Config(format!("Failed to load config: {}", e)))?;

        Ok(config)
    }

    /// Get daemon port for a session
    pub fn session_port(&self, session: &str) -> u16 {
        let hash = Self::hash_session(session);
        let range = (self.daemon.port_max - self.daemon.port_min) as u32;
        self.daemon.port_min + ((hash % range) as u16)
    }

    /// Hash session name to port offset
    fn hash_session(session: &str) -> u32 {
        let mut hash: u32 = 2166136261;
        for byte in session.bytes() {
            hash ^= byte as u32;
            hash = hash.wrapping_mul(16777619);
        }
        hash
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = Config::default();
        assert_eq!(config.app.name, "computer-use");
        assert!(config.memory.enabled);
    }

    #[test]
    fn test_environment_checks() {
        assert!(Environment::Development.is_development());
        assert!(!Environment::Development.is_production());
        assert!(Environment::Production.is_production());
        assert!(Environment::Test.is_test());
    }

    #[test]
    fn test_session_port() {
        let config = Config::default();
        let port1 = config.session_port("default");
        let port2 = config.session_port("test");
        assert!(port1 >= config.daemon.port_min);
        assert!(port1 <= config.daemon.port_max);
        assert_ne!(port1, port2);
    }
}
