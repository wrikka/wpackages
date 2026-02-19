use crate::config::TelemetryConfig;
use crate::error::Result;
use tracing_subscriber::prelude::*;
use tracing_subscriber::{EnvFilter, Registry};

pub fn init_telemetry(config: TelemetryConfig) -> Result<()> {
    let env_filter =
        EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new(&config.log_level));

    // Simple subscriber with just env_filter for now
    let subscriber = Registry::default().with(env_filter);

    tracing::subscriber::set_global_default(subscriber)?;

    #[cfg(feature = "sentry")]
    if let Some(sentry_config) = &config.sentry {
        init_sentry(sentry_config)?;
    }

    tracing::info!(
        service_name = %config.service_name,
        environment = %config.environment,
        "Telemetry initialized"
    );

    Ok(())
}

#[cfg(feature = "sentry")]
fn init_sentry(config: &crate::config::SentryConfig) -> Result<()> {
    let guard = sentry::init(sentry::ClientOptions {
        dsn: config.dsn.parse().ok(),
        release: sentry::release_name!(),
        environment: Some(
            std::env::var("ENVIRONMENT")
                .unwrap_or_else(|_| "development".to_string())
                .into(),
        ),
        sample_rate: config.sample_rate,
        traces_sample_rate: config.traces_sample_rate,
        ..Default::default()
    });

    let _ = guard;
    Ok(())
}
