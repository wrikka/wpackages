//! Example: Basic Logging
//!
//! This example shows how to use Effect Logging to monitor effect execution.

use effect::services::logging::LogLevel;
use effect::{Effect, Runtime};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let runtime = Runtime::new();

    // Example 1: Basic logging with Info level
    println!("Example 1: Basic logging with Info level");
    let effect = Effect::success(42)
        .map(|x| x * 2)
        .with_logging(LogLevel::Info);

    let result = runtime.run(effect, ()).await?;
    println!("Result: {}", result);
    println!();

    // Example 2: Logging with Debug level
    println!("Example 2: Logging with Debug level");
    let effect = Effect::success(100)
        .map(|x| x + 10)
        .with_logging(LogLevel::Debug);

    let result = runtime.run(effect, ()).await?;
    println!("Result: {}", result);
    println!();

    // Example 3: Logging with custom config
    println!("Example 3: Logging with custom config");
    let effect = Effect::success(50).map(|x| x * 3).with_logging(
        effect::services::logging::LoggingConfig::new()
            .with_level(LogLevel::Info)
            .with_execution_time(true)
            .with_errors(true)
            .with_success(true),
    );

    let result = runtime.run(effect, ()).await?;
    println!("Result: {}", result);

    Ok(())
}
