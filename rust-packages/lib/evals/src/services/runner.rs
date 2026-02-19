//! Evaluation runner

use chrono::Utc;
use tokio::sync::Semaphore;
use tracing::{info, warn};

use crate::{Eval, EvalConfig, EvalResult, EvalSample, EvalStatus, SampleResult};

/// Evaluation runner
pub struct EvalRunner {
    config: EvalConfig,
}

impl EvalRunner {
    pub fn new(config: EvalConfig) -> Self {
        Self { config }
    }

    pub async fn run<E: Eval + ?Sized>(
        &self,
        eval: &E,
        samples: Vec<EvalSample>,
    ) -> EvalResult {
        let started_at = Utc::now();
        let total_samples = samples.len();

        info!("Starting evaluation '{}' with {} samples", eval.name(), total_samples);

        let sample_results = if self.config.parallel {
            self.run_parallel(eval, samples).await
        } else {
            self.run_sequential(eval, samples).await
        };

        let completed_at = Utc::now();
        let passed_samples = sample_results.iter().filter(|r| r.passed).count();
        let failed_samples = total_samples - passed_samples;
        let average_score = if sample_results.is_empty() {
            0.0
        } else {
            sample_results.iter().map(|r| r.score).sum::<f64>() / sample_results.len() as f64
        };

        EvalResult {
            id: Default::default(),
            name: eval.name().to_string(),
            status: EvalStatus::Completed,
            started_at,
            completed_at: Some(completed_at),
            total_samples,
            passed_samples,
            failed_samples,
            average_score,
            sample_results,
            metrics: serde_json::json!({}),
        }
    }

    async fn run_sequential<E: Eval + ?Sized>(
        &self,
        eval: &E,
        samples: Vec<EvalSample>,
    ) -> Vec<SampleResult> {
        let mut results = Vec::with_capacity(samples.len());
        
        for sample in samples {
            match eval.evaluate(&sample).await {
                result => results.push(result),
            }
        }
        
        results
    }

    async fn run_parallel<E: Eval + ?Sized>(
        &self,
        eval: &E,
        samples: Vec<EvalSample>,
    ) -> Vec<SampleResult> {
        let semaphore = Semaphore::new(self.config.max_concurrency);
        let mut handles = Vec::with_capacity(samples.len());

        for sample in samples {
            let permit = semaphore.clone().acquire_owned().await.unwrap();
            let eval_ref = eval as &dyn Eval;
            
            handles.push(tokio::spawn(async move {
                let result = eval_ref.evaluate(&sample).await;
                drop(permit);
                result
            }));
        }

        let mut results = Vec::with_capacity(handles.len());
        for handle in handles {
            match handle.await {
                Ok(result) => results.push(result),
                Err(e) => warn!("Task join error: {}", e),
            }
        }
        
        results
    }
}
