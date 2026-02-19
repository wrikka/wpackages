//! # Effect Library - Comprehensive Examples
//!
//! This file demonstrates all the new features added to the Effect Library:
//! - Bulkhead Pattern
//! - Timeout with Cancellation
//! - Fallback/Chained Fallbacks
//! - Concurrency Limits
//! - Saga Pattern
//! - Event Sourcing
//! - Effect Replay
//! - TTL Caching
//! - Idempotency
//! - Dead Letter Queue
//! - Conditional Effects
//! - Health Checks
//! - Load Shedding
//! - Debounce/Throttle
//! - Batching/Windowing
//! - Shadow/Mirror Traffic
//! - Effect Memoization
//! - Adaptive Retry
//! - Schema Validation
//! - Property-Based Testing
//! - Effect Visualization
//! - Sandboxing
//! - Hot Reload
//! - Distributed Tracing

use effect::prelude::*;
use effect::services::*;
use std::sync::Arc;
use std::time::Duration;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("=== Effect Library - Comprehensive Examples ===\n");

    // 1. Bulkhead Pattern
    println!("1. Bulkhead Pattern");
    let bulkhead_config = BulkheadConfig::new("api-pool").max_concurrent(5);
    let effect = Effect::success(42).with_bulkhead(bulkhead_config);
    println!("   Result: {:?}", effect.run(()).await?);

    // 2. Timeout with Cancellation
    println!("\n2. Timeout with Cancellation");
    let effect = Effect::<String, EffectError, ()>::new(|_| {
        Box::pin(async move {
            tokio::time::sleep(Duration::from_secs(10)).await;
            Ok("completed".to_string())
        })
    })
    .timeout(Duration::from_millis(100));
    println!("   Result (expected timeout): {:?}", effect.run(()).await);

    // 3. Fallback/Chained Fallbacks
    println!("\n3. Fallback/Chained Fallbacks");
    let primary = Effect::<i32, EffectError, ()>::failure(EffectError::EffectFailed("primary failed".to_string()));
    let fallback1 = Effect::<i32, EffectError, ()>::failure(EffectError::EffectFailed("fallback1 failed".to_string()));
    let fallback2 = Effect::success(42);

    let effect = primary.with_fallbacks(vec![fallback1, fallback2]);
    println!("   Result: {:?}", effect.run(()).await?);

    // 4. Concurrency Limits
    println!("\n4. Concurrency Limits");
    let effect = Effect::success(100).limit_concurrency_named("database", 10);
    println!("   Result: {:?}", effect.run(()).await?);

    // 5. Saga Pattern (Distributed Transactions)
    println!("\n5. Saga Pattern");
    let saga = SagaBuilder::<i32, EffectError, ()>::new()
        .step("reserve_inventory", Effect::success(10))
        .done()
        .step("process_payment", Effect::success(20))
        .done()
        .step("confirm_order", Effect::success(30))
        .done()
        .build();

    match saga.execute(()).await {
        Ok(results) => println!("   Saga completed: {:?}", results),
        Err(err) => println!("   Saga failed: {:?}", err),
    }

    // 6. TTL Caching
    println!("\n6. TTL Caching");
    let cache = Arc::new(TtlCache::<i32>::new(Duration::from_secs(60)));
    let effect = Effect::success(42).cache(cache, "my-key");
    println!("   First call: {:?}", effect.run(()).await?);
    println!("   Second call (cached): {:?}", effect.run(()).await?);

    // 7. Idempotency
    println!("\n7. Idempotency");
    let idempotency_store = Arc::new(IdempotencyStore::<i32>::new(Duration::from_secs(60)));
    let effect = Effect::success(42).with_idempotency_key(idempotency_store, "payment-123");
    println!("   First call: {:?}", effect.run(()).await?);
    println!("   Second call (idempotent): {:?}", effect.run(()).await?);

    // 8. Conditional Effects (Feature Flags)
    println!("\n8. Conditional Effects");
    let feature_store = Arc::new(FeatureFlagStore::new());
    feature_store.set("new-feature", true).await;

    let effect = Effect::success(42).when_feature(feature_store, "new-feature");
    println!("   Result: {:?}", effect.run(()).await?);

    // 9. Health Check Integration
    println!("\n9. Health Check Integration");
    let health_registry = Arc::new(HealthCheckRegistry::new());
    let check = Arc::new(SimpleHealthCheck::new("database", || true));
    health_registry.register("database", check).await;

    let effect = Effect::success(42).with_health_check(health_registry, "database");
    println!("   Result: {:?}", effect.run(()).await?);

    // 10. Load Shedding
    println!("\n10. Load Shedding");
    let shedder = Arc::new(LoadShedder::new(LoadShedConfig::default()));
    let effect = Effect::success(42).with_load_shed(shedder);
    println!("   Result: {:?}", effect.run(()).await?);

    // 11. Debounce
    println!("\n11. Debounce");
    let effect = Effect::success(42).debounce_simple("search", Duration::from_millis(100));
    println!("   Result: {:?}", effect.run(()).await?);

    // 12. Throttle
    println!("\n12. Throttle");
    let throttle_config = ThrottleConfig {
        duration: Duration::from_secs(1),
        limit: 5,
    };
    let effect = Effect::success(42).throttle("api-call", throttle_config);
    println!("   Result: {:?}", effect.run(()).await?);

    // 13. Adaptive Retry with Exponential Jitter
    println!("\n13. Adaptive Retry with Exponential Jitter");
    let attempts = Arc::new(tokio::sync::Mutex::new(0));
    let attempts_clone = attempts.clone();

    let effect = Effect::<i32, EffectError, ()>::new(move |_| {
        let attempts = attempts_clone.clone();
        Box::pin(async move {
            let mut guard = attempts.lock().await;
            *guard += 1;
            if *guard < 3 {
                Err(EffectError::EffectFailed("temporary error".to_string()))
            } else {
                Ok(42)
            }
        })
    })
    .with_exponential_jitter(5, Duration::from_millis(10));

    println!("   Result: {:?}", effect.run(()).await?);

    // 14. Event Sourcing
    println!("\n14. Event Sourcing");
    let event_store = Arc::new(InMemoryEventStore::new());
    let effect = Effect::success(42).with_event_sourcing("my-effect", event_store.clone());
    println!("   Result: {:?}", effect.run(()).await?);

    // Check events
    let events = event_store.read("my-effect").await?;
    println!("   Events recorded: {}", events.len());

    // 15. Distributed Tracing
    println!("\n15. Distributed Tracing");
    let tracer = Arc::new(Tracer::new());
    tracer.add_exporter(Arc::new(ConsoleSpanExporter)).await;

    let effect = Effect::success(42).with_distributed_tracing(tracer.clone(), "my-traced-effect");
    println!("   Result: {:?}", effect.run(()).await?);

    // 16. Effect Memoization
    println!("\n16. Effect Memoization");
    let memo_cache = Arc::new(MemoCache::<i32>::new(100).with_ttl(Duration::from_secs(60)));

    // Note: This requires HashableContext implementation
    println!("   Memoization configured (requires HashableContext)");

    // 17. Shadow/Mirror Traffic
    println!("\n17. Shadow/Mirror Traffic");
    let shadow_effect = Effect::success(100);
    let config = ShadowConfig {
        enable_shadow: true,
        sample_rate: 1.0,
        async_shadow: true,
    };
    let effect = Effect::success(42).with_shadow(shadow_effect, config);
    println!("   Result: {:?}", effect.run(()).await?);

    // 18. Dead Letter Queue
    println!("\n18. Dead Letter Queue");
    let dlq = Arc::new(DeadLetterQueue::<i32, EffectError, ()>::new(100));
    let effect = Effect::<i32, EffectError, ()>::failure(EffectError::EffectFailed("error".to_string()))
        .with_dlq(dlq.clone(), 3);
    println!("   Result (failure expected): {:?}", effect.run(()).await);
    println!("   DLQ size: {}", dlq.len().await);

    // 19. Effect Graph Visualization
    println!("\n19. Effect Graph Visualization");
    let graph = Arc::new(EffectGraph::new());
    let effect1 = Effect::success(1).with_graph_tracking(graph.clone(), "node1", "Effect 1");
    let effect2 = Effect::success(2).with_graph_tracking(graph.clone(), "node2", "Effect 2");

    effect1.run(()).await?;
    effect2.run(()).await?;

    println!("   DOT format:\n{}", graph.to_dot().await);

    // 20. Sandboxing
    println!("\n20. Sandboxing");
    let sandbox_config = SandboxConfig {
        max_execution_time: Duration::from_secs(5),
        max_memory_mb: 100,
        ..Default::default()
    };
    let effect = Effect::success(42).with_sandbox(sandbox_config);
    println!("   Result: {:?}", effect.run(()).await?);

    println!("\n=== All examples completed ===");

    Ok(())
}
