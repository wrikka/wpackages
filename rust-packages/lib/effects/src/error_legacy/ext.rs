//! Extension traits for Result types

use crate::{AppError, ErrorChain};

pub trait ResultExt<T> {
    fn context(self, context: impl Into<String>) -> Result<T, AppError>;
    fn with_chain(self, chain: &mut ErrorChain) -> Result<T, AppError>;
}

impl<T, E: Into<AppError>> ResultExt<T> for Result<T, E> {
    fn context(self, context: impl Into<String>) -> Result<T, AppError> {
        self.map_err(|e| {
            let err: AppError = e.into();
            AppError::Internal(format!("{}: {}", context.into(), err))
        })
    }

    fn with_chain(self, chain: &mut ErrorChain) -> Result<T, AppError> {
        self.map_err(|e| {
            let err: AppError = e.into();
            chain.push(err.to_string());
            err
        })
    }
}
