use crate::error::RagResult;
use async_trait::async_trait;

#[async_trait]
pub trait Summarizer: Send + Sync {
    async fn summarize(&self, text: &str) -> RagResult<String>;
}

pub mod bert_summarizer;
pub mod no_op_summarizer;

pub use bert_summarizer::BertSummarizer;
pub use no_op_summarizer::NoOpSummarizer;
