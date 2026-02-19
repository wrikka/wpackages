//! # Error Context
//!
//! Error context propagation for better error messages.
//!
//! ## Features
//!
//! - **Error context** - Add context to errors
//! - **Error metadata** - Add metadata to errors
//! - **Error annotations** - Annotate errors with additional info
//! - **Error wrapping** - Wrap errors with context
//!
//! ## Example
//!
//! ```rust,no_run
//! use effect::{Effect, Runtime};
//! use effect::services::error_context::ErrorContext;
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     let runtime = Runtime::new();
//!     let user_id = 123;
//!
//!     let effect = Effect::fail(MyError::ConnectionError("...".to_string()))
//!         .with_context("Failed to fetch user data")
//!         .with_context(|_| format!("User ID: {}", user_id));
//!
//!     let result = runtime.run(effect).await?;
//!
//!     Ok(())
//! }
//! ```

//! # Error Context
//!
//! Error context propagation for better error messages, including structured context.

use crate::error::{self, EffectError};
use crate::types::Effect;
use std::fmt;

/// Error context wrapper that holds an error and structured context.
#[derive(Debug, Clone)]
pub struct ErrorWithContext<E> {
    /// The original error.
    pub error: E,
    /// Structured context for the error.
    pub context: error::ErrorContext,
}

impl<E: fmt::Display> fmt::Display for ErrorWithContext<E> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.error)?;
        if !self.context.is_empty() {
            write!(f, "\n\nContext:")?;
            for (key, value) in &self.context {
                write!(f, "\n  - {}: {}", key, value)?;
            }
        }
        Ok(())
    }
}

impl<E: std::error::Error + 'static> std::error::Error for ErrorWithContext<E> {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        Some(&self.error)
    }
}

/// A trait for adding context to errors within an Effect.
pub trait ErrorContextExt<T, E, R>
where
    T: Send + 'static,
    E: Send + 'static,
    R: Send + Sync + 'static,
{
    /// Adds a simple message context to the error.
    fn with_context(self, message: &'static str) -> Effect<T, ErrorWithContext<E>, R>;

    /// Adds a key-value pair to the structured context of the error.
    fn with_context_kv(
        self,
        key: impl Into<String> + Send + Sync + Clone + 'static,
        value: impl Into<String> + Send + Sync + Clone + 'static,
    ) -> Effect<T, ErrorWithContext<E>, R>;
}

impl<T, E, R> ErrorContextExt<T, E, R> for Effect<T, E, R>
where
    T: Send + 'static,
    E: std::error::Error + Send + Sync + Clone + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_context(self, message: &'static str) -> Effect<T, ErrorWithContext<E>, R> {
        self.map_error(move |error| {
            let mut context = error::ErrorContext::new();
            context.insert("message".to_string(), message.to_string());
            ErrorWithContext { error, context }
        })
    }

    fn with_context_kv(
        self,
        key: impl Into<String> + Send + Sync + Clone + 'static,
        value: impl Into<String> + Send + Sync + Clone + 'static,
    ) -> Effect<T, ErrorWithContext<E>, R> {
        self.map_error(move |error| {
            let mut context = error::ErrorContext::new();
            context.insert(key.clone().into(), value.clone().into());
            ErrorWithContext { error, context }
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::error::EffectError;
    use crate::types::Effect;
    use std::collections::HashMap;

    #[tokio::test]
    async fn test_with_context_display() {
        let error = EffectError::EffectFailed("test error".to_string());
        let mut context = HashMap::new();
        context.insert("key1".to_string(), "value1".to_string());
        let wrapper = ErrorWithContext { error, context };

        let display = format!("{}", wrapper);
        assert!(display.contains("test error"));
        assert!(display.contains("Context:"));
        assert!(display.contains("- key1: value1"));
    }

    #[tokio::test]
    async fn test_with_context() {
        let effect: Effect<i32, _, ()> =
            Effect::failure(std::io::Error::new(std::io::ErrorKind::Other, "test error"));
        let effect_with_context = effect.with_context("Failed to do something");

        let result = effect_with_context.run(()).await;

        assert!(result.is_err());
        if let Err(e) = result {
            assert_eq!(e.context.get("message").unwrap(), "Failed to do something");
        }
    }

    #[tokio::test]
    async fn test_with_context_kv() {
        let effect: Effect<i32, _, ()> =
            Effect::failure(std::io::Error::new(std::io::ErrorKind::Other, "test error"));
        let effect_with_context = effect
            .with_context_kv("user_id", "123")
            .with_context_kv("request_id", "abc");

        let result = effect_with_context.run(()).await;

        assert!(result.is_err());
        if let Err(e) = result {
            assert_eq!(e.context.get("user_id").unwrap(), "123");
            assert_eq!(e.context.get("request_id").unwrap(), "abc");
        }
    }
}
