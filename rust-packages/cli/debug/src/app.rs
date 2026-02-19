use crate::config::AppConfig;

pub struct App {
    config: AppConfig,
}

impl App {
    pub fn new(config: AppConfig) -> Self {
        Self { config }
    }

    pub async fn run(self) -> anyhow::Result<()> {
        tracing::info!("Starting debugging application");
        Ok(())
    }
}
