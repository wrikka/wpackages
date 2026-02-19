use crate::error::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Proxy {
    pub id: String,
    pub host: String,
    pub port: u16,
    pub username: Option<String>,
    pub password: Option<String>,
    pub protocol: ProxyProtocol,
    pub country: Option<String>,
    pub city: Option<String>,
    pub latency_ms: Option<u64>,
    pub last_used: Option<String>,
    pub use_count: u64,
    pub failed_attempts: u64,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum ProxyProtocol {
    Http,
    Https,
    Socks4,
    Socks5,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProxyRotationConfig {
    pub strategy: RotationStrategy,
    pub max_requests_per_proxy: u32,
    pub max_failures_per_proxy: u32,
    pub rotate_on_session: bool,
    pub sticky_sessions: bool,
    pub health_check_interval_secs: u64,
    pub blacklist_duration_secs: u64,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum RotationStrategy {
    RoundRobin,
    Random,
    LeastUsed,
    LowestLatency,
    Geographic,
    SessionSticky,
}

impl Default for ProxyRotationConfig {
    fn default() -> Self {
        Self {
            strategy: RotationStrategy::RoundRobin,
            max_requests_per_proxy: 100,
            max_failures_per_proxy: 3,
            rotate_on_session: true,
            sticky_sessions: false,
            health_check_interval_secs: 300,
            blacklist_duration_secs: 3600,
        }
    }
}

pub struct ProxyRotator {
    proxies: Arc<Mutex<Vec<Proxy>>>,
    config: ProxyRotationConfig,
    current_index: Arc<Mutex<usize>>,
    session_proxies: Arc<Mutex<HashMap<String, String>>>,
}

impl ProxyRotator {
    pub fn new(config: ProxyRotationConfig) -> Self {
        Self {
            proxies: Arc::new(Mutex::new(Vec::new())),
            config,
            current_index: Arc::new(Mutex::new(0)),
            session_proxies: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn add_proxy(&self, proxy: Proxy) {
        let mut proxies = self.proxies.lock().unwrap();
        proxies.push(proxy);
    }

    pub fn add_proxies(&self, proxies: Vec<Proxy>) {
        let mut guard = self.proxies.lock().unwrap();
        guard.extend(proxies);
    }

    pub fn remove_proxy(&self, proxy_id: &str) {
        let mut proxies = self.proxies.lock().unwrap();
        proxies.retain(|p| p.id != proxy_id);
    }

    pub fn get_next_proxy(&self, session_id: Option<&str>) -> Option<Proxy> {
        let mut proxies = self.proxies.lock().unwrap();
        
        if proxies.is_empty() {
            return None;
        }

        // Check sticky session
        if self.config.sticky_sessions {
            if let Some(session_id) = session_id {
                let session_proxies = self.session_proxies.lock().unwrap();
                if let Some(proxy_id) = session_proxies.get(session_id) {
                    if let Some(proxy) = proxies.iter().find(|p| &p.id == proxy_id) {
                        return Some(proxy.clone());
                    }
                }
            }
        }

        // Filter out blacklisted proxies (simplified)
        let available: Vec<&mut Proxy> = proxies.iter_mut()
            .filter(|p| p.failed_attempts < self.config.max_failures_per_proxy as u64)
            .collect();

        if available.is_empty() {
            return None;
        }

        let selected = match self.config.strategy {
            RotationStrategy::RoundRobin => {
                let mut index = self.current_index.lock().unwrap();
                let proxy = &available[*index % available.len()];
                *index = (*index + 1) % available.len();
                proxy.clone()
            }
            RotationStrategy::Random => {
                use std::time::{SystemTime, UNIX_EPOCH};
                let seed = SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_nanos();
                let index = (seed % available.len() as u128) as usize;
                available[index].clone()
            }
            RotationStrategy::LeastUsed => {
                let min = available.iter().min_by_key(|p| p.use_count);
                min.unwrap().clone()
            }
            RotationStrategy::LowestLatency => {
                let min = available.iter()
                    .filter(|p| p.latency_ms.is_some())
                    .min_by_key(|p| p.latency_ms.unwrap_or(u64::MAX));
                min.map(|p| p.clone())
                    .or_else(|| available.first().map(|p| p.clone()))
                    .unwrap()
            }
            RotationStrategy::Geographic | RotationStrategy::SessionSticky => {
                // Default to round robin for now
                let mut index = self.current_index.lock().unwrap();
                let proxy = &available[*index % available.len()];
                *index = (*index + 1) % available.len();
                proxy.clone()
            }
        };

        // Update usage stats
        if let Some(proxy) = proxies.iter_mut().find(|p| p.id == selected.id) {
            proxy.use_count += 1;
            proxy.last_used = Some(chrono::Utc::now().to_rfc3339());
        }

        // Store for sticky session
        if self.config.sticky_sessions {
            if let Some(session_id) = session_id {
                let mut session_proxies = self.session_proxies.lock().unwrap();
                session_proxies.insert(session_id.to_string(), selected.id.clone());
            }
        }

        Some(selected)
    }

    pub fn mark_proxy_failed(&self, proxy_id: &str) {
        let mut proxies = self.proxies.lock().unwrap();
        if let Some(proxy) = proxies.iter_mut().find(|p| p.id == proxy_id) {
            proxy.failed_attempts += 1;
        }
    }

    pub fn get_proxy_string(&self, proxy: &Proxy) -> String {
        let auth = if let (Some(user), Some(pass)) = (&proxy.username, &proxy.password) {
            format!("{}:{}@", user, pass)
        } else {
            String::new()
        };

        match proxy.protocol {
            ProxyProtocol::Http => format!("http://{}{}:{}", auth, proxy.host, proxy.port),
            ProxyProtocol::Https => format!("https://{}{}:{}", auth, proxy.host, proxy.port),
            ProxyProtocol::Socks4 => format!("socks4://{}{}:{}", auth, proxy.host, proxy.port),
            ProxyProtocol::Socks5 => format!("socks5://{}{}:{}", auth, proxy.host, proxy.port),
        }
    }

    pub fn list_proxies(&self) -> Vec<Proxy> {
        self.proxies.lock().unwrap().clone()
    }

    pub fn get_proxy_stats(&self) -> Vec<ProxyStats> {
        let proxies = self.proxies.lock().unwrap();
        proxies.iter().map(|p| ProxyStats {
            id: p.id.clone(),
            use_count: p.use_count,
            failed_attempts: p.failed_attempts,
            last_used: p.last_used.clone(),
            latency_ms: p.latency_ms,
            health_score: if p.failed_attempts == 0 {
                100
            } else {
                (100.0 - (p.failed_attempts as f64 / (p.use_count + 1) as f64 * 100.0)) as u8
            },
        }).collect()
    }

    pub async fn health_check(&self) -> Vec<ProxyHealthResult> {
        let proxies = self.proxies.lock().unwrap().clone();
        let mut results = Vec::new();

        for proxy in proxies {
            let start = Instant::now();
            // In production, this would actually test the proxy connection
            let latency = start.elapsed().as_millis() as u64;
            
            results.push(ProxyHealthResult {
                proxy_id: proxy.id.clone(),
                healthy: true,
                latency_ms: latency,
                error: None,
            });
        }

        results
    }
}

impl Default for ProxyRotator {
    fn default() -> Self {
        Self::new(ProxyRotationConfig::default())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProxyStats {
    pub id: String,
    pub use_count: u64,
    pub failed_attempts: u64,
    pub last_used: Option<String>,
    pub latency_ms: Option<u64>,
    pub health_score: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProxyHealthResult {
    pub proxy_id: String,
    pub healthy: bool,
    pub latency_ms: u64,
    pub error: Option<String>,
}
