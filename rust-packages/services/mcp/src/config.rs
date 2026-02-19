use figment::{Figment, providers::{Format, Toml, Env}};
use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct McpConfig {
    pub server: ServerConfig,
    pub client: ClientConfig,
}

#[derive(Deserialize, Debug)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
    pub max_connections: usize,
}

#[derive(Deserialize, Debug)]
pub struct ClientConfig {
    pub timeout_ms: u64,
    pub retry_attempts: u32,
}

impl Default for McpConfig {
    fn default() -> Self {
        Self {
            server: ServerConfig {
                host: "127.0.0.1".to_string(),
                port: 8080,
                max_connections: 100,
            },
            client: ClientConfig {
                timeout_ms: 5000,
                retry_attempts: 3,
            },
        }
    }
}

impl McpConfig {
    pub fn load() -> Result<Self, figment::Error> {
        Figment::new()
            .join(Toml::file("Config.toml"))
            .join(Env::prefixed("MCP_").split("__"))
            .extract()
    }
}
