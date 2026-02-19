use crate::output::print_results;
use clap::Parser;

#[derive(Debug, Parser)]
pub struct SearchSymbolCommand {
    #[arg(long)]
    root: Option<String>,
    #[arg(long)]
    query: String,
    #[arg(long, default_value_t = 50)]
    limit: usize,
    #[arg(long, global = true, default_value = "json")]
    output: crate::output::OutputFormat,
}

use crate::config::Config;
use async_trait::async_trait;

#[async_trait]
impl super::Command for SearchSymbolCommand {
    async fn execute(&self, config: &Config) -> anyhow::Result<()> {
        let root = self.root.as_deref()
            .or_else(|| config.search.as_ref().and_then(|s| s.default_root.as_deref()))
            .unwrap_or(".");
        let results = crate::engine::symbol::search(root, &self.query, self.limit)?;
        print_results(&results, &self.output)?;
        Ok(())
    }
}
