//! # The Evaluator (Judge)
//! This module provides an independent, objective assessment of the agent's performance.
//! It separates the role of 'actor' from 'judge' to mitigate bias and provide a stable ground truth for the feedback loop.

use crate::common::Error;
use crate::formalism::{Evaluation, Objective, State};
use crate::llm::{LanguageModel, MockLLM};
use async_trait::async_trait;
use prompt::{PromptBuilder, PromptRegistry, PromptTemplate};
use std::io::Write;

/// The core trait for any evaluation system.
#[async_trait]
pub trait Evaluator: Send + Sync {
    /// Evaluates a given state (containing the execution trace) and returns a structured evaluation.
    async fn evaluate_state(&self, state: &State) -> Result<Evaluation, Error>;
}

/// A trait for components that can reflect on a reasoning process.
/// This enables meta-cognitive capabilities for self-improvement.
pub trait Reflector {
    /// Analyzes the given reasoning state and produces insights.
    fn reflect(&mut self, state: &State);
}

/// A simple reflector that logs the state to a given output stream.
pub struct LoggingReflector<'a> {
    output: &'a mut dyn Write,
}

impl<'a> LoggingReflector<'a> {
    /// Creates a new logging reflector with the given output stream
    pub fn new(output: &'a mut dyn Write) -> Self {
        Self { output }
    }
}

impl Reflector for LoggingReflector<'_> {
    fn reflect(&mut self, state: &State) {
        writeln!(self.output, "\n[Reflection] --- Meta-Analysis Report ---").unwrap();
        writeln!(
            self.output,
            "[Reflection] Reasoning steps executed: {}",
            state.steps_executed
        )
        .unwrap();
        writeln!(
            self.output,
            "[Reflection] Total facts in KB: {}",
            state.knowledge_base.facts.len()
        )
        .unwrap();
        if state.new_facts_derived {
            writeln!(self.output, "[Reflection] New facts were derived.").unwrap();
        } else {
            writeln!(self.output, "[Reflection] No new facts were derived.").unwrap();
        }
        writeln!(self.output, "[Reflection] --- End of Report ---\n").unwrap();
    }
}

/// A reflector that collects insights for programmatic use.
#[derive Default, Debug)]
pub struct InsightReflector {
    /// Collected insights from reflection
    pub insights: Vec<String>,
}

impl InsightReflector {
    /// Creates a new insight reflector
    pub fn new() -> Self {
        Self::default()
    }

    /// Returns the collected insights
    pub fn get_insights(&self) -> &[String] {
        &self.insights
    }

    /// Clears all collected insights
    pub fn clear(&mut self) {
        self.insights.clear();
    }
}

impl Reflector for InsightReflector {
    fn reflect(&mut self, state: &State) {
        self.insights.push(format!(
            "Steps executed: {}, Facts: {}, New facts derived: {}",
            state.steps_executed,
            state.knowledge_base.facts.len(),
            state.new_facts_derived
        ));

        // Check for potential issues
        if state.steps_executed > 100 {
            self.insights
                .push("Warning: High iteration count, consider optimizing strategy".to_string());
        }

        if state.knowledge_base.facts.len() > 1000 {
            self.insights.push(
                "Warning: Large knowledge base, consider pruning irrelevant facts".to_string(),
            );
        }
    }
}

/// An evaluator that uses a Language Model to assess the agent's performance.
pub struct LlmEvaluator {
    llm: Box<dyn LanguageModel>,
    registry: PromptRegistry,
}

impl LlmEvaluator {
    pub fn new() -> Self {
        let mut registry = PromptRegistry::new();
        registry.register(
            PromptTemplate::new(
                "evaluator",
                "As an impartial evaluator, assess the following execution trace for the query: '{{query}}'.\n\n\
                 Trace:\n{{trace_json}}\n\n\
                 Based on the trace, provide a JSON object with your evaluation, including scores for 'correctness' (0.0-1.0), \
                 'completeness' (0.0-1.0), and 'cost' (a normalized value, e.g., 0.2 for low cost), and optional 'feedback' for improvement. \
                 If the answer is sufficient, set 'is_sufficient' to true.",
            )
            .with_system("You are a rigorous and impartial judge of reasoning processes."),
        );

        Self {
            llm: Box::new(MockLLM::new()),
            registry,
        }
    }
}

impl Default for LlmEvaluator {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl Evaluator for LlmEvaluator {
    async fn evaluate_state(&self, state: &State) -> Result<Evaluation, Error> {
        let trace_json = serde_json::to_string_pretty(&state.trace).unwrap_or_default();

        let prompt_content = PromptBuilder::new(&self.registry, "evaluator")
            .var("query", state.initial_query.clone())
            .var("trace_json", trace_json)
            .build()
            .map_err(|e| Error::ProcessingError(format!("Failed to build evaluator prompt: {}", e)))?;

        let full_prompt = format!(
            "{}\n{}",
            prompt_content.system.unwrap_or_default(),
            prompt_content.user
        );

        let llm_response = self.llm.generate(&full_prompt).await?;

        let evaluation: Evaluation = serde_json::from_str(&llm_response)
            .map_err(|e| Error::ProcessingError(format!("Failed to parse evaluation from LLM: {}", e)))?;

        Ok(evaluation)
    }
}
