//! examples/real_world.rs

use effect::prelude::*;
use effect::error::EffectError;
use effect::services::error_context::ErrorContextExt;
use effect::services::performance::PerformanceMonitoring;
use effect::telemetry::{TelemetryBuilder, LogFormat};
use std::time::Duration;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;

// A mock API client that fails a few times before succeeding.
#[derive(Clone)]
struct ApiClient {
    attempts: Arc<AtomicUsize>,
}

impl ApiClient {
    fn new() -> Self {
        Self {
            attempts: Arc::new(AtomicUsize::new(0)),
        }
    }

    // This function returns an Effect that simulates a network call.
    fn fetch_data(&self, user_id: &'static str) -> Effect<String, EffectError, ()> {
        let client = self.clone();
        Effect::new(move |_| {
            let client = client.clone();
            Box::pin(async move {
                let attempts = client.attempts.fetch_add(1, Ordering::SeqCst);
                println!("Attempting to fetch data for user: {}. Attempt #{}", user_id, attempts + 1);

                if attempts < 2 {
                    // Simulate a transient network error
                    Err(EffectError::Io {
                        source: std::io::Error::new(std::io::ErrorKind::TimedOut, "Network timeout"),
                        context: Default::default(),
                    })
                } else {
                    // Simulate a successful response
                    Ok(format!("Data for user {}", user_id))
                }
            })
        })
    }
}

#[tokio::main]
asyn fn main() {
    // 1. Initialize telemetry with JSON logging and a service name.
    //    This setup is great for production environments.
    TelemetryBuilder::new()
        .with_service_name("real_world_example")
        .with_log_format(LogFormat::Json)
        .build();

    // 2. Initialize metrics (requires `metrics-prometheus` feature).
    #[cfg(feature = "metrics-prometheus")]
    effect::telemetry::init_prometheus_recorder();

    let api_client = ApiClient::new();
    let user_id = "user-42";

    // 3. Define a complex effect using `pipe` for composition.
    let fetch_effect = api_client.fetch_data(user_id)
        .pipe(|effect| {
            effect
                // 4. Add structured error context for better debugging.
                .with_context("Failed during the data fetching process")
                .with_context_kv("user_id", user_id)
                // 5. Apply resilience patterns.
                .retry(3, Duration::from_millis(100)) // Retry up to 3 times with a delay.
                .circuit_breaker(2, Duration::from_secs(5)) // Open circuit after 2 failures.
                // 6. Add performance monitoring (tracing + metrics).
                .with_performance_monitoring("fetch_data_operation")
        });


    println!("--- Running Real-World Effect ---");

    // 7. Run the effect and handle the result.
    match fetch_effect.run(()).await {
        Ok(data) => {
            println!("\n✅ Effect succeeded!");
            println!("   Received data: '{}'", data);
        }
        Err(error) => {
            println!("\n❌ Effect failed!");
            println!("   Error: {}", error);
        }
    }

    println!("\n--- Finished ---");
}
