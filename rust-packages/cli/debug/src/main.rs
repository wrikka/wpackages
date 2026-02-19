mod app;
mod config;
mod telemetry;

use app::App;
use config::AppConfig;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    telemetry::init_subscriber();

    let config = AppConfig::load()?;
    let app = App::new(config);

    app.run().await
}
