//! Macros for creating effects with less boilerplate
//!
//! This module provides convenient macros for creating effects
//! without the verbose `Box::pin` syntax.

/// Creates an effect from an async closure
///
/// # Examples
///
/// ```rust,no_run
/// use effect::effect;
///
/// let effect = effect!(|ctx| async move {
///     Ok(42)
/// });
/// ```
#[macro_export]
macro_rules! effect {
    (|$ctx:ident| async move $body:expr) => {
        $crate::Effect::new(move |$ctx| {
            Box::pin(async move $body)
        })
    };
    (async move $body:expr) => {
        $crate::Effect::new(move |_ctx| {
            Box::pin(async move $body)
        })
    };
}

/// Creates a sync effect (no async)
///
/// # Examples
///
/// ```rust,no_run
/// use effect::effect_sync;
///
/// let effect = effect_sync!(|ctx| {
///     Ok(42)
/// });
/// ```
#[macro_export]
macro_rules! effect_sync {
    (|$ctx:ident| $body:expr) => {
        $crate::Effect::new(move |$ctx| {
            Box::pin(async move { $body })
        })
    };
    ($body:expr) => {
        $crate::Effect::new(move |_ctx| {
            Box::pin(async move { $body })
        })
    };
}

/// Creates a success effect
///
/// # Examples
///
/// ```rust,no_run
/// use effect::effect_ok;
///
/// let effect = effect_ok!(42);
/// ```
#[macro_export]
macro_rules! effect_ok {
    ($value:expr) => {
        $crate::Effect::success($value)
    };
}

/// Creates a failure effect
///
/// # Examples
///
/// ```rust,no_run
/// use effect::{effect_err, EffectError};
///
/// let effect: Effect<i32, EffectError, ()> = effect_err!(EffectError::EffectFailed("error".to_string()));
/// ```
#[macro_export]
macro_rules! effect_err {
    ($error:expr) => {
        $crate::Effect::failure($error)
    };
}

/// Chain effects with `?` operator support
///
/// # Examples
///
/// ```rust,no_run
/// use effect::{effect, effect_chain};
///
/// let effect = effect_chain! {
///     let x = effect!(async { Ok(1) })?;
///     let y = effect!(async { Ok(2) })?;
///     Ok(x + y)
/// };
/// ```
#[macro_export]
macro_rules! effect_chain {
    ($($body:tt)*) => {
        $crate::Effect::new(move |ctx| {
            let ctx = ctx.clone();
            Box::pin(async move {
                macro_rules! run {
                    ($e:expr) => {
                        match $e.run(ctx.clone()).await {
                            Ok(v) => v,
                            Err(e) => return Err(e),
                        }
                    };
                }
                $($body)*
            })
        })
    };
}
