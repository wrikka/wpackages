//! Marketplace API Configuration
//!
//! โหลด configuration จากหลายแหล่ง:
//! - ไฟล์ Config.toml
//! - Environment variables (prefix: MARKETPLACE_)
//!
//! # Example
//!
//! ```toml
//! [server]
//! port = 3000
//!
//! [database]
//! url = "postgresql://localhost/marketplace"
//!
//! [jwt]
//! secret = "your-secret-key"
//!
//! [cors]
//! origin = "*"
//! ```

use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::Deserialize;

/// Server configuration
#[derive(Debug, Deserialize, Clone)]
pub struct ServerConfig {
    /// Server port
    pub port: u16,
}

impl Default for ServerConfig {
    fn default() -> Self {
        Self { port: 3000 }
    }
}

/// Database configuration
#[derive(Debug, Deserialize, Clone)]
pub struct DatabaseConfig {
    /// Database connection URL
    pub url: String,
    /// Maximum connections in pool
    pub max_connections: u32,
}

impl Default for DatabaseConfig {
    fn default() -> Self {
        Self {
            url: "postgresql://localhost/marketplace".to_string(),
            max_connections: 10,
        }
    }
}

/// JWT configuration
#[derive(Debug, Deserialize, Clone)]
pub struct JwtConfig {
    /// JWT secret key
    pub secret: String,
    /// Token expiration in seconds
    pub expiration_secs: u64,
}

impl Default for JwtConfig {
    fn default() -> Self {
        Self {
            secret: "secret".to_string(),
            expiration_secs: 86400, // 24 hours
        }
    }
}

/// CORS configuration
#[derive(Debug, Deserialize, Clone)]
pub struct CorsConfig {
    /// Allowed origin
    pub origin: String,
}

impl Default for CorsConfig {
    fn default() -> Self {
        Self {
            origin: "*".to_string(),
        }
    }
}

/// Application configuration
#[derive(Debug, Deserialize, Clone)]
pub struct Config {
    pub server: ServerConfig,
    pub database: DatabaseConfig,
    pub jwt: JwtConfig,
    pub cors: CorsConfig,
}

impl Config {
    /// Load configuration from multiple sources
    ///
    /// Priority (highest to lowest):
    /// 1. Environment variables (MARKETPLACE_*)
    /// 2. Config.toml file
    /// 3. Default values
    ///
    /// # Example Environment Variables
    ///
    /// ```bash
    /// MARKETPLACE_SERVER__PORT=8080
    /// MARKETPLACE_DATABASE__URL=postgresql://user:pass@localhost/db
    /// MARKETPLACE_JWT__SECRET=my-secret
    /// ```
    pub fn load() -> Result<Self, figment::Error> {
        Figment::new()
            .merge(Toml::file("Config.toml").nested())
            .merge(Env::prefixed("MARKETPLACE_").split("__"))
            .extract()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = Config {
            server: ServerConfig::default(),
            database: DatabaseConfig::default(),
            jwt: JwtConfig::default(),
            cors: CorsConfig::default(),
        };

        assert_eq!(config.server.port, 3000);
        assert_eq!(config.database.max_connections, 10);
        assert_eq!(config.jwt.expiration_secs, 86400);
    }
}
