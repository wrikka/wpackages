//! Evaluation service with I/O operations

use async_trait::async_trait;
use std::sync::Arc;
use tokio::time::timeout;

use crate::error::{EvalError, EvalResult};
use crate::types::core::{EvalSample, SampleResult, EvalId, EvalStatus};
use crate::types::results::EvalResult as FullEvalResult;
use crate::types::config::EvalConfig;
use crate::components::evaluation::{evaluate_sample, calculate_statistics};
use crate::components::similarity::SimilarityCalculator;
use crate::services::model::ModelService;
use crate::services::dataset::DatasetService;
use chrono::Utc;

/// Trait for evaluation operations (I/O layer)
#[async_trait]
pub trait EvaluationService: Send + Sync {
    async fn run_evaluation(&self, config: EvalConfig) -> EvalResult<FullEvalResult>;
    async fn get_evaluation_result(&self, eval_id: &EvalId) -> EvalResult<FullEvalResult>;
    async fn cancel_evaluation(&self, eval_id: &EvalId) -> EvalResult<()>;
}

/// Default evaluation service implementation
pub struct DefaultEvaluationService {
    model_service: Arc<dyn ModelService>,
    dataset_service: Arc<dyn DatasetService>,
    similarity_calculator: Arc<dyn SimilarityCalculator>,
}

impl DefaultEvaluationService {
    /// Create a new evaluation service
    pub fn new(
        model_service: Arc<dyn ModelService>,
        dataset_service: Arc<dyn DatasetService>,
        similarity_calculator: Arc<dyn SimilarityCalculator>,
    ) -> Self {
        Self {
            model_service,
            dataset_service,
            similarity_calculator,
        }
    }
}

#[async_trait]
impl EvaluationService for DefaultEvaluationService {
    async fn run_evaluation(&self, config: EvalConfig) -> EvalResult<FullEvalResult> {
        // Validate configuration
        config.validate()
            .map_err(|e| EvalError::invalid_configuration(e))?;

        let eval_id = EvalId::default();
        let mut result = FullEvalResult::new(eval_id.clone(), config.name.clone(), Utc::now());

        // Mark as started
        result.mark_started();

        // Load dataset
        let samples = self.dataset_service.load_dataset(&config.dataset).await?;
        
        // Apply sample limit if specified
        let samples = if let Some(max_samples) = config.max_samples {
            samples.into_iter().take(max_samples).collect()
        } else {
            samples
        };

        result.total_samples = samples.len();

        // Evaluate samples
        let eval_futures = samples.into_iter().map(|sample| {
            let model_service = Arc::clone(&self.model_service);
            let similarity_calculator = Arc::clone(&self.similarity_calculator);
            let timeout_ms = config.timeout_ms;

            async move {
                let eval_future = async {
                    let output = model_service.generate_response(&sample.input).await?;
                    Ok(evaluate_sample(&sample, &output, similarity_calculator.as_ref()))
                };

                timeout(
                    std::time::Duration::from_millis(timeout_ms),
                    eval_future
                )
                .await
                .map_err(|_| EvalError::timeout_error(timeout_ms))?
            }
        });

        // Execute evaluations with concurrency control
        let semaphore = Arc::new(tokio::sync::Semaphore::new(config.max_concurrency));
        let results = futures::future::join_all(
            eval_futures.map(|future| {
                let semaphore = Arc::clone(&semaphore);
                async move {
                    let _permit = semaphore.acquire().await.unwrap();
                    future.await
                }
            })
        )
        .await;

        // Process results
        for sample_result in results {
            match sample_result {
                Ok(sample_result) => {
                    result.add_sample_result(sample_result);
                }
                Err(e) => {
                    let failed_result = SampleResult::failed(
                        "unknown".to_string(),
                        e.to_string(),
                    );
                    result.add_sample_result(failed_result);
                }
            }
        }

        // Mark as completed
        result.mark_completed();

        Ok(result)
    }

    async fn get_evaluation_result(&self, eval_id: &EvalId) -> EvalResult<FullEvalResult> {
        // This would typically load from storage
        Err(EvalError::dataset_not_found(format!("Evaluation {} not found", eval_id.0)))
    }

    async fn cancel_evaluation(&self, eval_id: &EvalId) -> EvalResult<()> {
        // This would typically cancel running evaluation
        Err(EvalError::evaluation_failed(format!("Cannot cancel evaluation {}", eval_id.0)))
    }
}

/// Mock evaluation service for testing
#[cfg(test)]
pub struct MockEvaluationService {
    results: std::collections::HashMap<EvalId, FullEvalResult>,
}

#[cfg(test)]
impl MockEvaluationService {
    pub fn new() -> Self {
        Self {
            results: std::collections::HashMap::new(),
        }
    }

    pub fn add_result(&mut self, eval_id: EvalId, result: FullEvalResult) {
        self.results.insert(eval_id, result);
    }
}

#[cfg(test)]
#[async_trait]
impl EvaluationService for MockEvaluationService {
    async fn run_evaluation(&self, _config: EvalConfig) -> EvalResult<FullEvalResult> {
        Ok(FullEvalResult::new(
            EvalId::default(),
            "mock_evaluation".to_string(),
            Utc::now(),
        ))
    }

    async fn get_evaluation_result(&self, eval_id: &EvalId) -> EvalResult<FullEvalResult> {
        self.results
            .get(eval_id)
            .cloned()
            .ok_or_else(|| EvalError::dataset_not_found(format!("Evaluation {} not found", eval_id.0)))
    }

    async fn cancel_evaluation(&self, _eval_id: &EvalId) -> EvalResult<()> {
        Ok(())
    }
}
