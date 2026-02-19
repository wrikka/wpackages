use crate::resilience::error::Result;
use crate::resilience::services::BatchProcessor;
use crate::resilience::types::{BatchItem, BatchResult};
use crate::resilience::utils::create_batch_result;
use async_trait::async_trait;
use std::time::Instant;

pub struct SimpleBatchProcessor<T> {
    _phantom: std::marker::PhantomData<T>,
}

impl<T> SimpleBatchProcessor<T> {
    pub fn new() -> Self {
        Self {
            _phantom: std::marker::PhantomData,
        }
    }
}

impl<T> Default for SimpleBatchProcessor<T> {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl<T: Send + Sync + Clone + 'static> BatchProcessor<T> for SimpleBatchProcessor<T> {
    async fn process_batch(&self, items: Vec<BatchItem<T>>) -> Result<BatchResult<T>> {
        let start_time = Instant::now();
        let processed_count = items.len();

        let result_items: Vec<T> = items.into_iter().map(|item| item.data).collect();

        Ok(create_batch_result(
            result_items,
            processed_count,
            0,
            start_time,
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_process_batch() {
        let processor = SimpleBatchProcessor::new();
        let items = vec![
            BatchItem::new("1", "data1"),
            BatchItem::new("2", "data2"),
            BatchItem::new("3", "data3"),
        ];

        let result = processor.process_batch(items).await.unwrap();
        assert_eq!(result.processed_count, 3);
        assert_eq!(result.failed_count, 0);
        assert_eq!(result.items.len(), 3);
    }
}
