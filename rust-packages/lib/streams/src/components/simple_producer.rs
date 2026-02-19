use crate::types::{StreamMessage, StreamStatus};
use crate::services::{Producer, Stream};
use crate::error::Result;
use std::sync::Arc;

pub struct SimpleProducer<T> {
    stream: Arc<dyn Stream<T>>,
    status: StreamStatus,
}

impl<T> SimpleProducer<T> {
    pub fn new(stream: Arc<dyn Stream<T>>) -> Self {
        Self {
            stream,
            status: StreamStatus::Active,
        }
    }
}

#[async_trait]
impl<T: Send + 'static> Producer<T> for SimpleProducer<T> {
    async fn produce(&self, message: StreamMessage<T>) -> Result<()> {
        self.stream.send(message).await
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
    async fn test_produce() {
        let stream = Arc::new(InMemoryStream::new(10));
        let producer = SimpleProducer::new(stream.clone());
        
        let message = StreamMessage::new("test", "data");
        producer.produce(message).await.unwrap();
        
        let received = stream.receive().await.unwrap();
        assert_eq!(received.unwrap().id, "test");
    }
}
