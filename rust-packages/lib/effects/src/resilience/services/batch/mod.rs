mod in_memory;

#[async_trait::async_trait]
pub trait BatchProcessor<T>: Send + Sync {
    async fn process_batch(
        &self,
        items: Vec<crate::resilience::types::BatchItem<T>>,
    ) -> crate::resilience::error::Result<crate::resilience::types::BatchResult<T>>;
}

#[async_trait::async_trait]
pub trait Queue<T>: Send + Sync {
    async fn push(&self, item: crate::resilience::types::BatchItem<T>) -> crate::resilience::error::Result<()>;
    async fn pop(&self) -> crate::resilience::error::Result<Option<crate::resilience::types::BatchItem<T>>>;
    async fn size(&self) -> crate::resilience::error::Result<usize>;
    async fn clear(&self) -> crate::resilience::error::Result<()>;
}

pub use in_memory::InMemoryQueue;
