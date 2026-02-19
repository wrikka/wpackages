use super::Effect;
use crate::services::logging::{LogLevel, Logging};
use crate::services::metrics::{self, Metrics};
use crate::services::tracing::Tracing;
use tracing::{Instrument, Level};

impl<T, E, R> Logging<T, E, R> for Effect<T, E, R>
where
    T: Send + 'static,
    E: Send + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_logging(self, level: LogLevel) -> Self {
        let effect_name = std::any::type_name::<T>();
        let span = match level {
            LogLevel::Debug => tracing::span!(tracing::Level::DEBUG, "effect.execution", name = effect_name),
            LogLevel::Info => tracing::span!(tracing::Level::INFO, "effect.execution", name = effect_name),
            LogLevel::Warn => tracing::span!(tracing::Level::WARN, "effect.execution", name = effect_name),
            LogLevel::Error => tracing::span!(tracing::Level::ERROR, "effect.execution", name = effect_name),
        };
        Effect::new(move |ctx: R| {
            let effect = self.inner.clone();
            let span = span.clone();
            Box::pin(async move { effect(ctx).instrument(span).await })
        })
    }
}

impl<T, E, R> Metrics<T, E, R> for Effect<T, E, R>
where
    T: Send + 'static,
    E: Send + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_metrics(self, name: &'static str) -> Self {
        Effect::new(move |ctx: R| {
            let effect = self.inner.clone();
            Box::pin(async move {
                let start = metrics::record_effect_start();
                let result = effect(ctx).await;
                let success = result.is_ok();
                metrics::record_effect_completion(name, start, success);
                result
            })
        })
    }
}

impl<T, E, R> Tracing<T, E, R> for Effect<T, E, R>
where
    T: Send + 'static,
    E: Send + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_tracing(self, name: &'static str) -> Self {
        let span = tracing::span!(Level::INFO, "effect.execution", name = name);
        Effect::new(move |ctx: R| {
            let effect = self.inner.clone();
            let span = span.clone();
            Box::pin(async move { effect(ctx).instrument(span).await })
        })
    }
}
