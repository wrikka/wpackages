//! Timeout constants

/// Default evaluation timeout in milliseconds
pub const DEFAULT_EVAL_TIMEOUT_MS: u64 = 30_000;

/// Default model request timeout in milliseconds
pub const DEFAULT_MODEL_TIMEOUT_MS: u64 = 60_000;

/// Default dataset loading timeout in milliseconds
pub const DEFAULT_DATASET_TIMEOUT_MS: u64 = 10_000;

/// Maximum allowed timeout in milliseconds
pub const MAX_TIMEOUT_MS: u64 = 300_000;
