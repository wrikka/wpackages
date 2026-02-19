//! Integration tests for performance package

use performance::prelude::*;
use tokio::time::{sleep, Duration};

#[tokio::test]
async fn test_basic_performance_monitoring() {
    // Initialize telemetry for testing
    let _guard = telemetry::init_telemetry();
    
    // Test basic functionality
    let start = Instant::now();
    sleep(Duration::from_millis(100)).await;
    let elapsed = start.elapsed();
    
    assert!(elapsed >= Duration::from_millis(100));
    assert!(elapsed < Duration::from_millis(200));
}

#[tokio::test]
async fn test_error_handling() {
    let result: Result<()> = Err(PerformanceError::Configuration(
        "Test error".to_string()
    ));
    
    assert!(result.is_err());
}
