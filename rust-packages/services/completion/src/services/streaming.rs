use crate::error::{CompletionError, CompletionResult};
use crate::types::{CompletionKind, CompletionSuggestion};
use async_trait::async_trait;
use futures::stream::Stream;
use futures::StreamExt;
use std::pin::Pin;

pub type CompletionStream =
    Pin<Box<dyn Stream<Item = CompletionResult<StreamedCompletion>> + Send>>;

#[derive(Debug, Clone)]
pub struct StreamedCompletion {
    pub delta: String,
    pub is_complete: bool,
    pub suggestions: Vec<CompletionSuggestion>,
}

impl StreamedCompletion {
    pub fn new(delta: impl Into<String>) -> Self {
        Self {
            delta: delta.into(),
            is_complete: false,
            suggestions: Vec::new(),
        }
    }

    pub fn with_complete(mut self, is_complete: bool) -> Self {
        self.is_complete = is_complete;
        self
    }

    pub fn with_suggestions(mut self, suggestions: Vec<CompletionSuggestion>) -> Self {
        self.suggestions = suggestions;
        self
    }
}

#[async_trait]
pub trait StreamingCompletionClient: Send + Sync {
    async fn stream_completion(
        &self,
        request: crate::types::CompletionRequest,
    ) -> CompletionResult<CompletionStream>;
}

pub struct MockStreamingClient {
    delay_ms: u64,
}

impl MockStreamingClient {
    pub fn new(delay_ms: u64) -> Self {
        Self { delay_ms }
    }
}

#[async_trait]
impl StreamingCompletionClient for MockStreamingClient {
    async fn stream_completion(
        &self,
        request: crate::types::CompletionRequest,
    ) -> CompletionResult<CompletionStream> {
        let prompt = request.prompt.clone();
        let delay = self.delay_ms;

        let stream = async_stream::try_stream! {
            let tokens: Vec<&str> = prompt.split_whitespace().collect();

            for (i, token) in tokens.iter().enumerate() {
                tokio::time::sleep(tokio::time::Duration::from_millis(delay)).await;

                let delta = if i == 0 {
                    token.to_string()
                } else {
                    format!(" {}", token)
                };

                let is_complete = i == tokens.len() - 1;

                let completion = StreamedCompletion::new(delta)
                    .with_complete(is_complete);

                yield completion;
            }

            let suggestions = vec![
                CompletionSuggestion::new(
                    format!("{}()", prompt),
                    CompletionKind::Function,
                )
                .with_score(0.9),
            ];

            let completion = StreamedCompletion::new("")
                .with_complete(true)
                .with_suggestions(suggestions);

            yield completion;
        };

        Ok(Box::pin(stream))
    }
}

pub struct CompletionStreamBuilder {
    chunks: Vec<String>,
}

impl CompletionStreamBuilder {
    pub fn new() -> Self {
        Self { chunks: Vec::new() }
    }

    pub fn add_chunk(mut self, chunk: impl Into<String>) -> Self {
        self.chunks.push(chunk.into());
        self
    }

    pub fn build(self) -> CompletionStream {
        let stream = async_stream::try_stream! {
            for chunk in self.chunks {
                let completion = StreamedCompletion::new(chunk);
                yield completion;
            }

            let final_completion = StreamedCompletion::new("").with_complete(true);
            yield final_completion;
        };

        Box::pin(stream)
    }
}

impl Default for CompletionStreamBuilder {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::CompletionRequest;

    #[tokio::test]
    async fn test_streamed_completion() {
        let completion = StreamedCompletion::new("hello").with_complete(false);

        assert_eq!(completion.delta, "hello");
        assert!(!completion.is_complete);
    }

    #[tokio::test]
    async fn test_mock_streaming_client() {
        let client = MockStreamingClient::new(10);
        let request = CompletionRequest::new("fn main", "rust");

        let mut stream = client.stream_completion(request).await.unwrap();

        let mut received_count = 0;
        while let Some(result) = stream.next().await {
            let completion = result.unwrap();
            assert!(!completion.delta.is_empty() || completion.is_complete);
            received_count += 1;
        }

        assert!(received_count > 0);
    }

    #[tokio::test]
    async fn test_completion_stream_builder() {
        let stream = CompletionStreamBuilder::new()
            .add_chunk("hello")
            .add_chunk(" world")
            .build();

        let mut stream = stream;
        let mut chunks = Vec::new();

        while let Some(result) = stream.next().await {
            let completion = result.unwrap();
            if !completion.delta.is_empty() {
                chunks.push(completion.delta);
            }
        }

        assert_eq!(chunks.len(), 2);
        assert_eq!(chunks[0], "hello");
        assert_eq!(chunks[1], " world");
    }
}
