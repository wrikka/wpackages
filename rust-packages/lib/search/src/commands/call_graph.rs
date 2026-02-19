use crate::{config::Config, output::print_results};
use async_trait::async_trait;
use clap::Parser;

#[derive(Debug, Parser)]
pub struct CallGraphCommand {
    #[arg(long)]
    root: Option<String>,
    #[arg(long)]
    function: String,
    #[arg(long, default_value = "callees")]
    direction: String, // "callers" or "callees"
    #[arg(long, global = true, default_value = "json")]
    output: crate::output::OutputFormat,
}

#[async_trait]
impl super::Command for CallGraphCommand {
    async fn execute(&self, config: &Config) -> anyhow::Result<()> {
        let root = self.root.as_deref()
            .or_else(|| config.search.as_ref().and_then(|s| s.default_root.as_deref()))
            .unwrap_or(".");
        let graph = crate::engine::call_graph::CallGraph::build(root)?;
        let results = if self.direction == "callers" {
            graph.get_callers(&self.function)
        } else {
            graph.get_callees(&self.function)
        };
        print_results(&results, &self.output)?;
        Ok(())
    }
}
