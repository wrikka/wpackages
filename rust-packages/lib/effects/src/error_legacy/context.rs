//! Error context for adding contextual information

use std::fmt;

/// Context information for errors
#[derive(Debug, Clone)]
pub struct ErrorContext {
    pub operation: String,
    pub details: Option<String>,
    pub source_location: Option<String>,
}

impl ErrorContext {
    pub fn new(operation: impl Into<String>) -> Self {
        Self {
            operation: operation.into(),
            details: None,
            source_location: None,
        }
    }

    pub fn with_details(mut self, details: impl Into<String>) -> Self {
        self.details = Some(details.into());
        self
    }

    pub fn with_location(mut self, file: &str, line: u32) -> Self {
        self.source_location = Some(format!("{}:{}", file, line));
        self
    }
}

impl fmt::Display for ErrorContext {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "operation={}", self.operation)?;
        if let Some(ref details) = self.details {
            write!(f, ", details={}", details)?;
        }
        if let Some(ref loc) = self.source_location {
            write!(f, ", location={}", loc)?;
        }
        Ok(())
    }
}

/// Macro for creating error context with location
#[macro_export]
macro_rules! error_context {
    ($operation:expr) => {
        $crate::ErrorContext::new($operation)
            .with_location(file!(), line!())
    };
    ($operation:expr, $details:expr) => {
        $crate::ErrorContext::new($operation)
            .with_details($details)
            .with_location(file!(), line!())
    };
}
