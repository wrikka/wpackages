use crate::{config::Config, output::print_results};
use async_trait::async_trait;
use clap::Parser;

#[derive(Debug, Parser)]
pub struct BlameCommand {
    #[arg(long)]
    root: Option<String>,
    #[arg(long)]
    path: String,
    #[arg(long)]
    line: usize,
    #[arg(long, global = true, default_value = "json")]
    output: crate::output::OutputFormat,
}

#[async_trait]
impl super::Command for BlameCommand {
    async fn execute(&self, config: &Config) -> anyhow::Result<()> {
        let root = self.root.as_deref()
            .or_else(|| config.search.as_ref().and_then(|s| s.default_root.as_deref()))
            .unwrap_or(".");
        let result = crate::engine::git::blame(root, &self.path, self.line)?;
        print_results(&result, &self.output)?;
        Ok(())
    }
}
