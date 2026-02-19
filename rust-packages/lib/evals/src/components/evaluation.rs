//! Pure evaluation logic components

use crate::types::core::{EvalSample, SampleResult};
use crate::components::similarity::{SimilarityCalculator, SimilarityResult};

/// Pure function to evaluate a single sample
pub fn evaluate_sample(
    sample: &EvalSample,
    output: &str,
    similarity_calculator: &dyn SimilarityCalculator,
) -> SampleResult {
    let start_time = std::time::Instant::now();
    
    let similarity_result = match &sample.expected {
        Some(expected) => similarity_calculator.calculate(expected, output),
        None => SimilarityResult::new(0.0, "none".to_string(), 0.0),
    };

    let latency_ms = start_time.elapsed().as_millis() as u64;
    let passed = similarity_result.score >= 0.8;
    let score = similarity_result.score;

    SampleResult::new(
        sample.id.clone(),
        output.to_string(),
        score,
        passed,
        latency_ms,
    )
}

/// Pure function to batch evaluate samples
pub fn evaluate_samples(
    samples: &[EvalSample],
    outputs: &[String],
    similarity_calculator: &dyn SimilarityCalculator,
) -> Vec<SampleResult> {
    if samples.len() != outputs.len() {
        return vec![]; // Return empty if lengths don't match
    }

    samples
        .iter()
        .zip(outputs.iter())
        .map(|(sample, output)| evaluate_sample(sample, output, similarity_calculator))
        .collect()
}

/// Pure function to calculate evaluation statistics
pub fn calculate_statistics(results: &[SampleResult]) -> EvaluationStats {
    let total_samples = results.len();
    let passed_samples = results.iter().filter(|r| r.passed).count();
    let failed_samples = total_samples - passed_samples;

    let total_score: f64 = results.iter().map(|r| r.score).sum();
    let average_score = if total_samples > 0 {
        total_score / total_samples as f64
    } else {
        0.0
    };

    let total_latency: u64 = results.iter().map(|r| r.latency_ms).sum();
    let average_latency_ms = if total_samples > 0 {
        total_latency / total_samples as u64
    } else {
        0
    };

    let pass_rate = if total_samples > 0 {
        passed_samples as f64 / total_samples as f64
    } else {
        0.0
    };

    EvaluationStats {
        total_samples,
        passed_samples,
        failed_samples,
        average_score,
        average_latency_ms,
        pass_rate,
    }
}

/// Evaluation statistics
#[derive(Debug, Clone)]
pub struct EvaluationStats {
    pub total_samples: usize,
    pub passed_samples: usize,
    pub failed_samples: usize,
    pub average_score: f64,
    pub average_latency_ms: u64,
    pub pass_rate: f64,
}

impl EvaluationStats {
    /// Create new evaluation statistics
    pub fn new(
        total_samples: usize,
        passed_samples: usize,
        failed_samples: usize,
        average_score: f64,
        average_latency_ms: u64,
        pass_rate: f64,
    ) -> Self {
        Self {
            total_samples,
            passed_samples,
            failed_samples,
            average_score,
            average_latency_ms,
            pass_rate,
        }
    }

    /// Validate the statistics
    pub fn validate(&self) -> Result<(), String> {
        if self.total_samples != self.passed_samples + self.failed_samples {
            return Err(
                "Total samples must equal passed + failed samples".to_string()
            );
        }

        if self.average_score < 0.0 || self.average_score > 1.0 {
            return Err("Average score must be between 0.0 and 1.0".to_string());
        }

        if self.pass_rate < 0.0 || self.pass_rate > 1.0 {
            return Err("Pass rate must be between 0.0 and 1.0".to_string());
        }

        Ok(())
    }
}

/// Pure function to filter results by score threshold
pub fn filter_results_by_score(
    results: &[SampleResult],
    min_score: f64,
) -> Vec<&SampleResult> {
    results
        .iter()
        .filter(|result| result.score >= min_score)
        .collect()
}

/// Pure function to filter results by latency threshold
pub fn filter_results_by_latency(
    results: &[SampleResult],
    max_latency_ms: u64,
) -> Vec<&SampleResult> {
    results
        .iter()
        .filter(|result| result.latency_ms <= max_latency_ms)
        .collect()
}

/// Pure function to get failed results with errors
pub fn get_failed_results(results: &[SampleResult]) -> Vec<&SampleResult> {
    results
        .iter()
        .filter(|result| !result.passed || result.error.is_some())
        .collect()
}

/// Pure function to aggregate errors
pub fn aggregate_errors(results: &[SampleResult]) -> Vec<String> {
    results
        .iter()
        .filter_map(|result| result.error.clone())
        .collect::<std::collections::HashSet<_>>()
        .into_iter()
        .collect()
}
