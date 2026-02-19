//! Error chain for tracking error origins

use std::fmt;

/// Tracks the chain of errors from origin to current
#[derive(Debug, Clone)]
pub struct ErrorChain {
    errors: Vec<String>,
}

impl ErrorChain {
    pub fn new() -> Self {
        Self { errors: Vec::new() }
    }

    pub fn push(&mut self, context: impl Into<String>) {
        self.errors.push(context.into());
    }

    pub fn errors(&self) -> &[String] {
        &self.errors
    }

    pub fn root_cause(&self) -> Option<&str> {
        self.errors.first().map(|s| s.as_str())
    }
}

impl Default for ErrorChain {
    fn default() -> Self {
        Self::new()
    }
}

impl fmt::Display for ErrorChain {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        for (i, error) in self.errors.iter().enumerate() {
            if i > 0 {
                write!(f, " -> ")?;
            }
            write!(f, "{}", error)?;
        }
        Ok(())
    }
}
