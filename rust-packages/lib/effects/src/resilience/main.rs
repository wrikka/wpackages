use resilience::{config::AppConfig, telemetry::init_telemetry};
use tracing::info;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let config = AppConfig::load().unwrap_or_else(|_| {
        eprintln!("Warning: Failed to load config, using defaults");
        AppConfig::default()
    });

    init_telemetry();

    info!("Resilience package initialized");
    info!("Config: {:?}", config);

    Ok(())
}
