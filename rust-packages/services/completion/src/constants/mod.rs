//! Constants for completion service

/// Default configuration values
pub const DEFAULT_MAX_TOKENS: usize = 1024;
pub const DEFAULT_TEMPERATURE: f32 = 0.7;
pub const DEFAULT_TOP_P: f32 = 1.0;
pub const DEFAULT_FREQUENCY_PENALTY: f32 = 0.0;
pub const DEFAULT_PRESENCE_PENALTY: f32 = 0.0;

/// Cache configuration
pub const DEFAULT_CACHE_TTL_SECONDS: u64 = 3600; // 1 hour
pub const DEFAULT_CACHE_MAX_SIZE: u64 = 1000;

/// Rate limiting
pub const DEFAULT_RATE_LIMIT_REQUESTS_PER_MINUTE: u32 = 60;
pub const DEFAULT_RATE_LIMIT_BURST: u32 = 10;

/// Context window
pub const DEFAULT_CONTEXT_WINDOW_SIZE: usize = 4096;
pub const DEFAULT_MAX_CONTEXT_LENGTH: usize = 8192;

/// Streaming
pub const DEFAULT_STREAM_CHUNK_SIZE: usize = 512;

/// Model provider timeouts
pub const DEFAULT_REQUEST_TIMEOUT_SECONDS: u64 = 30;
pub const DEFAULT_CONNECT_TIMEOUT_SECONDS: u64 = 10;
