//! Embeddings Generation Service
//!
//! Provides text-to-embeddings conversion using ML models.

// Public modules
pub mod config;
pub mod error;
pub mod services;
pub mod types;
pub mod utils;

// Internal modules for binary, WASM, Python, etc.
#[doc(hidden)]
pub mod adapters;
#[doc(hidden)]
pub mod api;
#[doc(hidden)]
pub mod app;
#[doc(hidden)]
pub mod components;
#[doc(hidden)]
pub mod constants;
#[doc(hidden)]
pub mod finetune;
#[doc(hidden)]
pub mod grpc;
#[doc(hidden)]
pub mod middleware;
#[doc(hidden)]
pub mod models;
#[doc(hidden)]
pub mod python;
#[doc(hidden)]
pub mod telemetry;
#[doc(hidden)]
pub mod ui;
#[doc(hidden)]
pub mod wasm;

// Re-export key components for the public API
pub use app::EmbeddingsApp;
pub use config::EmbeddingsConfig;
pub use error::{EmbeddingsError, EmbeddingsResult};
pub use services::EmbeddingsService;
pub use telemetry::init_subscriber;
pub use types::{Embedding, EmbeddingRequest, EmbeddingResponse, SearchResult};

// Export the Python module
#[cfg(feature = "python")]
#[pyo3::pymodule]
fn embeddings(_py: pyo3::Python, m: &pyo3::types::PyModule) -> pyo3::PyResult<()> {
    m.add_class::<python::bindings::Embeddings>()?;
    Ok(())
}
