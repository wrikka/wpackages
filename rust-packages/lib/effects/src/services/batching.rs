use crate::error::EffectError;
use crate::types::effect::Effect;
use std::collections::{HashMap, VecDeque};
use std::sync::Arc;
use tokio::sync::{Mutex, mpsc};
use std::time::{Duration, Instant};

/// Batch configuration
#[derive(Debug, Clone)]
pub struct BatchConfig {
    pub max_size: usize,
    pub max_delay: Duration,
}

impl Default for BatchConfig {
    fn default() -> Self {
        Self {
            max_size: 10,
            max_delay: Duration::from_millis(100),
        }
    }
}

/// Batch processor
pub struct BatchProcessor<T, R> {
    config: BatchConfig,
    buffer: Arc<Mutex<VecDeque<(T, Instant)>>>,
    processor: Arc<dyn Fn(Vec<T>) -> Effect<Vec<R>, EffectError, ()> + Send + Sync>,
}

impl<T, R> std::fmt::Debug for BatchProcessor<T, R> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("BatchProcessor")
            .field("config", &self.config)
            .field("buffer_len", &self.buffer.try_lock().map(|b| b.len()))
            .finish_non_exhaustive()
    }
}

impl<T, R> BatchProcessor<T, R>
where
    T: Send + Clone + 'static,
    R: Send + Clone + 'static,
{
    pub fn new<F>(config: BatchConfig, processor: F) -> Self
    where
        F: Fn(Vec<T>) -> Effect<Vec<R>, EffectError, ()> + Send + Sync + 'static,
    {
        Self {
            config,
            buffer: Arc::new(Mutex::new(VecDeque::new())),
            processor: Arc::new(processor),
        }
    }

    pub async fn submit(&self, item: T) -> Result<R, EffectError> {
        let mut buffer = self.buffer.lock().await;
        let index = buffer.len();
        buffer.push_back((item, Instant::now()));

        // Check if batch is full
        if buffer.len() >= self.config.max_size {
            drop(buffer);
            return self.flush().await.map(|r| r.into_iter().nth(index).unwrap());
        }

        // Start timer for flush
        let buffer_clone = self.buffer.clone();
        let processor = self.processor.clone();
        let delay = self.config.max_delay;

        tokio::spawn(async move {
            tokio::time::sleep(delay).await;
            let mut buf = buffer_clone.lock().await;
            if !buf.is_empty() {
                let items: Vec<T> = buf.drain(..).map(|(t, _)| t).collect();
                drop(buf);
                let _ = processor(items).run(()).await;
            }
        });

        // Wait for result (simplified - real implementation would use channels)
        Err(EffectError::EffectFailed("Batch pending".to_string()))
    }

    pub async fn flush(&self) -> Result<Vec<R>, EffectError> {
        let mut buffer = self.buffer.lock().await;
        let items: Vec<T> = buffer.drain(..).map(|(t, _)| t).collect();
        drop(buffer);

        if items.is_empty() {
            return Ok(Vec::new());
        }

        let processor = self.processor.clone();
        processor(items).run(()).await
    }
}

/// Window configuration for time-based windowing
#[derive(Debug, Clone)]
pub struct WindowConfig {
    pub window_size: Duration,
    pub slide_interval: Option<Duration>, // None for tumbling window
}

impl WindowConfig {
    pub fn tumbling(duration: Duration) -> Self {
        Self {
            window_size: duration,
            slide_interval: None,
        }
    }

    pub fn sliding(window_size: Duration, slide_interval: Duration) -> Self {
        Self {
            window_size,
            slide_interval: Some(slide_interval),
        }
    }
}

/// Windowed stream processor
pub struct WindowedProcessor<T, R> {
    config: WindowConfig,
    windows: Arc<Mutex<Vec<(Instant, Vec<T>)>>>,
    processor: Arc<dyn Fn(Vec<T>) -> Effect<R, EffectError, ()> + Send + Sync>,
}

impl<T, R> std::fmt::Debug for WindowedProcessor<T, R> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("WindowedProcessor")
            .field("config", &self.config)
            .finish_non_exhaustive()
    }
}

impl<T, R> WindowedProcessor<T, R>
where
    T: Send + Clone + 'static,
    R: Send + Clone + 'static,
{
    pub fn new<F>(config: WindowConfig, processor: F) -> Self
    where
        F: Fn(Vec<T>) -> Effect<R, EffectError, ()> + Send + Sync + 'static,
    {
        Self {
            config,
            windows: Arc::new(Mutex::new(Vec::new())),
            processor: Arc::new(processor),
        }
    }

    pub async fn add(&self, item: T) {
        let now = Instant::now();
        let mut windows = self.windows.lock().await;

        // Find or create window
        let window_size = self.config.window_size;
        if let Some((start, items)) = windows.last_mut() {
            if now.duration_since(*start) < window_size {
                items.push(item);
                return;
            }
        }

        windows.push((now, vec![item]));
    }

    pub async fn process_windows(&self) -> Vec<Result<R, EffectError>> {
        let now = Instant::now();
        let mut windows = self.windows.lock().await;
        let processor = self.processor.clone();

        let mut results = Vec::new();
        let window_size = self.config.window_size;

        for (start, items) in windows.drain(..) {
            if now.duration_since(start) >= window_size {
                let result = processor(items).run(()).await;
                results.push(result);
            }
        }

        results
    }
}

/// Batch effect extension
pub trait BatchExt<T, E, R> {
    /// Batch this effect with others
    fn batch(self, processor: Arc<BatchProcessor<T, T>>) -> Effect<T, E, R>;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_batch_processor() {
        let processor = BatchProcessor::new(
            BatchConfig { max_size: 2, max_delay: Duration::from_secs(1) },
            |items: Vec<i32>| Effect::success(items),
        );

        processor.submit(1).await.ok();
        processor.submit(2).await.ok();

        // Should have flushed
        let result = processor.flush().await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_windowed_processor() {
        let config = WindowConfig::tumbling(Duration::from_millis(50));
        let processor = WindowedProcessor::new(config, |items: Vec<i32>| {
            Effect::success(items.iter().sum::<i32>())
        });

        processor.add(1).await;
        processor.add(2).await;
        processor.add(3).await;

        tokio::time::sleep(Duration::from_millis(60)).await;

        let results = processor.process_windows().await;
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].as_ref().unwrap(), &6);
    }
}
