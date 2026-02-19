use crate::cli::app::{App, Cli};
use crate::cli::config::AppConfig;
use crate::cli::telemetry::init_subscriber;
use anyhow::Result;
use terminal::error::Result;

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();

    init_subscriber();

    let config = AppConfig::load().unwrap_or_else(|_| AppConfig::default());

    let app = App::new(config, cli);
    app.run().await?;

    Ok(())
}
