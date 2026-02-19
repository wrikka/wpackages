//! Example: Error Context Propagation
//!
//! This example shows how to use Error Context to add context to errors.

use effect::services::error_context::ErrorContextExt;
use effect::{Effect, Runtime};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let runtime = Runtime::new();

    // Example 1: Basic error context
    println!("Example 1: Basic error context");
    let effect: Effect<i32, effect::error::EffectError, _> =
        Effect::failure(effect::error::EffectError::new("Connection failed"))
            .with_context("Failed to fetch user data");

    let result = runtime.run(effect, ()).await;
    if let Err(error) = result {
        println!("Error: {}", error);
    }
    println!();

    // Example 2: Multiple contexts
    println!("Example 2: Multiple contexts");
    let user_id = 123;
    let effect: Effect<i32, effect::error::EffectError, _> =
        Effect::failure(effect::error::EffectError::new("Connection failed"))
            .with_context("Failed to fetch user data")
            .with_context_with(|| format!("User ID: {}", user_id));

    let result = runtime.run(effect, ()).await;
    if let Err(error) = result {
        println!("Error: {}", error);
    }
    println!();

    // Example 3: Context with success
    println!("Example 3: Context with success");
    let effect = Effect::success(42)
        .map(|x| x * 2)
        .with_context("Processing data");

    let result = runtime.run(effect, ()).await?;
    println!("Result: {}", result);

    Ok(())
}
