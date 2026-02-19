use mcp_integration::{app::McpApp, config::McpConfig, telemetry};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    telemetry::init();

    let config = McpConfig::load()?;
    let app = McpApp::new(config);

    app.run().await?;

    Ok(())
}
