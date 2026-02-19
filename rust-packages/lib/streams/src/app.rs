use crate::config::AppConfig;
use crate::components::{SimpleProducer, SimpleConsumer};
use crate::services::{Producer, Consumer, InMemoryStream};
use crate::types::StreamMessage;
use crate::error::Result;
use std::sync::Arc;

pub struct StreamingApp<T> {
    producer: Arc<dyn Producer<T>>,
    consumer: Arc<dyn Consumer<T>>,
}

impl<T: Send + Clone + 'static> StreamingApp<T> {
    pub fn new(config: AppConfig) -> Result<Self> {
        let stream = Arc::new(InMemoryStream::new(config.stream.buffer_size));
        let producer = Arc::new(SimpleProducer::new(stream.clone()));
        let consumer = Arc::new(SimpleConsumer::new(stream));
        
        Ok(Self { producer, consumer })
    }

    pub fn producer(&self) -> Arc<dyn Producer<T>> {
        Arc::clone(&self.producer)
    }

    pub fn consumer(&self) -> Arc<dyn Consumer<T>> {
        Arc::clone(&self.consumer)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_app_creation() {
        let config = AppConfig {
            stream: crate::config::StreamConfig {
                buffer_size: 1024,
                timeout_ms: 30000,
            },
            producer: crate::config::ProducerConfig {
                max_retries: 3,
            },
            consumer: crate::config::ConsumerConfig {
                batch_size: 10,
            },
            logging: crate::config::LoggingConfig {
                level: "info".to_string(),
            },
        };

        let app = StreamingApp::<String>::new(config);
        assert!(app.is_ok());
    }
}
