use crate::types::{StreamMessage, StreamStatus};
use crate::services::{Consumer, Stream};
use crate::error::Result;
use std::sync::Arc;

pub struct SimpleConsumer<T> {
    stream: Arc<dyn Stream<T>>,
    status: StreamStatus,
}

impl<T> SimpleConsumer<T> {
    pub fn new(stream: Arc<dyn Stream<T>>) -> Self {
        Self {
            stream,
            status: StreamStatus::Active,
        }
    }
}

#[async_trait]
impl<T: Send + 'static> Consumer<T> for SimpleConsumer<T> {
    async fn consume(&self) -> Result<Option<StreamMessage<T>>> {
        self.stream.receive().await
    }

    async fn consume_batch(&self, size: usize) -> Result<Vec<StreamMessage<T>>> {
        let mut messages = Vec::with_capacity(size);
        
        for _ in 0..size {
            match self.stream.receive().await? {
                Some(message) => messages.push(message),
                None => break,
            }
        }
        
        Ok(messages)
    }

    async fn close(&self) -> Result<()> {
        self.stream.close().await
    }

    fn status(&self) -> StreamStatus {
        self.status
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::services::InMemoryStream;

    #[tokio::test]
    async fn test_consume() {
        let stream = Arc::new(InMemoryStream::new(10));
        let consumer = SimpleConsumer::new(stream.clone());
        
        let message = StreamMessage::new("test", "data");
        stream.send(message).await.unwrap();
        
        let received = consumer.consume().await.unwrap();
        assert_eq!(received.unwrap().id, "test");
    }

    #[tokio::test]
    async fn test_consume_batch() {
        let stream = Arc::new(InMemoryStream::new(10));
        let consumer = SimpleConsumer::new(stream.clone());
        
        for i in 0..3 {
            stream.send(StreamMessage::new(i.to_string(), "data")).await.unwrap();
        }
        
        let batch = consumer.consume_batch(5).await.unwrap();
        assert_eq!(batch.len(), 3);
    }
}
