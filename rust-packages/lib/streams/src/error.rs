use thiserror::Error;

#[derive(Error, Debug)]
pub enum StreamingError {
    #[error("Configuration error: {0}")]
    Config(#[from] figment::Error),

    #[error("Stream closed")]
    StreamClosed,

    #[error("Buffer overflow: {size} (max: {max})")]
    BufferOverflow { size: usize, max: usize },

    #[error("Producer error: {0}")]
    ProducerError(String),

    #[error("Consumer error: {0}")]
    ConsumerError(String),

    #[error("Timeout exceeded")]
    Timeout,

    #[error("Invalid configuration: {0}")]
    InvalidConfig(String),

    #[error(transparent)]
    Io(#[from] std::io::Error),
}

pub type Result<T> = std::result::Result<T, StreamingError>;
