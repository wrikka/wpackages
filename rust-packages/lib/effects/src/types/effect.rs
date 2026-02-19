use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;

/// An Effect is a description of a computation that may fail and requires a context.
///
/// Similar to Effect<T, E, R> in Effect TS, where:
/// - T is the success type
/// - E is the error type
/// - R is the required context
pub struct Effect<T, E = crate::error::EffectError, R = ()> {
    pub(crate) inner:
        Arc<dyn Fn(R) -> Pin<Box<dyn Future<Output = Result<T, E>> + Send>> + Send + Sync>,
}

impl<T, E, R> std::fmt::Debug for Effect<T, E, R> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Effect").finish_non_exhaustive()
    }
}

impl<T, E, R> Clone for Effect<T, E, R> {
    fn clone(&self) -> Self {
        Self {
            inner: self.inner.clone(),
        }
    }
}

mod conversions;
mod effect_combinators;
mod effect_core;
mod effect_tests;
mod observability;
