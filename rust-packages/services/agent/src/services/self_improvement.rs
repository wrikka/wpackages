//! services/self_improvement.rs

use crate::components::BenchmarkAgent;
use crate::services::LlmBatcher;
use crate::types::benchmark::StepTimings;
use crate::types::improvement::CodeChangeSuggestion;
use crate::types::llm::LlmRequest;
use async_trait::async_trait;
use serde_json;
use thiserror::Error;
use uuid::Uuid;

#[derive(Error, Debug)]
pub enum SelfImprovementError {
    #[error("Failed to serialize suggestion request: {0}")]
    JsonError(#[from] serde_json::Error),

    #[error("LLM request failed: {0}")]
    LlmError(String),

    #[error("No performance bottlenecks were identified")]
    NoBottleneckFound,
}


/// A service that orchestrates the agent's self-improvement loop.
#[derive(Clone)]
pub struct SelfImprovementService {
    llm_batcher: LlmBatcher,
}

impl SelfImprovementService {
    pub fn new(llm_batcher: LlmBatcher) -> Self {
        Self { llm_batcher }
    }

    /// Runs a full self-improvement cycle.
    pub async fn run_improvement_cycle<A>(
        &self,
        benchmark_agent: &mut BenchmarkAgent<A>,
    ) -> Result<Option<CodeChangeSuggestion>, SelfImprovementError> {
        let report = benchmark_agent.report();

        let bottleneck = self.analyze_report(report)?;

        let suggestion = self.generate_suggestion(bottleneck).await?;

        Ok(Some(suggestion))
    }

    fn analyze_report(&self, report: &crate::types::benchmark::PerformanceReport) -> Result<(&'static str, std::time::Duration), SelfImprovementError> {
        report.step_timings.iter()
            .flat_map(|s| {
                vec![
                    ("analyze", s.analyze),
                    ("world_model", s.world_model),
                    ("plan", s.plan),
                    ("search", s.search),
                    ("simulate", s.simulate),
                    ("evaluate", s.evaluate),
                    ("select_action", s.select_action),
                    ("execute", s.execute),
                    ("learn", s.learn),
                ]
            })
            .max_by_key(|&(_, d)| d)
            .ok_or(SelfImprovementError::NoBottleneckFound)
    }

    async fn generate_suggestion(&self, bottleneck: (&str, std::time::Duration)) -> Result<CodeChangeSuggestion, SelfImprovementError> {
        let (step_name, duration) = bottleneck;
        let prompt = format!(
            "The '{}' step in my Rust agent is slow, taking {:?}. Suggest an optimization. Respond with a JSON object containing 'file_path' and 'suggestion'.",
            step_name, duration
        );

        let request = LlmRequest {
            id: Uuid::new_v4().to_string(),
            prompt,
        };

        let response = self.llm_batcher.request(request).await;
        let suggestion: CodeChangeSuggestion = serde_json::from_str(&response.content)?;

        Ok(suggestion)
    }
}
