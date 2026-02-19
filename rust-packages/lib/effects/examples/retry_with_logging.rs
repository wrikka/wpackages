//! Example: Retry with Logging
//!
//! This example shows how to use Retry with Logging.

use effect::services::logging::LogLevel;
use effect::{Effect, Runtime};
use std::time::Duration;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let runtime = Runtime::new();

    // Example 1: Basic retry with logging
    println!("Example 1: Basic retry with logging");
    let mut attempts = 0;
    let effect = Effect::new(move |_| {
        attempts += 1;
        Box::pin(async move {
            if attempts < 3 {
                Err(effect::error::EffectError::new("Temporary failure"))
            } else {
                Ok("success".to_string())
            }
        })
    })
    .retry(5, Duration::from_millis(100))
    .with_logging(LogLevel::Info);

    let result = runtime.run(effect, ()).await?;
    println!("Result: {}", result);
    println!();

    // Example 2: Retry with backoff and logging
    println!("Example 2: Retry with backoff and logging");
    let mut attempts = 0;
    let effect = Effect::new(move |_| {
        attempts += 1;
        Box::pin(async move {
            if attempts < 2 {
                Err(effect::error::EffectError::new("Temporary failure"))
            } else {
                Ok(42)
            }
        })
    })
    .retry(5, Duration::from_millis(100))
    .with_logging(
        effect::services::logging::LoggingConfig::new()
            .with_level(LogLevel::Debug)
            .with_execution_time(true)
            .with_errors(true)
            .with_success(true),
    );

    let result = runtime.run(effect, ()).await?;
    println!("Result: {}", result);

    Ok(())
}
