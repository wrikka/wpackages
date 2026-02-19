use crate::{config::Config, output::print_results};
use async_trait::async_trait;
use clap::Parser;

#[derive(Debug, Parser)]
pub struct DependencyGraphCommand {
    #[arg(long)]
    root: Option<String>,
    #[arg(long, global = true, default_value = "json")]
    output: crate::output::OutputFormat,
}

#[async_trait]
impl super::Command for DependencyGraphCommand {
    async fn execute(&self, config: &Config) -> anyhow::Result<()> {
        let root = self.root.as_deref()
            .or_else(|| config.search.as_ref().and_then(|s| s.default_root.as_deref()))
            .unwrap_or(".");
        let graph = crate::engine::dependency_graph::build(root)?;
        print_results(&graph, &self.output)?;
        Ok(())
    }
}
