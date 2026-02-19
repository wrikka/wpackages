use super::Summarizer;
use crate::error::{RagError, RagResult};
use async_trait::async_trait;
use rust_bert::pipelines::summarization::{SummarizationConfig, SummarizationModel};
use std::sync::Mutex;

pub struct BertSummarizer {
    model: Mutex<SummarizationModel>,
}

impl BertSummarizer {
    pub fn new() -> RagResult<Self> {
        let config = SummarizationConfig::default();
        let model = SummarizationModel::new(config).map_err(|e| RagError::Summarization(e.to_string()))?;
        Ok(Self { model: Mutex::new(model) })
    }
}

#[async_trait]
impl Summarizer for BertSummarizer {
    async fn summarize(&self, text: &str) -> RagResult<String> {
        let model = self.model.lock().unwrap();
        let summary = model.summarize(&[text]);
        Ok(summary.join("\n"))
    }
}
