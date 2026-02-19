use crate::{config::Config, output::print_results};
use async_trait::async_trait;
use clap::Parser;

#[derive(Debug, Parser)]
pub struct DataFlowCommand {
    #[arg(long)]
    path: String,
    #[arg(long, global = true, default_value = "json")]
    output: crate::output::OutputFormat,
}

#[async_trait]
impl super::Command for DataFlowCommand {
    async fn execute(&self, _config: &Config) -> anyhow::Result<()> {
        let graph = crate::engine::data_flow::analyze_file(std::path::Path::new(&self.path))?;
        print_results(&graph, &self.output)
    }
}
