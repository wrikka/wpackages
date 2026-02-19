//! Telemetry and logging setup for computer-use
//!
//! Provides structured logging with tracing-subscriber

use tracing_subscriber::{
    fmt::{self, format::FmtSpan},
    layer::SubscriberExt,
    util::SubscriberInitExt,
    EnvFilter,
};

use crate::config::{Config, Environment};

/// Initialize telemetry based on configuration
pub fn init(config: &Config) {
    let env_filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new(&config.logging.level));

    match config.app.environment {
        Environment::Development => {
            tracing_subscriber::registry()
                .with(env_filter)
                .with(
                    fmt::layer()
                        .with_target(true)
                        .with_thread_ids(false)
                        .with_span_events(FmtSpan::CLOSE)
                        .pretty(),
                )
                .init();
        }
        Environment::Production => {
            tracing_subscriber::registry()
                .with(env_filter)
                .with(
                    fmt::layer()
                        .with_target(true)
                        .with_thread_ids(true)
                        .json(),
                )
                .init();
        }
        Environment::Test => {
            tracing_subscriber::registry()
                .with(env_filter)
                .with(fmt::layer().with_target(false).compact())
                .init();
        }
    }
}

/// Initialize minimal telemetry for CLI
pub fn init_minimal() {
    tracing_subscriber::fmt().with_env_filter(EnvFilter::from_default_env()).init();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_init_minimal() {
        init_minimal();
    }
}
