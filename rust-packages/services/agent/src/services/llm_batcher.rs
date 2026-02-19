//! services/llm_batcher.rs

use crate::types::llm::{LlmRequest, LlmResponse};
use std::time::Duration;
use tokio::sync::{mpsc, oneshot};

const BATCH_SIZE_LIMIT: usize = 16;
const BATCH_TIMEOUT: Duration = Duration::from_millis(50);

/// A request sent to the batcher's internal channel.
pub struct BatcherRequest {
    pub request: LlmRequest,
    pub response_tx: oneshot::Sender<LlmResponse>,
}

/// Manages batching of LLM requests to improve efficiency.
#[derive(Clone)]
pub struct LlmBatcher {
    request_tx: mpsc::Sender<BatcherRequest>,
}

impl LlmBatcher {
    /// Creates a new `LlmBatcher` and spawns its background processing task.
    pub fn new() -> Self {
        let (request_tx, mut request_rx) = mpsc::channel(128);

        // Spawn the background task.
        tokio::spawn(async move {
            let mut batch = Vec::with_capacity(BATCH_SIZE_LIMIT);
            loop {
                match tokio::time::timeout(BATCH_TIMEOUT, request_rx.recv()).await {
                    // Channel closed, task should shut down.
                    Ok(None) => break,
                    // A new request has arrived.
                    Ok(Some(req)) => {
                        batch.push(req);
                        // If the batch is full, dispatch it.
                        if batch.len() >= BATCH_SIZE_LIMIT {
                            dispatch_batch(&mut batch).await;
                        }
                    }
                    // Timeout elapsed, dispatch the current batch if not empty.
                    Err(_) => {
                        if !batch.is_empty() {
                            dispatch_batch(&mut batch).await;
                        }
                    }
                }
            }
        });

        Self { request_tx }
    }

    /// Submits a request to the LLM and returns a future for the response.
    pub async fn request(&self, request: LlmRequest) -> LlmResponse {
        let (response_tx, response_rx) = oneshot::channel();
        self.request_tx
            .send(BatcherRequest { request, response_tx })
            .await
            .expect("LLM batcher task has panicked");
        response_rx.await.expect("Failed to receive LLM response")
    }
}

/// Dispatches a batch of requests to the underlying model provider.
async fn dispatch_batch(batch: &mut Vec<BatcherRequest>) {
    // In a real implementation, this would call the actual LLM provider API.
    // For now, we'll just return mocked responses.
    println!("Dispatching batch of {} requests", batch.len());

    for req in batch.drain(..) {
        let response = LlmResponse {
            id: req.request.id,
            content: format!("Mocked response for prompt: {}", req.request.prompt),
        };
        // Send the response back to the original caller.
        let _ = req.response_tx.send(response); // Ignore error if receiver was dropped.
    }
}
