use crate::error::Result;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProxyConfig {
    pub host: String,
    pub port: u16,
    pub username: Option<String>,
    pub password: Option<String>,
    pub protocol: ProxyProtocol,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub enum ProxyProtocol {
    #[default]
    Http,
    Https,
    Socks4,
    Socks5,
}

#[async_trait]
pub trait ProxyRotationService: Send + Sync {
    async fn add_proxy(&self, session_id: &str, config: ProxyConfig) -> Result<String>;
    async fn remove_proxy(&self, session_id: &str, proxy_id: &str) -> Result<()>;
    async fn rotate(&self, session_id: &str) -> Result<ProxyConfig>;
    async fn get_current(&self, session_id: &str) -> Result<Option<ProxyConfig>>;
    async fn list_proxies(&self, session_id: &str) -> Result<Vec<ProxyConfig>>;
}
