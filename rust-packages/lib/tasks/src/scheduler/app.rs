use crate::{config::AppConfig, error::SchedulerError, services::SchedulerService, Result};
use tracing::{error, info};

pub struct SchedulerApp {
    config: AppConfig,
    scheduler: SchedulerService,
}

impl SchedulerApp {
    pub fn new() -> Result<Self> {
        let config = AppConfig::load().unwrap_or_else(|_| {
            eprintln!("Warning: Failed to load config, using defaults");
            AppConfig::default()
        });

        let scheduler = SchedulerService::new(config.scheduler.clone())?;

        Ok(Self { config, scheduler })
    }

    pub async fn run(&self) -> Result<()> {
        info!("Scheduler application started");
        info!("Config: {:?}", self.config);

        Ok(())
    }
}

impl Default for SchedulerApp {
    fn default() -> Self {
        Self::new().expect("Failed to create SchedulerApp")
    }
}
