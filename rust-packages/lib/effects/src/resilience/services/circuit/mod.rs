mod retry_policy;

#[async_trait::async_trait]
pub trait CircuitBreaker: Send + Sync {
    async fn call<F, T, E>(&self, f: F) -> std::result::Result<T, crate::resilience::error::ResilienceError>
    where
        F: FnOnce() -> std::pin::Pin<
                Box<dyn std::future::Future<Output = std::result::Result<T, E>> + Send + Sync>,
            > + Send
            + Sync,
        T: Send,
        E: std::error::Error + Send + Sync + 'static,
        Self: 'static;
}

pub trait RetryPolicy: Send + Sync {
    fn should_retry(&self, attempt: u32) -> bool;
    fn backoff_ms(&self, attempt: u32) -> u64;
}

pub use retry_policy::ExponentialBackoffRetry;
