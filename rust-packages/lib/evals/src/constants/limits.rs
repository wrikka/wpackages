//! Limit constants

/// Maximum number of concurrent evaluations
pub const MAX_CONCURRENT_EVALUATIONS: usize = 100;

/// Maximum number of samples per evaluation
pub const MAX_SAMPLES_PER_EVAL: usize = 10_000;

/// Maximum number of retries for model requests
pub const MAX_RETRIES: u32 = 5;

/// Maximum evaluation name length
pub const MAX_EVAL_NAME_LENGTH: usize = 255;

/// Maximum input text length for samples
pub const MAX_INPUT_LENGTH: usize = 100_000;
