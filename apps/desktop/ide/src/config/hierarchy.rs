use figment::{Figment, providers::{Format, Toml, Env}};
use serde::Deserialize;

#[derive(Deserialize, Debug, Clone)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
    pub max_connections: usize,
}

#[derive(Deserialize, Debug, Clone)]
pub struct HierarchyConfig {
    pub server: ServerConfig,
}

impl Default for HierarchyConfig {
    fn default() -> Self {
        Self {
            server: ServerConfig {
                host: "127.0.0.1".to_string(),
                port: 8080,
                max_connections: 100,
            },
        }
    }
}

impl HierarchyConfig {
    pub fn load() -> Result<Self, figment::Error> {
        Figment::new()
            .join(Toml::file("Config.toml"))
            .join(Env::prefixed("HIERARCHY_").split("__"))
            .extract()
    }

    pub fn load_or_default() -> Self {
        Self::load().unwrap_or_default()
    }
}
