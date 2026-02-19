//! Default values

use std::time::Duration;

/// Default connection timeout
pub const DEFAULT_CONNECT_TIMEOUT: Duration = Duration::from_secs(5);

/// Default command timeout
pub const DEFAULT_COMMAND_TIMEOUT: Duration = Duration::from_secs(30);

/// Default retry attempts
pub const DEFAULT_RETRY_ATTEMPTS: usize = 3;

/// Default retry delay
pub const DEFAULT_RETRY_DELAY: Duration = Duration::from_millis(200);

/// Default log level
pub const DEFAULT_LOG_LEVEL: &str = "info";

/// Default screenshot format
pub const DEFAULT_SCREENSHOT_FORMAT: &str = "png";

/// Default screenshot quality
pub const DEFAULT_SCREENSHOT_QUALITY: u8 = 90;

/// Default memory TTL
pub const DEFAULT_MEMORY_TTL: Duration = Duration::from_secs(86400);

/// Default max memory entries
pub const DEFAULT_MAX_MEMORY_ENTRIES: usize = 10000;

/// Default max agents
pub const DEFAULT_MAX_AGENTS: usize = 10;

/// Default channel size
pub const DEFAULT_CHANNEL_SIZE: usize = 100;
