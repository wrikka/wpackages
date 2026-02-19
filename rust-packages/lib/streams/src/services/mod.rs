use crate::types::{StreamMessage, StreamStatus};
use crate::error::Result;

#[async_trait::async_trait]
pub trait Producer<T>: Send + Sync {
    async fn produce(&self, message: StreamMessage<T>) -> Result<()>;
    async fn close(&self) -> Result<()>;
    fn status(&self) -> StreamStatus;
}

#[async_trait::async_trait]
pub trait Consumer<T>: Send + Sync {
    async fn consume(&self) -> Result<Option<StreamMessage<T>>>;
    async fn consume_batch(&self, size: usize) -> Result<Vec<StreamMessage<T>>>;
    async fn close(&self) -> Result<()>;
    fn status(&self) -> StreamStatus;
}

#[async_trait::async_trait]
pub trait Stream<T>: Send + Sync {
    async fn send(&self, message: StreamMessage<T>) -> Result<()>;
    async fn receive(&self) -> Result<Option<StreamMessage<T>>>;
    async fn close(&self) -> Result<()>;
    fn is_closed(&self) -> bool;
}
