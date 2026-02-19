// d:\wai\rust-packages\ai\ai-agent\src\types\core.rs

/// Represents the result of a single agent step.
pub enum AgentStepResult<T> {
    /// The agent should continue processing.
    Continue(T),
    /// The agent has finished its task.
    Finished(T),
}

