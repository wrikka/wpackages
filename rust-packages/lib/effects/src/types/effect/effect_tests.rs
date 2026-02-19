use super::Effect;
use crate::error::EffectError;

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_effect_success() {
        let effect = Effect::<i32, EffectError, _>::success(42);
        let result = effect.run(()).await;
        assert_eq!(result, Ok(42));
    }

    #[tokio::test]
    async fn test_effect_failure() {
        let effect = Effect::<i32, EffectError, _>::failure(EffectError::EffectFailed(
            "test error".to_string(),
        ));
        let result = effect.run(()).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_effect_map() {
        let effect = Effect::<i32, EffectError, _>::success(42).map(|x| x * 2);
        let result = effect.run(()).await;
        assert_eq!(result, Ok(84));
    }

    #[tokio::test]
    async fn test_effect_flat_map() {
        let effect =
            Effect::<i32, EffectError, _>::success(42).flat_map(|x| Effect::success(x * 2));
        let result = effect.run(()).await;
        assert_eq!(result, Ok(84));
    }

    #[tokio::test]
    async fn test_effect_recover() {
        let effect = Effect::<i32, EffectError, _>::failure(EffectError::EffectFailed(
            "test error".to_string(),
        ))
        .recover(|_| 0);
        let result = effect.run(()).await;
        assert_eq!(result, Ok(0));
    }

    #[tokio::test]
    async fn test_effect_zip() {
        let effect1 = Effect::<i32, EffectError, _>::success(1);
        let effect2 = Effect::<i32, EffectError, _>::success(2);
        let effect = effect1.zip(effect2);
        let result = effect.run(()).await;
        assert_eq!(result, Ok((1, 2)));
    }

    #[tokio::test]
    async fn test_effect_zip_failure() {
        let effect1 = Effect::<i32, EffectError, _>::success(1);
        let effect2 =
            Effect::<i32, EffectError, _>::failure(EffectError::EffectFailed("error".to_string()));
        let effect = effect1.zip(effect2);
        let result = effect.run(()).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_effect_zip3() {
        let effect =
            Effect::<i32, EffectError, _>::success(1).zip3(Effect::success(2), Effect::success(3));
        let result = effect.run(()).await;
        assert_eq!(result, Ok((1, 2, 3)));
    }

    #[tokio::test]
    async fn test_effect_zip4() {
        let effect = Effect::<i32, EffectError, _>::success(1).zip4(
            Effect::success(2),
            Effect::success(3),
            Effect::success(4),
        );
        let result = effect.run(()).await;
        assert_eq!(result, Ok((1, 2, 3, 4)));
    }

    #[tokio::test]
    async fn test_effect_sequence() {
        let effect1 = Effect::<i32, EffectError, _>::success(1);
        let effect2 = Effect::<i32, EffectError, _>::success(2);
        let effect = effect1.sequence(effect2);
        let result = effect.run(()).await;
        assert_eq!(result, Ok(2));
    }

    #[tokio::test]
    async fn test_effect_finalize_success() {
        let called = std::sync::Arc::new(std::sync::atomic::AtomicBool::new(false));
        let called_clone = called.clone();
        let effect = Effect::<i32, EffectError, _>::success(42).finalize(move || {
            called_clone.store(true, std::sync::atomic::Ordering::SeqCst);
        });
        let result = effect.run(()).await;
        assert_eq!(result, Ok(42));
        assert!(called.load(std::sync::atomic::Ordering::SeqCst));
    }

    #[tokio::test]
    async fn test_effect_finalize_failure() {
        let called = std::sync::Arc::new(std::sync::atomic::AtomicBool::new(false));
        let called_clone = called.clone();
        let effect =
            Effect::<i32, EffectError, _>::failure(EffectError::EffectFailed("error".to_string()))
                .finalize(move || {
                    called_clone.store(true, std::sync::atomic::Ordering::SeqCst);
                });
        let result = effect.run(()).await;
        assert!(result.is_err());
        assert!(called.load(std::sync::atomic::Ordering::SeqCst));
    }

    #[tokio::test]
    async fn test_effect_timeout_success() {
        let effect =
            Effect::<i32, _, _>::success(42).timeout(std::time::Duration::from_millis(100));
        let result = effect.run(()).await;
        assert_eq!(result, Ok(42));
    }

    #[tokio::test]
    async fn test_effect_timeout_failure() {
        let effect = Effect::<i32, EffectError, _>::new(|_| {
            Box::pin(async move {
                tokio::time::sleep(std::time::Duration::from_millis(200)).await;
                Ok(42)
            })
        })
        .timeout(std::time::Duration::from_millis(50));
        let result = effect.run(()).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_effect_bracket_success() {
        let acquired = std::sync::Arc::new(std::sync::atomic::AtomicBool::new(false));
        let released = std::sync::Arc::new(std::sync::atomic::AtomicBool::new(false));

        let acquired_clone = acquired.clone();
        let released_clone = released.clone();

        let effect = Effect::<i32, EffectError, _>::bracket(
            move || {
                let acquired = acquired_clone.clone();
                Box::pin(async move {
                    acquired.store(true, std::sync::atomic::Ordering::SeqCst);
                    Ok("resource".to_string())
                })
            },
            |_resource| {
                Box::pin(async move {
                    // use resource
                    Ok(42)
                })
            },
            move |_resource| {
                let released = released_clone.clone();
                Box::pin(async move {
                    released.store(true, std::sync::atomic::Ordering::SeqCst);
                    Ok(())
                })
            },
        );

        let result = effect.run(()).await;
        assert_eq!(result, Ok(42));
        assert!(acquired.load(std::sync::atomic::Ordering::SeqCst));
        assert!(released.load(std::sync::atomic::Ordering::SeqCst));
    }

    #[tokio::test]
    async fn test_effect_bracket_failure() {
        let acquired = std::sync::Arc::new(std::sync::atomic::AtomicBool::new(false));
        let released = std::sync::Arc::new(std::sync::atomic::AtomicBool::new(false));

        let acquired_clone = acquired.clone();
        let released_clone = released.clone();

        let effect = Effect::<i32, EffectError, _>::bracket(
            move || {
                let acquired = acquired_clone.clone();
                Box::pin(async move {
                    acquired.store(true, std::sync::atomic::Ordering::SeqCst);
                    Ok("resource".to_string())
                })
            },
            |_resource| {
                Box::pin(async move { Err(EffectError::EffectFailed("use error".to_string())) })
            },
            move |_resource| {
                let released = released_clone.clone();
                Box::pin(async move {
                    released.store(true, std::sync::atomic::Ordering::SeqCst);
                    Ok(())
                })
            },
        );

        let result = effect.run(()).await;
        assert!(result.is_err());
        assert!(acquired.load(std::sync::atomic::Ordering::SeqCst));
        assert!(released.load(std::sync::atomic::Ordering::SeqCst));
    }
}
