//! Saga pattern support (requires `distributed` feature)

use crate::error::EffectError;
use crate::types::effect::Effect;
use std::collections::HashMap;
use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;
use tokio::sync::Mutex;

/// Saga step representing a single unit of work with compensation
#[derive(Debug, Clone)]
pub struct SagaStep<T, E, R> {
    pub id: String,
    pub name: String,
    pub effect: Effect<T, E, R>,
    pub compensation: Option<Effect<(), E, R>>,
}

impl<T, E, R> SagaStep<T, E, R> {
    #[cfg(feature = "distributed")]
    pub fn new(name: impl Into<String>, effect: Effect<T, E, R>) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name: name.into(),
            effect,
            compensation: None,
        }
    }

    #[cfg(not(feature = "distributed"))]
    pub fn new(name: impl Into<String>, effect: Effect<T, E, R>) -> Self {
        Self {
            id: format!("step-{}", std::time::SystemTime::now().elapsed().unwrap().as_nanos()),
            name: name.into(),
            effect,
            compensation: None,
        }
    }

    pub fn with_compensation(mut self, compensation: Effect<(), E, R>) -> Self {
        self.compensation = Some(compensation);
        self
    }
}

/// Saga execution status
#[derive(Debug, Clone, PartialEq)]
pub enum SagaStatus {
    Pending,
    Running,
    Completed,
    Compensating,
    Compensated,
    Failed(String),
}

/// Saga execution result
#[derive(Debug, Clone)]
pub struct SagaResult {
    pub status: SagaStatus,
    pub completed_steps: Vec<String>,
    pub failed_step: Option<String>,
    pub compensation_errors: Vec<String>,
}

/// Saga coordinator for managing distributed transactions
pub struct SagaCoordinator<T, E, R> {
    steps: Vec<SagaStep<T, E, R>>,
    results: Arc<Mutex<HashMap<String, T>>>,
    executed_steps: Arc<Mutex<Vec<String>>>,
}

