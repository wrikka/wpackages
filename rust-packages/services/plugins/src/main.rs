use plugin_registry::{api::create_router, config::Config, services::PluginService};
use std::sync::Arc;
use tokio::net::TcpListener;
use tracing::{error, info};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = Config::from_env();

    telemetry::init_telemetry(telemetry::TelemetryConfig {
        service_name: "plugin-registry".to_string(),
        environment: std::env::var("ENVIRONMENT").unwrap_or_else(|_| "development".to_string()),
        log_level: std::env::var("LOG_LEVEL").unwrap_or_else(|_| "info".to_string()),
        log_format: if std::env::var("ENVIRONMENT").unwrap_or_default() == "production" {
            telemetry::LogFormat::Json
        } else {
            telemetry::LogFormat::Pretty
        },
        sentry: std::env::var("SENTRY_DSN").ok().map(|dsn| telemetry::SentryConfig {
            dsn,
            sample_rate: std::env::var("SENTRY_SAMPLE_RATE")
                .ok()
                .and_then(|s| s.parse().ok())
                .unwrap_or(1.0),
            traces_sample_rate: std::env::var("SENTRY_TRACES_SAMPLE_RATE")
                .ok()
                .and_then(|s| s.parse().ok())
                .unwrap_or(0.1),
        }),
    })?;

    info!("Starting plugin registry...");

    let db = plugin_registry::database::Database::new(config.database_url()).await?;
    db.migrate().await?;
    info!("Database initialized");

    let service = Arc::new(PluginService::new(db));
    let app = create_router(config.clone(), service);

    let addr = format!("{}:{}", config.server.host, config.server.port);
    let listener = TcpListener::bind(&addr).await?;
    info!("Server listening on {}", addr);

    axum::serve(listener, app).await?;

    Ok(())
}
