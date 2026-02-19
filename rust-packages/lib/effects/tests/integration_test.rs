use effect::{Context, Effect, Runtime};

#[tokio::test]
async fn test_basic_effect() {
    let runtime = Runtime::new();
    let effect = Effect::success(42);
    let result = runtime.run(effect).await.unwrap();
    assert_eq!(result, 42);
}

#[tokio::test]
async fn test_effect_chain() {
    let runtime = Runtime::new();
    let effect = Effect::success(42)
        .map(|x| x * 2)
        .flat_map(|x| Effect::success(x + 10));
    let result = runtime.run(effect).await.unwrap();
    assert_eq!(result, 94);
}

#[tokio::test]
async fn test_error_recovery() {
    let runtime = Runtime::new();
    let effect =
        Effect::<i32, _, _>::failure(effect::EffectError::EffectFailed("test".to_string()))
            .recover(|_| 0);
    let result = runtime.run(effect).await.unwrap();
    assert_eq!(result, 0);
}

#[tokio::test]
async fn test_context_injection() {
    #[derive(Clone)]
    struct Service {
        value: i32,
    }

    let runtime = Runtime::new().add(Service { value: 42 });

    let effect = Effect::<i32, _, _>::new(|ctx| {
        Box::pin(async move {
            let service = ctx
                .get::<Service>()
                .ok_or_else(|| effect::EffectError::ContextNotProvided("Service".to_string()))?;
            Ok(service.value)
        })
    });

    let result = runtime.run(effect).await.unwrap();
    assert_eq!(result, 42);
}

#[tokio::test]
async fn test_all_combinator() {
    let runtime = Runtime::new();
    let effects = vec![Effect::success(1), Effect::success(2), Effect::success(3)];
    let effect = effect::operations::all(effects);
    let result = runtime.run(effect).await.unwrap();
    assert_eq!(result, vec![1, 2, 3]);
}

#[tokio::test]
async fn test_retry() {
    let runtime = Runtime::new();
    let mut attempts = 0;

    let effect = Effect::<i32, _, _>::new(move |_| {
        attempts += 1;
        Box::pin(async move {
            if attempts < 3 {
                Err(effect::EffectError::EffectFailed("not yet".to_string()))
            } else {
                Ok(42)
            }
        })
    })
    .retry(5);

    let result = runtime.run(effect).await.unwrap();
    assert_eq!(result, 42);
    assert_eq!(attempts, 3);
}

#[tokio::test]
async fn test_timeout() {
    let runtime = Runtime::new();
    let effect = Effect::<i32, _, _>::new(|_| {
        Box::pin(async move {
            tokio::time::sleep(std::time::Duration::from_secs(10)).await;
            Ok(42)
        })
    })
    .timeout(std::time::Duration::from_millis(100));

    let result = runtime.run(effect).await;
    assert!(result.is_err());
}

#[tokio::test]
async fn test_multiple_context_services() {
    #[derive(Clone)]
    struct Database {
        data: i32,
    }

    #[derive(Clone)]
    struct Cache {
        data: i32,
    }

    let runtime = Runtime::new()
        .add(Database { data: 42 })
        .add(Cache { data: 100 });

    let effect = Effect::<(i32, i32), _, _>::new(|ctx| {
        Box::pin(async move {
            let db = ctx
                .get::<Database>()
                .ok_or_else(|| effect::EffectError::ContextNotProvided("Database".to_string()))?;
            let cache = ctx
                .get::<Cache>()
                .ok_or_else(|| effect::EffectError::ContextNotProvided("Cache".to_string()))?;
            Ok((db.data, cache.data))
        })
    });

    let result = runtime.run(effect).await.unwrap();
    assert_eq!(result, (42, 100));
}

#[tokio::test]
async fn test_effect_clone() {
    let runtime = Runtime::new();
    let effect = Effect::success(42);
    let effect2 = effect.clone();

    let result1 = runtime.run(effect).await.unwrap();
    let result2 = runtime.run(effect2).await.unwrap();

    assert_eq!(result1, 42);
    assert_eq!(result2, 42);
}

#[tokio::test]
async fn test_unit_conversion() {
    let runtime = Runtime::new();
    let effect = Effect::success(42).unit();
    let result = runtime.run(effect).await.unwrap();
    assert_eq!(result, ());
}
