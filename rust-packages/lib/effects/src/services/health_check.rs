use crate::error::EffectError;
use crate::types::effect::Effect;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use std::time::Duration;

/// Health check status
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum HealthStatus {
    Healthy,
    Unhealthy,
    Degraded,
    Unknown,
}

impl HealthStatus {
    pub fn is_healthy(&self) -> bool {
        matches!(self, HealthStatus::Healthy)
    }
}

/// Health check result
#[derive(Debug, Clone)]
pub struct HealthCheckResult {
    pub status: HealthStatus,
    pub message: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub latency_ms: u64,
}

/// Health check function
#[async_trait::async_trait]
pub trait HealthCheck: Send + Sync {
    async fn check(&self) -> HealthCheckResult;
}

/// Simple health check implementation
pub struct SimpleHealthCheck {
    name: String,
    check_fn: Box<dyn Fn() -> bool + Send + Sync>,
}

impl SimpleHealthCheck {
    pub fn new(name: impl Into<String>, check_fn: impl Fn() -> bool + Send + Sync + 'static) -> Self {
        Self {
            name: name.into(),
            check_fn: Box::new(check_fn),
        }
    }
}

#[async_trait::async_trait]
impl HealthCheck for SimpleHealthCheck {
    async fn check(&self) -> HealthCheckResult {
        let start = std::time::Instant::now();
        let healthy = (self.check_fn)();
        let latency = start.elapsed().as_millis() as u64;

        HealthCheckResult {
            status: if healthy { HealthStatus::Healthy } else { HealthStatus::Unhealthy },
            message: if healthy {
                format!("{} is healthy", self.name)
            } else {
                format!("{} is unhealthy", self.name)
            },
            timestamp: chrono::Utc::now(),
            latency_ms: latency,
        }
    }
}

/// Health check registry
pub struct HealthCheckRegistry {
    checks: Arc<Mutex<HashMap<String, Arc<dyn HealthCheck>>>>,
}

impl std::fmt::Debug for HealthCheckRegistry {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("HealthCheckRegistry").finish_non_exhaustive()
    }
}

impl Default for HealthCheckRegistry {
    fn default() -> Self {
        Self::new()
    }
}

impl HealthCheckRegistry {
    pub fn new() -> Self {
        Self {
            checks: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn register(&self, name: impl Into<String>, check: Arc<dyn HealthCheck>) {
        let mut checks = self.checks.lock().await;
        checks.insert(name.into(), check);
    }

    pub async fn check_all(&self) -> HashMap<String, HealthCheckResult> {
        let checks = self.checks.lock().await;
        let mut results = HashMap::new();

        for (name, check) in checks.iter() {
            results.insert(name.clone(), check.check().await);
        }

        results
    }

    pub async fn is_healthy(&self) -> bool {
        let results = self.check_all().await;
        results.values().all(|r| r.status.is_healthy())
    }
}

/// Health check aware effect
pub trait HealthCheckExt<T, E, R> {
    /// Only execute if health check passes
    fn with_health_check(self, registry: Arc<HealthCheckRegistry>, check_name: impl Into<String>) -> Effect<T, E, R>;

    /// Execute with degraded mode fallback
    fn with_degraded_fallback(self, registry: Arc<HealthCheckRegistry>, degraded_effect: Effect<T, E, R>) -> Effect<T, E, R>;
}

impl<T, E, R> HealthCheckExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_health_check(self, registry: Arc<HealthCheckRegistry>, check_name: impl Into<String>) -> Effect<T, E, R> {
        let check_name = check_name.into();

        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let registry = registry.clone();
            let check_name = check_name.clone();

            Box::pin(async move {
                let checks = registry.check_all().await;
                if let Some(result) = checks.get(&check_name) {
                    if !result.status.is_healthy() {
                        return Err(EffectError::EffectFailed(format!(
                            "Health check '{}' failed: {}",
                            check_name, result.message
                        ))
                        .into());
                    }
                }
                effect.run(ctx).await
            })
        })
    }

    fn with_degraded_fallback(self, registry: Arc<HealthCheckRegistry>, degraded_effect: Effect<T, E, R>) -> Effect<T, E, R> {
        Effect::new(move |ctx: R| {
            let primary = self.clone();
            let degraded = degraded_effect.clone();
            let ctx = ctx.clone();
            let registry = registry.clone();

            Box::pin(async move {
                if registry.is_healthy().await {
                    primary.run(ctx).await
                } else {
                    degraded.run(ctx).await
                }
            })
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_health_check() {
        let registry = Arc::new(HealthCheckRegistry::new());
        let check = Arc::new(SimpleHealthCheck::new("db", || true));

        registry.register("db", check).await;

        assert!(registry.is_healthy().await);

        let results = registry.check_all().await;
        assert_eq!(results.len(), 1);
        assert!(results["db"].status.is_healthy());
    }

    #[tokio::test]
    async fn test_health_check_filter() {
        let registry = Arc::new(HealthCheckRegistry::new());
        let check = Arc::new(SimpleHealthCheck::new("db", || false));

        registry.register("db", check).await;

        let effect = Effect::<i32, EffectError, ()>::success(42)
            .with_health_check(registry.clone(), "db");

        let result = effect.run(()).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("failed"));
    }
}
