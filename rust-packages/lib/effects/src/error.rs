use std::collections::HashMap;
use std::sync::Arc;
use thiserror::Error;

/// A type alias for a key-value map used for structured error context.
pub type ErrorContext = HashMap<String, String>;

/// Represents the source of an error, which can be another error.
pub type ErrorSource = Box<dyn std::error::Error + Send + Sync + 'static>;

/// Effect system errors.
#[derive(Error, Debug, Clone)]
pub enum EffectError {
    #[error("Context not provided: {0}")]
    ContextNotProvided(String),

    #[error("Effect failed: {0}")]
    EffectFailed(String),

    #[error("Operation timed out")]
    Timeout(Arc<tokio::time::error::Elapsed>),

    #[error("IO error")]
    Io {
        #[source]
        source: Arc<std::io::Error>,
        context: ErrorContext,
    },

    #[error("Join error")]
    Join {
        #[source]
        source: Arc<tokio::task::JoinError>,
        context: ErrorContext,
    },

    #[error(transparent)]
    Other(#[from] Arc<anyhow::Error>),
}

impl PartialEq for EffectError {
    fn eq(&self, other: &Self) -> bool {
        match (self, other) {
            (Self::ContextNotProvided(l0), Self::ContextNotProvided(r0)) => l0 == r0,
            (Self::EffectFailed(l0), Self::EffectFailed(r0)) => l0 == r0,
            (Self::Timeout(_), Self::Timeout(_)) => true, // Cannot compare Elapsed
            (
                Self::Io {
                    source: l_source,
                    context: l_context,
                },
                Self::Io {
                    source: r_source,
                    context: r_context,
                },
            ) => l_source.kind() == r_source.kind() && l_context == r_context,
            (
                Self::Join {
                    source: _,
                    context: l_context,
                },
                Self::Join {
                    source: _,
                    context: r_context,
                },
            ) => {
                l_context == r_context // Cannot compare JoinError
            }
            (Self::Other(l0), Self::Other(r0)) => l0.to_string() == r0.to_string(),
            _ => false,
        }
    }
}

impl From<tokio::task::JoinError> for EffectError {
    fn from(error: tokio::task::JoinError) -> Self {
        EffectError::Join {
            source: Arc::new(error),
            context: ErrorContext::new(),
        }
    }
}

impl From<anyhow::Error> for EffectError {
    fn from(error: anyhow::Error) -> Self {
        EffectError::Other(Arc::new(error))
    }
}

impl From<tokio::time::error::Elapsed> for EffectError {
    fn from(error: tokio::time::error::Elapsed) -> Self {
        EffectError::Timeout(Arc::new(error))
    }
}

pub type EffectResult<T> = Result<T, EffectError>;
