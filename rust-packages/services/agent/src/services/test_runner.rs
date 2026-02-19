//! services/test_runner.rs

use crate::components::AgentCore;
use crate::types::testing::{TestResult, TestScenario};
use serde_json::Value;

/// A service for running end-to-end test scenarios against an agent.
#[derive(Clone, Default)]
pub struct TestRunner;

impl TestRunner {
    pub fn new() -> Self {
        Self::default()
    }

    /// Runs a single test scenario against a given agent instance.
    pub async fn run_scenario<A>(&self, agent: &mut A, scenario: &TestScenario) -> TestResult
    where
        A: AgentRunner, // A generic trait to represent any runnable agent
    {
        for (i, step) in scenario.steps.iter().enumerate() {
            let result = agent.run_step(&step.input).await;

            if result != step.expected_output {
                return TestResult {
                    passed: false,
                    details: format!(
                        "Scenario '{}' failed at step {}: Expected {:?}, got {:?}",
                        scenario.name,
                        i + 1,
                        step.expected_output,
                        result
                    ),
                };
            }
        }

        TestResult {
            passed: true,
            details: format!("Scenario '{}' passed.", scenario.name),
        }
    }
}

/// A helper trait for running a single step of an agent.
#[async_trait::async_trait]
pub trait AgentRunner {
    async fn run_step(&mut self, input: &Value) -> Value;
}
