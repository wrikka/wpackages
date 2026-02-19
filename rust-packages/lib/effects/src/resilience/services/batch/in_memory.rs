use crate::resilience::error::{ResilienceError as Error, Result};
use crate::resilience::services::batch::Queue;
use crate::resilience::types::BatchItem;
use async_trait::async_trait;

pub struct InMemoryQueue<T> {
    items: std::sync::Arc<tokio::sync::Mutex<Vec<BatchItem<T>>>>,
    capacity: usize,
}

impl<T> InMemoryQueue<T> {
    pub fn new(capacity: usize) -> Self {
        Self {
            items: std::sync::Arc::new(tokio::sync::Mutex::new(Vec::new())),
            capacity,
        }
    }
}

impl<T> Default for InMemoryQueue<T> {
    fn default() -> Self {
        Self::new(1000)
    }
}

#[async_trait]
impl<T: Send> Queue<T> for InMemoryQueue<T> {
    async fn push(&self, item: BatchItem<T>) -> Result<()> {
        let mut items = self.items.lock().await;
        if items.len() >= self.capacity {
            return Err(Error::QueueFull);
        }
        items.push(item);
        Ok(())
    }

    async fn pop(&self) -> Result<Option<BatchItem<T>>> {
        let mut items = self.items.lock().await;
        Ok(items.pop())
    }

    async fn size(&self) -> Result<usize> {
        let items = self.items.lock().await;
        Ok(items.len())
    }

    async fn clear(&self) -> Result<()> {
        let mut items = self.items.lock().await;
        items.clear();
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_push_pop() {
        let queue = InMemoryQueue::new(10);
        let item = BatchItem::new("test", "data");

        queue.push(item.clone()).await.unwrap();
        assert_eq!(queue.size().await.unwrap(), 1);

        let popped = queue.pop().await.unwrap();
        assert_eq!(popped.unwrap().id, "test");
        assert_eq!(queue.size().await.unwrap(), 0);
    }

    #[tokio::test]
    async fn test_queue_full() {
        let queue = InMemoryQueue::new(2);

        queue.push(BatchItem::new("1", "data")).await.unwrap();
        queue.push(BatchItem::new("2", "data")).await.unwrap();

        let result = queue.push(BatchItem::new("3", "data")).await;
        assert!(result.is_err());
    }
}