impl<T, E, R> SagaCoordinator<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + std::fmt::Display + 'static,
    R: Send + Sync + Clone + 'static,
{
    pub fn new() -> Self {
        Self {
            steps: Vec::new(),
            results: Arc::new(Mutex::new(HashMap::new())),
            executed_steps: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn add_step(mut self, step: SagaStep<T, E, R>) -> Self {
        self.steps.push(step);
        self
    }

    pub async fn execute(self, ctx: R) -> Result<Vec<T>, SagaResult> {
        let mut results_vec = Vec::new();
        let mut executed = Vec::new();

        for step in &self.steps {
            match step.effect.clone().run(ctx.clone()).await {
                Ok(result) => {
                    results_vec.push(result.clone());
                    executed.push(step.id.clone());

                    // Store result
                    let mut results_guard = self.results.lock().await;
                    results_guard.insert(step.id.clone(), result);
                    drop(results_guard);
                }
                Err(e) => {
                    // Execute compensation for all completed steps in reverse order
                    let compensation_result = self.compensate(&executed, ctx.clone()).await;

                    return Err(SagaResult {
                        status: SagaStatus::Failed(e.to_string()),
                        completed_steps: executed,
                        failed_step: Some(step.name.clone()),
                        compensation_errors: compensation_result,
                    });
                }
            }
        }

        // Update executed steps
        let mut executed_guard = self.executed_steps.lock().await;
        *executed_guard = executed;
        drop(executed_guard);

        Ok(results_vec)
    }

    async fn compensate(&self, step_ids: &[String], ctx: R) -> Vec<String> {
        let mut errors = Vec::new();

        // Find completed steps with compensation
        let completed_steps: Vec<_> = self
            .steps
            .iter()
            .filter(|s| step_ids.contains(&s.id))
            .filter(|s| s.compensation.is_some())
            .collect();

        // Execute compensations in reverse order
        for step in completed_steps.iter().rev() {
            if let Some(ref compensation) = step.compensation {
                if let Err(e) = compensation.clone().run(ctx.clone()).await {
                    errors.push(format!("Step '{}': {}", step.name, e));
                }
            }
        }

        errors
    }
}

impl<T, E, R> Default for SagaCoordinator<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + std::fmt::Display + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn default() -> Self {
        Self::new()
    }
}

/// Saga builder for fluent API
#[derive(Default)]
pub struct SagaBuilder<T, E, R> {
    steps: Vec<SagaStep<T, E, R>>,
}

impl<T, E, R> SagaBuilder<T, E, R> {
    pub fn new() -> Self {
        Self { steps: Vec::new() }
    }

    pub fn step(mut self, name: impl Into<String>, effect: Effect<T, E, R>) -> SagaStepBuilder<T, E, R> {
        SagaStepBuilder::new(self, name, effect)
    }

    pub fn build(self) -> SagaCoordinator<T, E, R> {
        SagaCoordinator {
            steps: self.steps,
            results: Arc::new(Mutex::new(HashMap::new())),
            executed_steps: Arc::new(Mutex::new(Vec::new())),
        }
    }
}

/// Saga step builder
pub struct SagaStepBuilder<T, E, R> {
    saga_builder: SagaBuilder<T, E, R>,
    step: SagaStep<T, E, R>,
}

impl<T, E, R> SagaStepBuilder<T, E, R> {
    pub fn new(saga_builder: SagaBuilder<T, E, R>, name: impl Into<String>, effect: Effect<T, E, R>) -> Self {
        Self {
            saga_builder,
            step: SagaStep::new(name, effect),
        }
    }

    pub fn compensate(mut self, compensation: Effect<(), E, R>) -> Self {
        self.step.compensation = Some(compensation);
        self
    }

    pub fn done(mut self) -> SagaBuilder<T, E, R> {
        self.saga_builder.steps.push(self.step);
        self.saga_builder
    }
}

/// Long-running saga with persistence support
#[derive(Debug, Clone)]
pub struct PersistentSaga {
    pub saga_id: String,
    pub status: SagaStatus,
    pub steps: Vec<SagaStepStatus>,
}

#[derive(Debug, Clone)]
pub struct SagaStepStatus {
    pub step_id: String,
    pub step_name: String,
    pub status: StepStatus,
    pub result: Option<String>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum StepStatus {
    Pending,
    Running,
    Completed,
    Failed,
    Compensated,
}

/// Saga persistence trait
#[async_trait::async_trait]
pub trait SagaPersistence: Send + Sync {
    async fn save_saga(&self, saga: &PersistentSaga) -> Result<(), EffectError>;
    async fn load_saga(&self, saga_id: &str) -> Result<Option<PersistentSaga>, EffectError>;
    async fn update_step_status(
        &self,
        saga_id: &str,
        step_id: &str,
        status: StepStatus,
        result: Option<String>,
    ) -> Result<(), EffectError>;
}

/// Saga orchestrator for complex workflows
pub struct SagaOrchestrator {
    persistence: Option<Arc<dyn SagaPersistence>>,
}

impl SagaOrchestrator {
    pub fn new() -> Self {
        Self { persistence: None }
    }

    pub fn with_persistence(mut self, persistence: Arc<dyn SagaPersistence>) -> Self {
        self.persistence = Some(persistence);
        self
    }

    pub fn create_saga<T, E, R>(&self) -> SagaBuilder<T, E, R> {
        SagaBuilder::new()
    }
}

impl Default for SagaOrchestrator {
    fn default() -> Self {
        Self::new()
    }
}

/// Parallel saga execution for independent steps
pub struct ParallelSaga<T, E, R> {
    step_groups: Vec<Vec<SagaStep<T, E, R>>>,
}

impl<T, E, R> ParallelSaga<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + std::fmt::Display + 'static,
    R: Send + Sync + Clone + 'static,
{
    pub fn new() -> Self {
        Self { step_groups: Vec::new() }
    }

    pub fn add_group(mut self, steps: Vec<SagaStep<T, E, R>>) -> Self {
        self.step_groups.push(steps);
        self
    }

    pub async fn execute(self, ctx: R) -> Result<Vec<Vec<T>>, SagaResult> {
        let mut all_results = Vec::new();
        let mut executed_steps = Vec::new();

        for (group_idx, group) in self.step_groups.iter().enumerate() {
            let mut group_results = Vec::new();

            // Execute steps in this group in parallel
            let futures: Vec<_> = group
                .iter()
                .map(|step| {
                    let step = step.clone();
                    let ctx = ctx.clone();
                    async move { (step.id.clone(), step.effect.run(ctx).await, step.name.clone()) }
                })
                .collect();

            let results = futures::future::join_all(futures).await;

            // Check for failures
            for (step_id, result, step_name) in results {
                match result {
                    Ok(value) => {
                        group_results.push(value);
                        executed_steps.push(step_id);
                    }
                    Err(e) => {
                        return Err(SagaResult {
                            status: SagaStatus::Failed(format!(
                                "Group {}, Step '{}': {}",
                                group_idx, step_name, e
                            )),
                            completed_steps: executed_steps,
                            failed_step: Some(step_name),
                            compensation_errors: Vec::new(),
                        });
                    }
                }
            }

            all_results.push(group_results);
        }

        Ok(all_results)
    }
}

impl<T, E, R> Default for ParallelSaga<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + std::fmt::Display + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_saga_success() {
        let saga = SagaBuilder::<i32, EffectError, ()>::new()
            .step("step1", Effect::success(1))
            .done()
            .step("step2", Effect::success(2))
            .done()
            .step("step3", Effect::success(3))
            .done()
            .build();

        let result = saga.execute(()).await;
        assert_eq!(result.unwrap(), vec![1, 2, 3]);
    }

    #[tokio::test]
    async fn test_saga_with_compensation() {
        let counter = Arc::new(Mutex::new(0));
        let counter_clone = counter.clone();

        let compensation = Effect::new(move |_| {
            let counter = counter_clone.clone();
            Box::pin(async move {
                let mut guard = counter.lock().await;
                *guard += 1;
                Ok(())
            })
        });

        let saga = SagaBuilder::<i32, EffectError, ()>::new()
            .step("step1", Effect::success(1))
            .compensate(compensation.clone())
            .done()
            .step("step2", Effect::success(2))
            .compensate(compensation.clone())
            .done()
            .step("failing_step", Effect::failure(EffectError::EffectFailed("error".to_string())))
            .done()
            .build();

        let result = saga.execute(()).await;

        assert!(result.is_err());
        let saga_result = result.unwrap_err();
        assert_eq!(saga_result.completed_steps.len(), 2);

        // Both compensations should have run
        let guard = counter.lock().await;
        assert_eq!(*guard, 2);
    }

    #[tokio::test]
    async fn test_parallel_saga() {
        let saga = ParallelSaga::<i32, EffectError, ()>::new()
            .add_group(vec![
                SagaStep::new("a1", Effect::success(1)),
                SagaStep::new("a2", Effect::success(2)),
            ])
            .add_group(vec![
                SagaStep::new("b1", Effect::success(10)),
                SagaStep::new("b2", Effect::success(20)),
            ]);

        let result = saga.execute(()).await;
        let results = result.unwrap();

        // First group results
        assert_eq!(results[0].len(), 2);
        // Second group results
        assert_eq!(results[1].len(), 2);
    }
}
