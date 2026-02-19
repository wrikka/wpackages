use crate::error::{EffectError, EffectResult};
use crate::services::Runtime;
use crate::types::{Context, Effect};
use tracing::info;

pub struct App {
    runtime: Runtime,
}

impl App {
    pub fn new(runtime: Runtime) -> Self {
        Self { runtime }
    }

    pub fn with_context(context: Context) -> Self {
        Self {
            runtime: Runtime::with_context(context),
        }
    }

    pub async fn run<T, E>(&self, effect: Effect<T, E, Context>) -> EffectResult<T>
    where
        T: Send + 'static,
        E: Into<EffectError> + Send + 'static,
        Context: Clone + Send + Sync + 'static,
    {
        info!("Running effect");
        self.runtime.run(effect).await
    }
}

impl Default for App {
    fn default() -> Self {
        Self::new(Runtime::new())
    }
}
