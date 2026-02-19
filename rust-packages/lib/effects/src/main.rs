use effect::config::AppConfig;
use effect::telemetry;
use effect::{App, Effect, EffectError, Runtime};
use tracing::info;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    telemetry::init_subscriber();

    let config = AppConfig::load().unwrap_or_default();

    info!("=== Effect System Demo ===");
    info!("Config: {:?}", config);

    let runtime = Runtime::new();
    let app = App::new(runtime);

    println!("1. Basic Effect:");
    let effect: Effect<i32, EffectError, effect::Context> = Effect::success(42);
    let result = app.run(effect).await?;
    println!("   Success: {}\n", result);

    println!("2. Map Operation:");
    let effect: Effect<i32, EffectError, effect::Context> = Effect::success(42).map(|x| x * 2);
    let result = app.run(effect).await?;
    println!("   Mapped: {}\n", result);

    println!("3. Flat Map (Bind):");
    let effect: Effect<i32, EffectError, effect::Context> = Effect::success(42)
        .flat_map(|x| Effect::success(x * 2))
        .flat_map(|x| Effect::success(x + 10));
    let result = app.run(effect).await?;
    println!("   Chained: {}\n", result);

    println!("4. Error Handling:");
    let effect: Effect<i32, EffectError, effect::Context> = Effect::failure(EffectError::EffectFailed("test error".to_string()))
        .recover(|_| 0);
    let result = app.run(effect).await?;
    println!("   Recovered: {}\n", result);

    println!("5. Context with Dependency Injection:");
    #[derive(Clone)]
    struct Database {
        data: i32,
    }

    let db = Database { data: 100 };
    let app_with_db = App::with_context(effect::Context::new().add(db));

    let effect = Effect::<i32, EffectError, effect::Context>::new(move |ctx: effect::Context| {
        Box::pin(async move {
            let db = ctx
                .get::<Database>()
                .ok_or_else(|| EffectError::ContextNotProvided("Database".to_string()))?;
            Ok(db.data)
        })
    })
    .map(|x| x * 2);

    let result = app_with_db.run(effect).await?;
    println!("   From Database: {}\n", result);

    println!("6. All Combinator:");
    let effects: Vec<Effect<i32, EffectError, ()>> = vec![Effect::success(1), Effect::success(2), Effect::success(3)];
    let effect = effect::all(effects);
    let result = app.run(effect).await?;
    println!("   All results: {:?}\n", result);

    println!("7. Tap for Side Effects:");
    use std::sync::atomic::{AtomicBool, Ordering};
    let called = std::sync::Arc::new(AtomicBool::new(false));
    let called_clone = called.clone();
    let effect: Effect<i32, EffectError, ()> = Effect::success(42).tap(move |x| {
        called_clone.store(true, Ordering::SeqCst);
        println!("   Tapped value: {}", x);
    });
    let result = app.run(effect).await?;
    println!("   Result: {}, Called: {}\n", result, called.load(Ordering::SeqCst));

    println!("=== Demo Complete ===");

    Ok(())
}
