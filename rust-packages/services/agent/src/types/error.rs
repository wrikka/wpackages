// d:\wai\rust-packages\ai\ai-agent\src\types\error.rs

use thiserror::Error;

/// Represents errors that can occur within the `AgentCore` lifecycle.
#[derive(Debug, Error)]
pub enum AgentCoreError {
    #[error("Analysis failed: {0}")]
    AnalysisError(String),

    #[error("World modeling failed: {0}")]
    WorldModelError(String),

    #[error("Planning failed: {0}")]
    PlanningError(String),

    #[error("Search expansion failed: {0}")]
    SearchError(String),

    #[error("Simulation failed: {0}")]
    SimulationError(String),

    #[error("Evaluation failed: {0}")]
    EvaluationError(String),

    #[error("Action selection failed: {0}")]
    SelectionError(String),

    #[error("Execution failed: {0}")]
    ExecutionError(String),

    #[error("Learning failed: {0}")]
    LearningError(String),

    #[error("An unknown error has occurred.")]
    Unknown,
}
