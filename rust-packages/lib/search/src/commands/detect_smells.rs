use crate::{config::Config, output::print_results};
use async_trait::async_trait;
use clap::Parser;

#[derive(Debug, Parser)]
pub struct DetectSmellsCommand {
    #[arg(long)]
    path: String,
    #[arg(long, global = true, default_value = "json")]
    output: crate::output::OutputFormat,
}

#[async_trait]
impl super::Command for DetectSmellsCommand {
    async fn execute(&self, _config: &Config) -> anyhow::Result<()> {
        let smells = crate::engine::code_smell::detect_smells(std::path::Path::new(&self.path))?;
        print_results(&smells, &self.output)?;
        Ok(())
    }
}
