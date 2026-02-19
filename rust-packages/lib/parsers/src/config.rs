use crate::error::{ParseError, Result};
use serde::Deserialize;
use std::path::PathBuf;

/// Library configuration
#[derive(Debug, Clone, Default, Deserialize)]
pub struct Config {
    /// Maximum file size for parsing (in bytes)
    #[serde(default = "10485760")] // 10MB
    pub max_file_size: usize,
    
    /// Maximum parsing depth
    #[serde(default = "10")]
    pub max_depth: usize,
    
    /// Enable format auto-detection
    #[serde(default = "true")]
    pub auto_detection: bool,
    
    /// Enable validation
    #[serde(default = "false")]
    pub validation_enabled: bool,
    
    /// Custom schema file path
    pub schema_path: Option<PathBuf>,
    
    /// Log level
    #[serde(default = "info")]
    pub log_level: LogLevel,
}

/// Logging levels
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum LogLevel {
    Error,
    Warn,
    Info,
    Debug,
    Trace,
}

impl LogLevel {
    /// Convert to tracing level
    pub const fn to_tracing(self) -> tracing::Level {
        match self {
            Self::Error => tracing::Level::ERROR,
            Self::Warn => tracing::Level::WARN,
            Self::Info => tracing::Level::INFO,
            Self::Debug => tracing::Level::DEBUG,
            Self::Trace => tracing::Level::TRACE,
        }
    }
    
    /// Parse from string
    pub fn from_str(s: &str) -> Result<Self> {
        match s.to_lowercase().as_str() {
            "error" => Ok(Self::Error),
            "warn" => Ok(Self::Warn),
            "info" => Ok(Self::Info),
            "debug" => Ok(Self::Debug),
            "trace" => Ok(Self::Trace),
            _ => Err(ParseError::Config(format!("Invalid log level: {}", s))),
        }
    }
}

impl Config {
    /// Load configuration from environment variables
    pub fn from_env() -> Result<Self> {
        let mut config = Self::default();
        
        // Override with environment variables
        if let Ok(size) = std::env::var("PARSERS_MAX_FILE_SIZE") {
            config.max_file_size = size.parse()
                .map_err(|_| ParseError::Config("Invalid PARSERS_MAX_FILE_SIZE".to_string()))?;
        }
        
        if let Ok(security) = std::env::var("PARSERS_SECURITY_ENABLED") {
            config.security_enabled = security.parse()
                .map_err(|_| ParseError::Config("Invalid PARSERS_SECURITY_ENABLED".to_string()))?;
        }
        
        if let Ok(strict) = std::env::var("PARSERS_STRICT_MODE") {
            config.strict_mode = strict.parse()
                .map_err(|_| ParseError::Config("Invalid PARSERS_STRICT_MODE".to_string()))?;
        }
        
        if let Ok(depth) = std::env::var("PARSERS_MAX_DEPTH") {
            config.max_depth = depth.parse()
                .map_err(|_| ParseError::Config("Invalid PARSERS_MAX_DEPTH".to_string()))?;
        }
        
        if let Ok(ttl) = std::env::var("PARSERS_CACHE_TTL") {
            config.cache_ttl_seconds = ttl.parse()
                .map_err(|_| ParseError::Config("Invalid PARSERS_CACHE_TTL".to_string()))?;
        }
        
        if let Ok(level) = std::env::var("PARSERS_LOG_LEVEL") {
            config.log_level = LogLevel::from_str(&level)?;
        }
        
        Ok(config)
    }
    
    /// Load configuration from file
    pub async fn from_file(path: &PathBuf) -> Result<Self> {
        let content = tokio::fs::read_to_string(path).await?;
        toml::from_str(&content)
            .map_err(|e| ParseError::Config(format!("Failed to parse config file: {}", e)))
    }
    
    /// Save configuration to file
    pub async fn save_to_file(&self, path: &PathBuf) -> Result<()> {
        let content = toml::to_string_pretty(self)
            .map_err(|e| ParseError::Config(format!("Failed to serialize config: {}", e)))?;
        tokio::fs::write(path, content).await?;
        Ok(())
    }
    
    /// Validate configuration
    pub fn validate(&self) -> Result<()> {
        if self.max_file_size == 0 {
            return Err(ParseError::Config("max_file_size cannot be zero".to_string()));
        }
        
        if self.max_depth == 0 {
            return Err(ParseError::Config("max_depth cannot be zero".to_string()));
        }
        
        if self.cache_ttl_seconds == 0 {
            return Err(ParseError::Config("cache_ttl_seconds cannot be zero".to_string()));
        }
        
        Ok(())
    }
    
    /// Get default configuration file path
    pub fn default_config_path() -> PathBuf {
        match dirs::config_dir() {
            Some(dir) => dir.join("parsers").join("config.toml"),
            None => PathBuf::from("config.toml"),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_config_defaults() {
        let config = Config::default();
        assert_eq!(config.max_file_size, 10485760);
        assert!(config.security_enabled);
        assert!(!config.strict_mode);
        assert_eq!(config.max_depth, 100);
        assert_eq!(config.cache_ttl_seconds, 300);
        assert!(config.auto_detection);
        assert!(!config.validation_enabled);
        assert_eq!(config.log_level, LogLevel::Info);
    }

    #[test]
    fn test_config_from_env() {
        std::env::set_var("PARSERS_MAX_FILE_SIZE", "2048");
        std::env::set_var("PARSERS_SECURITY_ENABLED", "false");
        std::env::set_var("PARSERS_LOG_LEVEL", "debug");
        
        let config = Config::from_env().unwrap();
        assert_eq!(config.max_file_size, 2048);
        assert!(!config.security_enabled);
        assert_eq!(config.log_level, LogLevel::Debug);
        
        // Clean up
        std::env::remove_var("PARSERS_MAX_FILE_SIZE");
        std::env::remove_var("PARSERS_SECURITY_ENABLED");
        std::env::remove_var("PARSERS_LOG_LEVEL");
    }

    #[test]
    fn test_config_validation() {
        let mut config = Config::default();
        assert!(config.validate().is_ok());
        
        config.max_file_size = 0;
        assert!(config.validate().is_err());
        
        config.max_file_size = 1024;
        config.max_depth = 0;
        assert!(config.validate().is_err());
    }
}
