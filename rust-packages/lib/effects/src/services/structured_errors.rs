//! # Structured Error Types
//!
//! Structured error types with context and metadata.
//!
//! ## Features
//!
//! - **Error types** - Custom error types with thiserror
//! - **Error context** - Add context to errors
//! - **Error chains** - Chain errors together
//! - **Error metadata** - Add metadata to errors
//!
//! ## Example
//!
//! ```rust,no_run
//! use effect::{Effect, Runtime};
//! use effect::services::structured_errors::StructuredError;
//!
//! #[derive(Debug, thiserror::Error)]
//! enum MyError {
//!     #[error("Failed to connect: {0}")]
//!     ConnectionError(String),
//!     
//!     #[error("Timeout after {duration:?}")]
//!     Timeout { duration: std::time::Duration },
//! }
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     let runtime = Runtime::new();
//!
//!     let effect = Effect::fail(MyError::ConnectionError("...".to_string()));
//!
//!     let result = runtime.run(effect).await?;
//!
//!     Ok(())
//! }
//! ```

use crate::error::EffectError;
use crate::types::effect::Effect;
use std::fmt;
use std::time::Duration;

/// Structured error with metadata
pub struct StructuredError<E>
where
    E: fmt::Display + fmt::Debug,
{
    /// Original error
    pub error: E,
    /// Error context
    pub context: Vec<String>,
    /// Error metadata
    pub metadata: ErrorMetadata,
}

impl<E: fmt::Display + fmt::Debug + Clone> Clone for StructuredError<E> {
    fn clone(&self) -> Self {
        Self {
            error: self.error.clone(),
            context: self.context.clone(),
            metadata: self.metadata.clone(),
        }
    }
}

/// Error metadata
#[derive(Debug, Clone)]
pub struct ErrorMetadata {
    /// Error kind
    pub kind: ErrorKind,
    /// Error severity
    pub severity: ErrorSeverity,
    /// Timestamp
    pub timestamp: std::time::SystemTime,
    /// Additional metadata
    pub additional: std::collections::HashMap<String, String>,
}

impl Default for ErrorMetadata {
    fn default() -> Self {
        Self {
            kind: ErrorKind::Unknown,
            severity: ErrorSeverity::Medium,
            timestamp: std::time::SystemTime::now(),
            additional: std::collections::HashMap::new(),
        }
    }
}

/// Error kind
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ErrorKind {
    /// Unknown error
    Unknown,
    /// Network error
    Network,
    /// Timeout error
    Timeout,
    /// Validation error
    Validation,
    /// Authentication error
    Authentication,
    /// Authorization error
    Authorization,
    /// Not found error
    NotFound,
    /// Internal error
    Internal,
}

/// Error severity
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum ErrorSeverity {
    /// Low severity
    Low,
    /// Medium severity
    Medium,
    /// High severity
    High,
    /// Critical severity
    Critical,
}

impl<E: fmt::Display + fmt::Debug> fmt::Display for StructuredError<E> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if self.context.is_empty() {
            write!(f, "{}", self.error)
        } else {
            for context in self.context.iter().rev() {
                writeln!(f, "{}", context)?;
            }
            write!(f, "Caused by: {}", self.error)
        }
    }
}

impl<E: fmt::Display + fmt::Debug> fmt::Debug for StructuredError<E> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("StructuredError")
            .field("error", &self.error)
            .field("context", &self.context)
            .field("metadata", &self.metadata)
            .finish()
    }
}

impl<E: std::error::Error + fmt::Display + fmt::Debug> std::error::Error for StructuredError<E> {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        self.error.source()
    }
}

/// Trait for structured error support
pub trait StructuredErrorExt<T, E, R>
where
    T: Send + 'static,
    E: Send + Clone + fmt::Display + fmt::Debug + 'static,
    R: Send + Sync + 'static,
{
    /// Add context to this error
    fn with_error_context(self, context: &str) -> Effect<T, StructuredError<E>, R>;

    /// Add context with closure
    fn with_error_context_with<F>(self, f: F) -> Effect<T, StructuredError<E>, R>
    where
        F: Fn() -> String + Send + Sync + Clone + 'static;
}

impl<T, E, R> StructuredErrorExt<T, E, R> for Effect<T, E, R>
where
    T: Send + 'static,
    E: Send + Clone + fmt::Display + fmt::Debug + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_error_context(self, context: &str) -> Effect<T, StructuredError<E>, R> {
        let context = context.to_string();
        self.with_error_context_with(move || context.clone())
    }

    fn with_error_context_with<F>(self, f: F) -> Effect<T, StructuredError<E>, R>
    where
        F: Fn() -> String + Send + Sync + Clone + 'static,
    {
        let effect = self.inner.clone();
        let ctx_provider = f;

        Effect::new(move |ctx: R| {
            let effect = effect.clone();
            let ctx = ctx.clone();
            let ctx_provider = ctx_provider.clone();

            Box::pin(async move {
                match effect(ctx).await {
                    Ok(value) => Ok(value),
                    Err(error) => {
                        let context = ctx_provider();
                        let wrapper = StructuredError {
                            error,
                            context: vec![context],
                            metadata: ErrorMetadata::default(),
                        };
                        Err(wrapper)
                    }
                }
            })
        })
    }
}

#[cfg(test)]
mod tests {
    use super::StructuredErrorExt;
    use super::*;
    use crate::types::context::Context;
    use crate::types::effect::Effect;

    #[test]
    fn test_structured_error_display() {
        let wrapper = StructuredError {
            error: "test error".to_string(),
            context: vec!["context 1".to_string(), "context 2".to_string()],
            metadata: ErrorMetadata::default(),
        };

        let display = format!("{}", wrapper);
        assert!(display.contains("context 1"));
        assert!(display.contains("context 2"));
        assert!(display.contains("Caused by"));
        assert!(display.contains("test error"));
    }

    #[test]
    fn test_structured_error_ext() {
        let effect: Effect<i32, String, Context> = Effect::failure("test error".to_string());
        let effect_with_context =
            StructuredErrorExt::with_error_context(effect, "Failed to do something")
                .map_error(|e| EffectError::EffectFailed(e.to_string()));

        let runtime = crate::services::Runtime::new();
        let result = tokio::runtime::Runtime::new()
            .expect("Failed to create runtime")
            .block_on(async { runtime.run(effect_with_context).await });

        assert!(result.is_err());
    }
}
