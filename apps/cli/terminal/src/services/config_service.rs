use crate::config::AppConfig;
use tokio::sync::Mutex;

pub struct ConfigService {
    config: Mutex<AppConfig>,
}

impl ConfigService {
    pub fn new(config: AppConfig) -> Self {
        Self {
            config: Mutex::new(config),
        }
    }

    pub async fn get_config(&self) -> AppConfig {
        self.config.lock().await.clone()
    }

    pub async fn set_config(&self, new_config: AppConfig) {
        let mut config = self.config.lock().await;
        *config = new_config;
        // Note: Logic to save to disk could be added here.
    }
}
