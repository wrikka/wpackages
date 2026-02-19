use super::Effect;
use crate::error::{EffectError, EffectResult};
use crate::services::builders::{BuilderSupport, EffectBuilder};
use crate::services::logging::{LogLevel, Logging};
use crate::services::metrics::{self, Metrics};
use crate::services::tracing::Tracing;
use std::future::Future;
use std::marker::PhantomData;
use std::pin::Pin;
use std::sync::Arc;
use tracing::{Instrument, Level};

impl<T, E, R> Effect<T, E, R> {
    /// Creates a new Effect from a closure that produces a boxed future.
    ///
    /// Note: The closure must be `Fn` (not `FnMut`) to enable lock-free execution.
    /// If you need mutable state, use `Arc<Mutex<_>>` or `Arc<RwLock<_>>` inside the closure.
    pub fn new<F>(f: F) -> Self
    where
        F: Fn(R) -> Pin<Box<dyn Future<Output = Result<T, E>> + Send>> + Send + Sync + 'static,
        R: Send + 'static,
    {
        Self {
            inner: Arc::new(move |ctx| f(ctx)),
        }
    }

    /// Creates an effect from an async function without the Box::pin boilerplate
    ///
    /// # Examples
    ///
    /// ```rust,no_run
    /// use effect::Effect;
    ///
    /// let effect = Effect::from_async(|ctx| async move {
    ///     Ok(42)
    /// });
    /// ```
    pub fn from_async<F, Fut>(f: F) -> Self
    where
        F: Fn(R) -> Fut + Send + Sync + Clone + 'static,
        Fut: Future<Output = Result<T, E>> + Send + 'static,
        R: Send + Sync + Clone + 'static,
    {
        Effect::new(move |ctx| {
            let f = f.clone();
            Box::pin(async move { f(ctx).await })
        })
    }

    /// Creates an effect from a sync function
    ///
    /// # Examples
    ///
    /// ```rust,no_run
    /// use effect::Effect;
    ///
    /// let effect = Effect::from_sync(|_ctx| {
    ///     Ok(42)
    /// });
    /// ```
    pub fn from_sync<F>(f: F) -> Self
    where
        F: Fn(R) -> Result<T, E> + Send + Sync + Clone + 'static,
        R: Send + Sync + Clone + 'static,
    {
        Effect::new(move |ctx| {
            let f = f.clone();
            Box::pin(async move { f(ctx) })
        })
    }

    /// Creates an effect from a value that implements Into<Result<T, E>>
    ///
    /// # Examples
    ///
    /// ```rust,no_run
    /// use effect::Effect;
    ///
    /// let effect: Effect<i32, String, ()> = Effect::from_result(Ok(42));
    /// ```
    pub fn from_result<V>(value: V) -> Self
    where
        V: Into<Result<T, E>> + Clone + Send + Sync + 'static,
        R: Send + Sync + 'static,
    {
        Effect::new(move |_ctx| {
            let value = value.clone();
            Box::pin(async move { value.into() })
        })
    }

    pub fn success(value: T) -> Self
    where
        T: Clone + Send + Sync + 'static,
        E: From<EffectError> + Send + Sync + 'static,
        R: Send + Sync + 'static,
    {
        Self::new(move |_| {
            let value = value.clone();
            Box::pin(async move { Ok(value) })
        })
    }

    pub fn failure(error: E) -> Self
    where
        E: Clone + Send + Sync + 'static,
        R: Send + Sync + 'static,
    {
        Self::new(move |_| {
            let error = error.clone();
            Box::pin(async move { Err(error) })
        })
    }

    pub async fn run(self, context: R) -> Result<T, E> {
        (self.inner)(context).await
    }

    /// Create a builder for this effect
    pub fn builder() -> EffectBuilder<T, E, R>
    where
        T: Send + Clone + 'static,
        E: Send + Clone + 'static,
        R: Send + Sync + Clone + 'static,
    {
        EffectBuilder::<T, E, R>::new()
    }

    /// Pipes the `Effect` through a series of transformations.
    ///
    /// This allows for a flexible and readable way to compose multiple operations
    /// on an `Effect` in a functional style.
    pub fn pipe<F, Out>(self, f: F) -> Out
    where
        F: FnOnce(Self) -> Out,
    {
        f(self)
    }
}
