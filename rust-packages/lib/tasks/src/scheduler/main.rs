use scheduler::{app::SchedulerApp, telemetry::init_subscriber};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    init_subscriber();

    let app = SchedulerApp::new()?;
    app.run().await?;

    Ok(())
}
