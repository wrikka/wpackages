use crate::{config::Config, output::print_results};
use async_trait::async_trait;
use clap::Parser;

#[derive(Debug, Parser)]
pub struct ExtractSignaturesCommand {
    #[arg(long)]
    path: String,
    #[arg(long, global = true, default_value = "json")]
    output: crate::output::OutputFormat,
}

#[async_trait]
impl super::Command for ExtractSignaturesCommand {
    async fn execute(&self, _config: &Config) -> anyhow::Result<()> {
        let signatures = crate::engine::signature_extractor::extract_from_file(std::path::Path::new(&self.path))?;
        print_results(&signatures, &self.output)?;
        Ok(())
    }
}
