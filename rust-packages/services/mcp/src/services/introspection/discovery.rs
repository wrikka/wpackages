use std::time::Duration;
use tokio::time::interval;
use tracing::{debug, info, warn};

#[derive(Debug, Clone)]
pub struct DiscoveryConfig {
    pub discovery_interval: Duration,
    pub cache_ttl: Duration,
    pub auto_discover: bool,
}

impl Default for DiscoveryConfig {
    fn default() -> Self {
        Self {
            discovery_interval: Duration::from_secs(60),
            cache_ttl: Duration::from_secs(300),
            auto_discover: true,
        }
    }
}

pub struct DiscoveryService {
    config: DiscoveryConfig,
    discovered_servers: Vec<String>,
    last_discovery: std::time::Instant,
}

impl DiscoveryService {
    pub fn new(config: DiscoveryConfig) -> Self {
        Self {
            config,
            discovered_servers: Vec::new(),
            last_discovery: std::time::Instant::now(),
        }
    }

    pub async fn discover(&mut self) -> Vec<String> {
        info!("Starting server discovery");
        
        let mut servers = Vec::new();
        
        servers.push("localhost:8080".to_string());
        servers.push("localhost:8081".to_string());
        servers.push("localhost:8082".to_string());

        self.discovered_servers = servers.clone();
        self.last_discovery = std::time::Instant::now();

        debug!("Discovered {} servers", servers.len());

        servers
    }

    pub async fn start_discovery_loop<F>(&self, callback: F)
    where
        F: Fn(Vec<String>) + Send + 'static,
    {
        let mut interval = interval(self.config.discovery_interval);

        loop {
            interval.tick().await;

            if self.config.auto_discover {
                info!("Auto-discovery triggered");
                let mut service = DiscoveryService::new(self.config.clone());
                let servers = service.discover().await;
                callback(servers);
            }
        }
    }

    pub fn get_discovered_servers(&self) -> Vec<String> {
        self.discovered_servers.clone()
    }

    pub fn is_cache_valid(&self) -> bool {
        self.last_discovery.elapsed() < self.config.cache_ttl
    }
}
