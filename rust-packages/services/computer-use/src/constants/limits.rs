//! Limits and thresholds

/// Maximum command history size
pub const MAX_HISTORY_SIZE: usize = 1000;

/// Maximum snapshot nodes
pub const MAX_SNAPSHOT_NODES: usize = 10000;

/// Maximum element ref id
pub const MAX_ELEMENT_REF: u32 = 999999;

/// Maximum text length for type command
pub const MAX_TEXT_LENGTH: usize = 100000;

/// Maximum file path length
pub const MAX_PATH_LENGTH: usize = 4096;

/// Maximum concurrent sessions
pub const MAX_SESSIONS: usize = 100;

/// Maximum recording duration (seconds)
pub const MAX_RECORDING_DURATION: u64 = 3600;

/// Maximum wait timeout (seconds)
pub const MAX_WAIT_TIMEOUT: u64 = 300;

/// Maximum retry attempts
pub const MAX_RETRY_ATTEMPTS: usize = 10;

/// Minimum mouse move delay (ms)
pub const MIN_MOUSE_DELAY_MS: u64 = 10;

/// Maximum mouse move delay (ms)
pub const MAX_MOUSE_DELAY_MS: u64 = 1000;

/// Memory limit for snapshots (bytes)
pub const SNAPSHOT_MEMORY_LIMIT: usize = 100 * 1024 * 1024; // 100MB
