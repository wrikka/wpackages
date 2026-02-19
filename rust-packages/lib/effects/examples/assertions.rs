//! Example: Effect Assertions
//!
//! This example shows how to use Effect Assertions for testing.

use effect::services::assertions::EffectAssertionExt;
use effect::{Effect, Runtime};

#[tokio::test]
async fn test_assert_success() {
    let effect = Effect::success(42);

    effect.assert_success(|value| {
        assert_eq!(*value, 42);
    });
}

#[tokio::test]
async fn test_assert_failure() {
    let effect: Effect<i32, effect::error::EffectError, _> =
        Effect::failure(effect::error::EffectError::new("test error"));

    effect.assert_failure(|error| {
        assert_eq!(error.message(), "test error");
    });
}

#[tokio::test]
async fn test_assert_value() {
    let effect = Effect::success(42);
    effect.assert_value(&42);
}

#[tokio::test]
#[should_panic(expected = "Effect returned unexpected value")]
async fn test_assert_value_fail() {
    let effect = Effect::success(42);
    effect.assert_value(&100);
}

#[tokio::test]
async fn test_complex_assertions() {
    let effect = Effect::success(42)
        .map(|x| x * 2)
        .flat_map(|x| Effect::success(x + 10));

    effect.assert_success(|value| {
        assert_eq!(*value, 94);
    });
}

#[tokio::test]
async fn test_assert_with_logging() {
    let effect = Effect::success(42).with_logging(effect::services::logging::LogLevel::Debug);

    effect.assert_success(|value| {
        assert_eq!(*value, 42);
    });
}
