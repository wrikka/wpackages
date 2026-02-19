use crate::config::Config;
use crate::query::{parse_query, QueryExecutor};
use async_trait::async_trait;
use clap::Args;

use super::Command;

#[derive(Debug, Args)]
pub struct QueryCommand {
    /// Root directory to search
    #[arg(short, long, default_value = ".")]
    pub root: String,
    
    /// Query string (e.g., "fn:main AND calls:println")
    #[arg(short, long)]
    pub query: String,
    
    /// Maximum number of results
    #[arg(short, long, default_value = "100")]
    pub limit: usize,
    
    /// Offset for pagination
    #[arg(long, default_value = "0")]
    pub offset: usize,
    
    /// Output format (json, table, compact)
    #[arg(long, default_value = "table")]
    pub format: String,
}

#[async_trait]
impl Command for QueryCommand {
    async fn execute(&self, config: &Config) -> anyhow::Result<()> {
        let query = parse_query(&self.query)?;
        let executor = QueryExecutor::new(&self.root, config.clone());
        
        let metadata = crate::query::QueryMetadata {
            limit: Some(self.limit),
            offset: Some(self.offset),
            ..Default::default()
        };
        
        let results = executor.execute_with_metadata(&query, metadata).await?;
        
        match self.format.as_str() {
            "json" => {
                let json = serde_json::to_string_pretty(&results)?;
                println!("{}", json);
            }
            "compact" => {
                for r in results {
                    println!("{}:{}:{}", r.path, r.line, r.text);
                }
            }
            _ => {
                println!("Found {} results:", results.len());
                for r in results {
                    println!("  {}:{} [{}] {}", r.path, r.line, r.kind.as_deref().unwrap_or("?"), r.text);
                }
            }
        }
        
        Ok(())
    }
}
