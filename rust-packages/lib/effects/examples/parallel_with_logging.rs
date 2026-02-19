//! Example: Parallel Execution with Logging
//!
//! This example shows how to use Parallel Execution with Logging.

use effect::services::logging::LogLevel;
use effect::{all, Effect, Runtime};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let runtime = Runtime::new();

    // Example 1: Basic parallel execution with logging
    println!("Example 1: Basic parallel execution with logging");
    let effects = vec![
        Effect::success(1).with_logging(LogLevel::Info),
        Effect::success(2).with_logging(LogLevel::Info),
        Effect::success(3).with_logging(LogLevel::Info),
    ];

    let effect = all(effects).parallel(3);
    let results = runtime.run(effect, ()).await?;
    println!("Results: {:?}", results);
    println!();

    // Example 2: Parallel execution with custom logging
    println!("Example 2: Parallel execution with custom logging");
    let effects = vec![
        Effect::success(10).with_logging(
            effect::services::logging::LoggingConfig::new()
                .with_level(LogLevel::Debug)
                .with_execution_time(true),
        ),
        Effect::success(20).with_logging(
            effect::services::logging::LoggingConfig::new()
                .with_level(LogLevel::Debug)
                .with_execution_time(true),
        ),
        Effect::success(30).with_logging(
            effect::services::logging::LoggingConfig::new()
                .with_level(LogLevel::Debug)
                .with_execution_time(true),
        ),
    ];

    let effect = all(effects).parallel(3);
    let results = runtime.run(effect, ()).await?;
    println!("Results: {:?}", results);

    Ok(())
}
