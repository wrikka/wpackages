use crate::config::FilesystemConfig;

#[allow(dead_code)]
pub struct App {
    config: FilesystemConfig,
}

impl App {
    pub fn new(config: FilesystemConfig) -> Self {
        Self { config }
    }

    pub async fn run(self) -> anyhow::Result<()> {
        tracing::info!("Starting filesystem application");
        Ok(())
    }
}
