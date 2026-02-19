//! types/benchmark.rs

use std::time::Duration;

/// Holds timing information for each step of the agent's reasoning cycle.
#[derive(Debug, Clone, Default)]
pub struct StepTimings {
    pub analyze: Duration,
    pub model: Duration,
    pub plan: Duration,
    pub search: Duration,
    pub simulate: Duration,
    pub evaluate: Duration,
    pub select: Duration,
    pub execute: Duration,
    pub learn: Duration,
    pub total: Duration,
}

/// A comprehensive report of an agent's performance over one or more cycles.
#[derive(Debug, Clone, Default)]
pub struct PerformanceReport {
    pub step_timings: Vec<StepTimings>,
}
