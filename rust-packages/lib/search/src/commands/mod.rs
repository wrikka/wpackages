pub mod search;
pub mod search_syntax;
pub mod search_symbol;
pub mod search_semantic;
pub mod search_fuzzy;
pub mod search_hybrid;
pub mod search_diff;
pub mod blame;
pub mod call_graph;
pub mod data_flow;
pub mod dependency_graph;
pub mod extract_signatures;
pub mod detect_smells;
pub mod find_similar;
pub mod daemon;
pub mod query;
pub mod index;

use crate::config::Config;
use async_trait::async_trait;

#[async_trait]
pub trait Command {
    async fn execute(&self, config: &Config) -> anyhow::Result<()>;
}
