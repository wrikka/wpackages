//! # Schema Validation Library
//!
//! A type-safe, high-performance schema validation library with zero-copy parsing and composable validators.
//!
//! ## Features
//!
//! - **Type-Safe Validation**: Leverages Rust's type system for compile-time safety
//! - **Composable Validators**: Combine multiple validators with `and()`, `or()`, and `not()`
//! - **Zero-Copy Parsing**: Efficient validation without unnecessary allocations
//! - **Custom Error Messages**: Detailed, context-rich error reporting with path tracking
//! - **Schema Composition**: Build complex schemas from simple primitives
//! - **Performance Optimized**: Minimal overhead, fast validation
//! - **Serde Integration**: Seamless integration with serde for serialization
//! - **Async Support**: Async validation capabilities
//!
//! ## Quick Start
//!
//! ```rust,no_run
//! extern crate r#schema as schema_lib;
//! use schema_lib::prelude::*;
//!
//! #[tokio::main]
//! async fn main() -> Result<(), SchemaError> {
//!     let schema = object_schema()
//!         .field("name", string().min_length(1).max_length(100))
//!         .field("age", integer().min(0).max(150))
//!         .field("email", string().email())
//!         .build();
//!
//!     let data = serde_json::json!({
//!         "name": "John Doe",
//!         "age": 30,
//!         "email": "john@example.com"
//!     });
//!
//!     let result = schema.validate(&data)?;
//!     println!("Validation successful: {:?}", result);
//!
//!     Ok(())
//! }
//! ```
//!
//! ## Modules
//!
//! - [`types`] - Core schema type definitions
//! - [`components`] - Pure validation logic and validators
//! - [`services`] - I/O operations and async validation
//! - [`adapters`] - External library integrations
//! - [`utils`] - Helper functions and utilities
//! - [`constants`] - Constants and configuration
//! - [`error`] - Error types and result aliases

pub mod adapters;
pub mod components;
pub mod config;
pub mod constants;
pub mod derive;
pub mod error;
pub mod services;
pub mod types;
pub mod utils;

#[cfg(feature = "telemetry")]
pub mod telemetry;

pub use components::*;
pub use derive::{SchemaDerive, Schemaable};
pub use error::{SchemaError, SchemaResult};
pub use services::*;
pub use types::*;

pub mod prelude {
    //! Prelude module for convenient imports
    //!
    //! ```rust,no_run
    //! extern crate r#schema as schema_lib;
    //! use schema_lib::prelude::*;
    //! ```

    pub use crate::components::*;
    pub use crate::error::{SchemaError, SchemaResult};
    pub use crate::services::*;
    pub use crate::types::*;
}
