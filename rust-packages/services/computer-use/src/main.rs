//! Entry point for computer-use CLI
//!
//! This is the main entry point that initializes telemetry and runs the CLI.

use anyhow::Result;
use computer_use::{config::Config, telemetry, cli};

#[tokio::main]
async fn main() -> Result<()> {
    // Load configuration
    let config = Config::load().unwrap_or_default();

    // Initialize telemetry
    telemetry::init(&config);

    // Run CLI
    if let Err(e) = cli::run().await {
        eprintln!("Error: {}", e);
        std::process::exit(1);
    }

    Ok(())
}
