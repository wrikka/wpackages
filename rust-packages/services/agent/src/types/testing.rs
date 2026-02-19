//! types/testing.rs

use serde::{Deserialize, Serialize};
use serde_json::Value;

/// Represents a single step in an end-to-end test scenario.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestStep {
    pub input: Value, // The input to the agent for this step
    pub expected_output: Value, // The expected result from the agent
}

/// Represents a full end-to-end test scenario for an agent.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestScenario {
    pub name: String,
    pub steps: Vec<TestStep>,
}

/// Represents the result of a test run.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestResult {
    pub passed: bool,
    pub details: String,
}
