//! # AI Evals Library
//!
//! A strict, pure-functional evaluation framework for testing and benchmarking AI systems.
//!
//! ## Architecture
//!
//! This library follows strict Rust best practices with clear separation of concerns:
//!
//! - **Components/**: Pure functions and domain logic (no I/O)
//! - **Services/**: I/O operations and side effects (trait-based)
//! - **Adapters/**: Wrappers for external libraries
//! - **Utils/**: Pure helper functions
//! - **Types/**: Data structures and type definitions
//! - **Constants/**: Application constants
//!
//! ## Core Principles
//!
//! 1. **Immutability**: All variables are immutable by default
//! 2. **Purity**: Functions in `components/` have no side effects
//! 3. **Explicit Dependencies**: All dependencies injected via constructors
//! 4. **Error Handling**: Comprehensive error types with `thiserror`
//! 5. **Configuration**: External configuration with `figment`
//!
//! ## Quick Start
//!
//! ```rust
//! use ai_evals::prelude::*;
//! use ai_evals::services::{DefaultEvaluationService, MockModelService, FileDatasetService};
//! use ai_evals::components::similarity::JaccardSimilarity;
//!
//! #[tokio::main]
//! async fn main() -> EvalResult<()> {
//!     let model_service = std::sync::Arc::new(MockModelService::new("gpt-3.5-turbo".to_string()));
//!     let dataset_service = std::sync::Arc::new(FileDatasetService::new("./data".into()));
//!     let similarity_calculator = std::sync::Arc::new(JaccardSimilarity);
//!
//!     let eval_service = DefaultEvaluationService::new(
//!         model_service,
//!         dataset_service,
//!         similarity_calculator,
//!     );
//!
//!     let config = EvalConfig::new(
//!         "test_evaluation".to_string(),
//!         "gpt-3.5-turbo".to_string(),
//!         "test_dataset.json".to_string(),
//!     );
//!
//!     let result = eval_service.run_evaluation(config).await?;
//!     println!("Evaluation completed with pass rate: {:.2}%", result.pass_rate() * 100.0);
//!
//!     Ok(())
//! }
//! ```

// Core modules
pub mod constants;
pub mod error;
pub mod config;
pub mod telemetry;
pub mod prelude;

// Architecture layers
pub mod components;
pub mod services;
pub mod adapters;
pub mod utils;
pub mod types;

// Re-export commonly used types for convenience
pub use crate::error::{EvalError, EvalResult};
pub use crate::config::Config;
pub use crate::types::core::{
    EvalId, EvalStatus, EvalSample, SampleResult,
};
pub use crate::types::config::EvalConfig;
pub use crate::types::results::EvalResult as FullEvalResult;
pub use crate::components::metrics::{Metric, MetricResult};
pub use crate::services::evaluation::EvaluationService;

// Library version
pub const VERSION: &str = "0.1.0";

/// Initialize the evaluation library with default telemetry
pub fn init() -> EvalResult<()> {
    crate::telemetry::init_default_telemetry()
        .map_err(|e| EvalError::IoError(e))
}

/// Initialize the evaluation library with custom configuration
pub fn init_with_config(config: &Config) -> EvalResult<()> {
    crate::telemetry::init_telemetry(
        &config.logging.level,
        config.logging.structured,
        config.logging.file_path.as_deref(),
        config.logging.console_output,
    )
    .map_err(|e| EvalError::IoError(e))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_library_version() {
        assert!(!VERSION.is_empty());
    }

    #[test]
    fn test_init() {
        assert!(init().is_ok());
    }
}
