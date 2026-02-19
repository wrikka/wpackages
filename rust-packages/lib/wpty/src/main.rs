use wpty::telemetry;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    telemetry::init_telemetry();
    
    tracing::info!("wpty starting up");
    
    Ok(())
}
