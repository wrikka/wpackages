use super::Effect;
use std::future::Future;
use std::pin::Pin;

impl<T, E, R> Effect<T, E, R> {
    pub fn map<U, F>(self, f: F) -> Effect<U, E, R>
    where
        T: Send + 'static,
        U: Send + 'static,
        E: Send + 'static,
        R: Send + Sync + 'static,
        F: Fn(T) -> U + Send + Sync + Clone + 'static,
    {
        Effect::new(move |ctx| {
            let effect = self.inner.clone();
            let f = f.clone();
            Box::pin(async move {
                match effect(ctx).await {
                    Ok(value) => Ok(f(value)),
                    Err(e) => Err(e),
                }
            })
        })
    }

    pub fn flat_map<U, F>(self, f: F) -> Effect<U, E, R>
    where
        T: Send + 'static,
        U: Send + 'static,
        E: Send + 'static,
        R: Send + Sync + Clone + 'static,
        F: Fn(T) -> Effect<U, E, R> + Send + Sync + Clone + 'static,
    {
        Effect::new(move |ctx: R| {
            let effect = self.inner.clone();
            let f = f.clone();
            let ctx = ctx.clone();
            Box::pin(async move {
                match effect(ctx.clone()).await {
                    Ok(value) => f(value).run(ctx).await,
                    Err(e) => Err(e),
                }
            })
        })
    }

    pub fn map_error<F, G>(self, f: G) -> Effect<T, F, R>
    where
        T: Send + 'static,
        E: Send + 'static,
        F: Send + 'static,
        R: Send + Sync + 'static,
        G: Fn(E) -> F + Send + Sync + Clone + 'static,
    {
        Effect::new(move |ctx| {
            let effect = self.inner.clone();
            let f = f.clone();
            Box::pin(async move {
                match effect(ctx).await {
                    Ok(value) => Ok(value),
                    Err(e) => Err(f(e)),
                }
            })
        })
    }

    pub fn recover<F>(self, f: F) -> Effect<T, E, R>
    where
        T: Clone + Send + 'static,
        E: Send + 'static,
        R: Send + Sync + 'static,
        F: Fn(E) -> T + Send + Sync + Clone + 'static,
    {
        Effect::new(move |ctx| {
            let effect = self.inner.clone();
            let f = f.clone();
            Box::pin(async move {
                match effect(ctx).await {
                    Ok(value) => Ok(value),
                    Err(e) => Ok(f(e)),
                }
            })
        })
    }

    pub fn provide<S, F>(self, f: F) -> Effect<T, E, S>
    where
        T: Send + 'static,
        E: Send + 'static,
        R: Send + Sync + 'static,
        S: Send + Sync + 'static,
        F: Fn(S) -> R + Send + Sync + Clone + 'static,
    {
        Effect::new(move |ctx| {
            let effect = self.inner.clone();
            let f = f.clone();
            Box::pin(async move { effect(f(ctx)).await })
        })
    }

    pub fn finalize<F>(self, f: F) -> Effect<T, E, R>
    where
        T: Send + 'static,
        E: Send + 'static,
        R: Send + Sync + 'static,
        F: Fn() + Send + Sync + Clone + 'static,
    {
        Effect::new(move |ctx| {
            let effect = self.inner.clone();
            let f = f.clone();
            Box::pin(async move {
                let result = effect(ctx).await;
                f();
                result
            })
        })
    }

    pub fn timeout(self, duration: std::time::Duration) -> Effect<T, E, R>
    where
        T: Send + 'static,
        E: Send + From<tokio::time::error::Elapsed> + 'static,
        R: Send + Sync + 'static,
    {
        Effect::new(move |ctx| {
            let effect = self.inner.clone();
            Box::pin(async move {
                match tokio::time::timeout(duration, effect(ctx)).await {
                    Ok(result) => result,
                    Err(elapsed) => Err(elapsed.into()),
                }
            })
        })
    }
}

impl<T, E, R> Effect<T, E, R>
where
    T: Send + 'static,
    E: Send + Clone + 'static,
    R: Send + Sync + Clone + 'static,
{
    pub fn zip<U>(self, other: Effect<U, E, R>) -> Effect<(T, U), E, R>
    where
        U: Send + 'static,
    {
        Effect::new(move |ctx: R| {
            let effect1 = self.inner.clone();
            let effect2 = other.inner.clone();
            let ctx = ctx.clone();
            Box::pin(async move {
                match effect1(ctx.clone()).await {
                    Ok(v1) => match effect2(ctx).await {
                        Ok(v2) => Ok((v1, v2)),
                        Err(e) => Err(e),
                    },
                    Err(e) => Err(e),
                }
            })
        })
    }

    pub fn zip3<U, V>(
        self,
        other: Effect<U, E, R>,
        third: Effect<V, E, R>,
    ) -> Effect<(T, U, V), E, R>
    where
        U: Send + 'static,
        V: Send + 'static,
    {
        self.zip(other).zip(third).map(|((t, u), v)| (t, u, v))
    }

    pub fn zip4<U, V, W>(
        self,
        e2: Effect<U, E, R>,
        e3: Effect<V, E, R>,
        e4: Effect<W, E, R>,
    ) -> Effect<(T, U, V, W), E, R>
    where
        U: Send + 'static,
        V: Send + 'static,
        W: Send + 'static,
    {
        self.zip(e2)
            .zip(e3)
            .zip(e4)
            .map(|(((t, u), v), w)| (t, u, v, w))
    }
}

impl<T, E, R> Effect<T, E, R>
where
    T: Send + 'static,
    E: Send + Clone + 'static,
    R: Send + Sync + Clone + 'static,
{
    pub fn sequence<U>(self, other: Effect<U, E, R>) -> Effect<U, E, R>
    where
        U: Send + 'static,
        Effect<U, E, R>: Clone,
    {
        let other_clone = other.clone();
        self.flat_map(move |_| other_clone.clone())
    }
}

impl<T, E, R> Effect<T, E, R>
where
    T: Send + 'static,
    E: Send + 'static,
    R: Send + Sync + 'static,
{
    pub fn bracket<A, R1, F1, F2, F3>(acquire: F1, use_: F2, release: F3) -> Effect<T, E, R>
    where
        A: Send + Clone + 'static,
        R1: Send + 'static,
        F1: Fn() -> Pin<Box<dyn Future<Output = Result<A, E>> + Send>>
            + Send
            + Sync
            + Clone
            + 'static,
        F2: Fn(A) -> Pin<Box<dyn Future<Output = Result<T, E>> + Send>>
            + Send
            + Sync
            + Clone
            + 'static,
        F3: Fn(A) -> Pin<Box<dyn Future<Output = Result<R1, E>> + Send>>
            + Send
            + Sync
            + Clone
            + 'static,
    {
        Effect::new(move |_ctx| {
            let acquire = acquire.clone();
            let use_ = use_.clone();
            let release = release.clone();
            Box::pin(async move {
                match acquire().await {
                    Ok(resource) => {
                        let result = use_(resource.clone()).await;
                        let _ = release(resource).await;
                        result
                    }
                    Err(e) => Err(e),
                }
            })
        })
    }
}
