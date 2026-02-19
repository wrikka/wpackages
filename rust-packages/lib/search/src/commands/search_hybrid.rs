use crate::{config::Config, output::print_results};
use async_trait::async_trait;
use clap::Parser;

#[derive(Debug, Parser)]
pub struct SearchHybridCommand {
    #[arg(long)]
    root: Option<String>,
    #[arg(long)]
    pattern: String,
    #[arg(long, default_value_t = 50)]
    limit: usize,
    #[arg(long, global = true, default_value = "json")]
    output: crate::output::OutputFormat,
}

#[async_trait]
impl super::Command for SearchHybridCommand {
    async fn execute(&self, config: &Config) -> anyhow::Result<()> {
        let root = self.root.as_deref()
            .or_else(|| config.search.as_ref().and_then(|s| s.default_root.as_deref()))
            .unwrap_or(".");
        let results =
            crate::engine::hybrid::search(root, &self.pattern, self.limit, config).await?;
        print_results(&results, &self.output)?;
        Ok(())
    }
}
