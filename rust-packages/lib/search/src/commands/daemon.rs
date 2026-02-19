use crate::config::Config;
use async_trait::async_trait;
use clap::Parser;

#[derive(Debug, Parser)]
pub struct DaemonCommand {
    #[arg(long, default_value = "127.0.0.1:7878")]
    bind: String,
}

#[async_trait]
impl super::Command for DaemonCommand {
    async fn execute(&self, _config: &Config) -> anyhow::Result<()> {
        crate::server::run(&self.bind).await
    }
}
