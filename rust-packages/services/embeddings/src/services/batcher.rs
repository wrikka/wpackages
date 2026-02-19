use crate::error::EmbeddingsResult;
use crate::services::EmbeddingsModel;
use crate::types::Embedding;
use std::sync::Arc;
use tokio::sync::{mpsc, oneshot};
use tokio::time::{self, Duration};

struct BatchRequest {
    texts: Vec<String>,
    responder: oneshot::Sender<EmbeddingsResult<Vec<Embedding>>>,
}

/// A dynamic batcher that groups requests and processes them together.
pub struct DynamicBatcher {
    request_sender: mpsc::Sender<BatchRequest>,
}

impl DynamicBatcher {
    /// Creates a new DynamicBatcher and starts its processing loop.
    pub fn new(
        model: Arc<EmbeddingsModel>,
        max_batch_size: usize,
        timeout: Duration,
    ) -> Self {
        let (request_sender, mut request_receiver) = mpsc::channel(128);

        tokio::spawn(async move {
            let mut batch = Vec::with_capacity(max_batch_size);
            let mut timeout_deadline = time::sleep(timeout);

            loop {
                tokio::select! {
                    Some(request) = request_receiver.recv() => {
                        batch.push(request);
                        if batch.len() >= max_batch_size {
                            Self::process_batch(&model, &mut batch).await;
                            timeout_deadline = time::sleep(timeout);
                        }
                    }
                    _ = &mut timeout_deadline => {
                        if !batch.is_empty() {
                            Self::process_batch(&model, &mut batch).await;
                        }
                        timeout_deadline = time::sleep(timeout);
                    }
                }
            }
        });

        Self { request_sender }
    }

    /// Sends a request to the batcher for processing.
    pub async fn process(&self, texts: Vec<String>) -> EmbeddingsResult<Vec<Embedding>> {
        let (responder, response_receiver) = oneshot::channel();
        let request = BatchRequest { texts, responder };

        self.request_sender.send(request).await.map_err(|e| {
            crate::error::EmbeddingsError::Internal(format!("Failed to send request to batcher: {}", e))
        })?;

        response_receiver.await.map_err(|e| {
            crate::error::EmbeddingsError::Internal(format!("Failed to receive response from batcher: {}", e))
        })?
    }

    /// Processes a batch of requests.
    async fn process_batch(model: &Arc<EmbeddingsModel>, batch: &mut Vec<BatchRequest>) {
        let all_texts: Vec<String> = batch.iter_mut().flat_map(|req| std::mem::take(&mut req.texts)).collect();
        let result = model.generate_text_embeddings_batch(all_texts, None).await;

        let mut current_pos = 0;
        for request in batch.drain(..) {
            let responder = request.responder;
            let num_texts = request.texts.len();
            let embeddings = match &result {
                Ok(embeddings) => Ok(embeddings[current_pos..current_pos + num_texts].to_vec()),
                Err(e) => Err(e.clone()),
            };
            let _ = responder.send(embeddings);
            current_pos += num_texts;
        }
    }
}
