//! Provides a default, parallel implementation of the `Critic` trait.

use crate::types::dynamic::DynamicComponent;
use crate::types::traits::Critic;
use async_trait::async_trait;
use rayon::prelude::*;

/// A simple critic that evaluates simulations in parallel within an async context.
///
/// It requires that the `Simulation` type itself implements the `Critic` trait,
/// allowing the evaluation logic to be defined directly on the simulation object.
pub struct ParallelCritic;

impl DynamicComponent for ParallelCritic {
    fn as_any(&self) -> &dyn std::any::Any {
        self
    }
}

#[async_trait]
impl<S> Critic<S> for ParallelCritic
where
    S: Critic<S, Evaluation = S::Evaluation> + Send + Sync,
    S::Evaluation: Send + Sync,
{
    type Evaluation = S::Evaluation;

    /// Evaluates a vector of simulations in parallel using `rayon`.
    ///
    /// This implementation delegates the actual evaluation logic to the `evaluate`
    /// method on each individual simulation object.
    async fn evaluate(&self, simulations: Vec<S>) -> Vec<Self::Evaluation> {
        // Spawn the CPU-bound rayon computation on a blocking-safe thread pool.
        tokio::task::spawn_blocking(move || {
            simulations
                .into_par_iter()
                .map(|sim| sim.evaluate(sim)) // The simulation evaluates itself
                .collect()
        })
        .await
        .unwrap() // Propagate panics from the blocking task.
    }
}
