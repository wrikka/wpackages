use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;
use tracing::{debug, info, warn};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HealthStatus {
    Healthy,
    Degraded,
    Unhealthy,
}

#[derive(Debug, Clone)]
pub struct HealthConfig {
    pub check_interval: Duration,
    pub failure_threshold: usize,
    pub recovery_threshold: usize,
}

impl Default for HealthConfig {
    fn default() -> Self {
        Self {
            check_interval: Duration::from_secs(30),
            failure_threshold: 3,
            recovery_threshold: 2,
        }
    }
}

pub struct HealthChecker {
    status: Arc<RwLock<HealthStatus>>,
    failure_count: Arc<RwLock<usize>>,
    success_count: Arc<RwLock<usize>>,
    last_check: Arc<RwLock<Option<Instant>>>,
    config: HealthConfig,
}

impl HealthChecker {
    pub fn new(config: HealthConfig) -> Self {
        Self {
            status: Arc::new(RwLock::new(HealthStatus::Healthy)),
            failure_count: Arc::new(RwLock::new(0)),
            success_count: Arc::new(RwLock::new(0)),
            last_check: Arc::new(RwLock::new(None)),
            config,
        }
    }

    pub async fn status(&self) -> HealthStatus {
        *self.status.read().await
    }

    pub async fn check<F>(&self, f: F) -> bool
    where
        F: FnOnce() -> bool,
    {
        let is_healthy = f();
        let now = Instant::now();

        if is_healthy {
            self.on_success().await;
        } else {
            self.on_failure().await;
        }

        *self.last_check.write().await = Some(now);

        is_healthy
    }

    async fn on_success(&self) {
        let status = self.status().await;

        match status {
            HealthStatus::Unhealthy | HealthStatus::Degraded => {
                let mut count = self.success_count.write().await;
                *count += 1;

                if *count >= self.config.recovery_threshold {
                    info!("Health status recovering to Healthy");
                    *self.status.write().await = HealthStatus::Healthy;
                    *self.failure_count.write().await = 0;
                    *self.success_count.write().await = 0;
                } else if status == HealthStatus::Unhealthy {
                    info!("Health status improving to Degraded");
                    *self.status.write().await = HealthStatus::Degraded;
                }
            }
            HealthStatus::Healthy => {
                *self.failure_count.write().await = 0;
            }
        }
    }

    async fn on_failure(&self) {
        let status = self.status().await;

        match status {
            HealthStatus::Healthy | HealthStatus::Degraded => {
                let mut count = self.failure_count.write().await;
                *count += 1;

                if *count >= self.config.failure_threshold {
                    warn!("Health status degrading to Unhealthy");
                    *self.status.write().await = HealthStatus::Unhealthy;
                    *self.success_count.write().await = 0;
                } else if status == HealthStatus::Healthy {
                    info!("Health status degrading to Degraded");
                    *self.status.write().await = HealthStatus::Degraded;
                }
            }
            HealthStatus::Unhealthy => {}
        }
    }

    pub async fn last_check(&self) -> Option<Instant> {
        *self.last_check.read().await
    }
}
