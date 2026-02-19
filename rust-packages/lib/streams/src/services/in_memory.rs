use crate::services::Stream;
use crate::types::{StreamMessage, StreamStatus};
use crate::error::{StreamingError, Result};
use async_trait::async_trait;
use tokio::sync::mpsc;

pub struct InMemoryStream<T> {
    sender: mpsc::UnboundedSender<StreamMessage<T>>,
    receiver: std::sync::Arc<tokio::sync::Mutex<mpsc::UnboundedReceiver<StreamMessage<T>>>>,
    closed: std::sync::Arc<std::sync::atomic::AtomicBool>,
}

impl<T> InMemoryStream<T> {
    pub fn new(buffer_size: usize) -> Self {
        let (sender, receiver) = mpsc::unbounded_channel();
        
        Self {
            sender,
            receiver: std::sync::Arc::new(tokio::sync::Mutex::new(receiver)),
            closed: std::sync::Arc::new(std::sync::atomic::AtomicBool::new(false)),
        }
    }
}

impl<T> Default for InMemoryStream<T> {
    fn default() -> Self {
        Self::new(1024)
    }
}

#[async_trait]
impl<T: Send> Stream<T> for InMemoryStream<T> {
    async fn send(&self, message: StreamMessage<T>) -> Result<()> {
        if self.is_closed() {
            return Err(StreamingError::StreamClosed);
        }
        
        self.sender.send(message).map_err(|_| StreamingError::StreamClosed)?;
        Ok(())
    }

    async fn receive(&self) -> Result<Option<StreamMessage<T>>> {
        let mut receiver = self.receiver.lock().await;
        Ok(receiver.recv().await)
    }

    async fn close(&self) -> Result<()> {
        self.closed.store(true, std::sync::atomic::Ordering::SeqCst);
        Ok(())
    }

    fn is_closed(&self) -> bool {
        self.closed.load(std::sync::atomic::Ordering::SeqCst)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_send_receive() {
        let stream = InMemoryStream::new(10);
        let message = StreamMessage::new("test", "data");
        
        stream.send(message.clone()).await.unwrap();
        
        let received = stream.receive().await.unwrap();
        assert_eq!(received.unwrap().id, "test");
    }

    #[tokio::test]
    async fn test_close() {
        let stream = InMemoryStream::new(10);
        stream.close().await.unwrap();
        
        assert!(stream.is_closed());
    }
}
