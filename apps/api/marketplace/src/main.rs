//! Marketplace API - Composition Root
//!
//! Entry point ของ application ที่รวบรวม dependencies ทั้งหมด

use marketplace_api::{create_app, telemetry, Config};
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tracing::info;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize telemetry (logging/tracing)
    telemetry::init_subscriber();

    // Load configuration
    let config = Config::load()?;
    info!("Configuration loaded: {:?}", config);

    // Create application
    let app = create_app(config.clone()).await?;
    info!("Application created");

    // Start server
    let addr = SocketAddr::from(([0, 0, 0, 0], config.server.port));
    let listener = TcpListener::bind(addr).await?;
    info!("Server listening on {}", addr);

    axum::serve(listener, app).await?;

    Ok(())
}
