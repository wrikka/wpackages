use ai_agent::{init_subscriber, AppConfig, Result};
use tracing::info;

#[tokio::main]
async fn main() -> Result<()> {
    init_subscriber();

    let config = AppConfig::load()?;
    info!("Starting {} v{}", config.app.name, config.app.version);
    info!("Environment: {}", config.app.environment);

    info!("AI Agent initialized successfully");
    Ok(())
}
