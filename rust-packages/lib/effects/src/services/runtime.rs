use crate::error::{EffectError, EffectResult};
use crate::types::context::Context;
use crate::types::effect::Effect;

/// Runtime for executing effects
pub struct Runtime {
    context: Context,
}

impl Runtime {
    /// Create a new runtime with an empty context
    pub fn new() -> Self {
        Self {
            context: Context::new(),
        }
    }

    /// Create a new runtime with a custom context
    pub fn with_context(context: Context) -> Self {
        Self { context }
    }

    /// Add a service to the runtime context
    pub fn add<T: std::any::Any + Send + Sync>(mut self, service: T) -> Self {
        self.context = self.context.add(service);
        self
    }

    /// Run an effect
    pub async fn run<T, E>(&self, effect: Effect<T, E, Context>) -> EffectResult<T>
    where
        T: Send + 'static,
        E: Into<EffectError> + Send + 'static,
        Context: Clone + Send + Sync + 'static,
    {
        effect.run(self.context.clone()).await.map_err(|e| e.into())
    }

    /// Get the context
    pub fn context(&self) -> &Context {
        &self.context
    }

    /// Get a mutable context
    pub fn context_mut(&mut self) -> &mut Context {
        &mut self.context
    }
}

impl Default for Runtime {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_runtime_run() {
        let runtime = Runtime::new();
        let effect = Effect::<i32, EffectError, _>::success(42);
        let result = runtime.run(effect).await;
        assert_eq!(result, Ok(42));
    }

    #[tokio::test]
    async fn test_runtime_with_service() {
        #[derive(Clone)]
        struct Database {
            data: i32,
        }

        let db = Database { data: 42 };
        let runtime = Runtime::new().add(db);

        let effect = Effect::<i32, EffectError, _>::new(move |ctx: Context| {
            Box::pin(async move {
                let db = ctx
                    .get::<Database>()
                    .ok_or_else(|| EffectError::ContextNotProvided("Database".to_string()))?;
                Ok(db.data)
            })
        });

        let result = runtime.run(effect).await;
        assert_eq!(result, Ok(42));
    }
}
