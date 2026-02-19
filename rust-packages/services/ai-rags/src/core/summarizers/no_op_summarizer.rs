use super::Summarizer;
use crate::error::RagResult;
use async_trait::async_trait;

pub struct NoOpSummarizer;

#[async_trait]
impl Summarizer for NoOpSummarizer {
    async fn summarize(&self, text: &str) -> RagResult<String> {
        Ok(text.to_string())
    }
}
