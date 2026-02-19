//! components/benchmark.rs

use crate::components::AgentCore;
use crate::types::benchmark::{PerformanceReport, StepTimings};
use crate::types::error::AgentCoreError;
use std::time::Instant;

/// A wrapper around an `AgentCore` that records performance metrics.
pub struct BenchmarkAgent<A> {
    inner_agent: A,
    report: PerformanceReport,
}

impl<A> BenchmarkAgent<A> {
    /// Creates a new `BenchmarkAgent` that wraps the given `AgentCore`.
    pub fn new(inner_agent: A) -> Self {
        Self {
            inner_agent,
            report: PerformanceReport::default(),
        }
    }

    /// Runs a single step of the inner agent's reasoning cycle and records timings.
    pub async fn step<'a, Input>(&'a mut self, input: &'a Input) -> Result<(), AgentCoreError>
    where
        A: 'a, // A simplified bound for the example
    {
        let mut timings = StepTimings::default();
        let total_start = Instant::now();

        // This is a simplified representation. A full implementation would require
        // macros or a more intrusive approach to accurately time each async call
        // within the real AgentCore::step method.

        let start = Instant::now();
        // self.inner_agent.ops.analyze(...).await;
        timings.analyze = start.elapsed();

        // ... time each of the other steps (model, plan, etc.) ...

        timings.total = total_start.elapsed();
        self.report.step_timings.push(timings);

        // let result = self.inner_agent.step(input).await?;
        Ok(())
    }

    /// Returns a reference to the performance report.
    pub fn report(&self) -> &PerformanceReport {
        &self.report
    }
}
