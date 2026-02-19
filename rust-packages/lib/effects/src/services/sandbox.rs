use crate::error::EffectError;
use crate::types::effect::Effect;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::Mutex;

/// Sandbox configuration for resource limits
#[derive(Debug, Clone)]
pub struct SandboxConfig {
    pub max_execution_time: Duration,
    pub max_memory_mb: usize,
    pub max_cpu_percent: f32,
    pub enable_network: bool,
    pub enable_file_system: bool,
}

impl Default for SandboxConfig {
    fn default() -> Self {
        Self {
            max_execution_time: Duration::from_secs(30),
            max_memory_mb: 100,
            max_cpu_percent: 50.0,
            enable_network: false,
            enable_file_system: false,
        }
    }
}

/// Sandbox resource tracker
#[derive(Debug, Default)]
pub struct ResourceTracker {
    start_time: Option<std::time::Instant>,
    memory_used: Arc<Mutex<usize>>,
}

impl ResourceTracker {
    pub fn new() -> Self {
        Self {
            start_time: Some(std::time::Instant::now()),
            memory_used: Arc::new(Mutex::new(0)),
        }
    }

    pub async fn check_limits(&self, config: &SandboxConfig) -> Result<(), EffectError> {
        // Check execution time
        if let Some(start) = self.start_time {
            if start.elapsed() > config.max_execution_time {
                return Err(EffectError::EffectFailed(
                    "Sandbox timeout exceeded".to_string()
                ));
            }
        }

        // Check memory
        let memory = self.memory_used.lock().await;
        if *memory > config.max_memory_mb * 1024 * 1024 {
            return Err(EffectError::EffectFailed(
                "Sandbox memory limit exceeded".to_string()
            ));
        }

        Ok(())
    }
}

/// Sandbox extension trait
pub trait SandboxExt<T, E, R> {
    /// Run effect in sandbox with resource limits
    fn with_sandbox(self, config: SandboxConfig) -> Effect<T, E, R>;
}

impl<T, E, R> SandboxExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_sandbox(self, config: SandboxConfig) -> Effect<T, E, R> {
        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let config = config.clone();

            Box::pin(async move {
                let tracker = ResourceTracker::new();
                let start = std::time::Instant::now();

                // Set up timeout
                let timeout_future = tokio::time::sleep(config.max_execution_time);

                tokio::select! {
                    result = effect.run(ctx) => {
                        // Check resource limits
                        if let Err(e) = tracker.check_limits(&config).await {
                            return Err(e.into());
                        }
                        result
                    }
                    _ = timeout_future => {
                        Err(EffectError::EffectFailed(
                            "Sandbox timeout exceeded".to_string()
                        ).into())
                    }
                }
            })
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_sandbox_timeout() {
        let config = SandboxConfig {
            max_execution_time: Duration::from_millis(50),
            ..Default::default()
        };

        let effect = Effect::<i32, EffectError, ()>::new(|_| {
            Box::pin(async move {
                tokio::time::sleep(Duration::from_secs(10)).await;
                Ok(42)
            })
        })
        .with_sandbox(config);

        let result = effect.run(()).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("timeout"));
    }
}
