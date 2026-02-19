//! Default evaluation service implementation

use async_trait::async_trait;
use std::sync::Arc;
use tokio::time::timeout;

use crate::error::{EvalError, EvalResult};
use super::service::EvaluationService;
use super::types::{EvaluationProgress, EvaluationStats};
use crate::types::core::{EvalSample, SampleResult, EvalId, EvalStatus};
use crate::types::config::EvalConfig;
use crate::types::results::EvalResult as FullEvalResult;
use crate::components::evaluation::{evaluate_sample, calculate_statistics};
use crate::components::similarity::SimilarityCalculator;
use crate::services::model::ModelService;
use crate::services::dataset::DatasetService;
use chrono::Utc;

/// Default evaluation service implementation
pub struct DefaultEvaluationService {
    model_service: Arc<dyn ModelService>,
    dataset_service: Arc<dyn DatasetService>,
    similarity_calculator: Arc<dyn SimilarityCalculator>,
}

impl DefaultEvaluationService {
    /// Create new evaluation service
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

    /// Evaluate a single sample with timeout
    async fn evaluate_sample_with_timeout(
        &self,
        sample: EvalSample,
        config: &EvalConfig,
    ) -> EvalResult<SampleResult> {
        let timeout_duration = std::time::Duration::from_millis(config.timeout_ms);

        let result = timeout(timeout_duration, async {
            evaluate_sample(
                sample,
                &*self.model_service,
                &*self.similarity_calculator,
            ).await
        }).await;

        match result {
            Ok(sample_result) => sample_result,
            Err(_) => Err(EvalError::timeout_error(config.timeout_ms)),
        }
    }

    /// Run evaluation with progress tracking
    async fn run_evaluation_with_progress(
        &self,
        config: EvalConfig,
    ) -> EvalResult<FullEvalResult> {
        let eval_id = EvalId::new();
        let start_time = Utc::now();

        // Load dataset
        let dataset = self.dataset_service.load_dataset(&config.dataset).await?;

        // Initialize progress
        let mut progress = EvaluationProgress::new(eval_id.0.to_string(), dataset.samples.len());

        // Evaluate samples
        let mut sample_results = Vec::new();
        let mut failed_count = 0;

        for sample in dataset.samples {
            let sample_result = match self.evaluate_sample_with_timeout(sample.clone(), &config).await {
                Ok(result) => result,
                Err(e) => {
                    failed_count += 1;
                    SampleResult {
                        sample_id: sample.id,
                        score: 0.0,
                        passed: false,
                        latency_ms: 0,
                        error: Some(e.to_string()),
                        output: String::new(),
                    }
                }
            };

            progress.update_completed(sample_result.sample_id.clone(), sample_result.passed);
            sample_results.push(sample_result);
        }

        // Calculate final statistics
        let stats = EvaluationStats::from_samples(&sample_results);
        let completed_time = Utc::now();

        // Create evaluation result
        let result = FullEvalResult {
            id: eval_id,
            name: config.name,
            status: if failed_count > 0 { EvalStatus::Completed } else { EvalStatus::Completed },
            started_at: start_time,
            completed_at: Some(completed_time),
            total_samples: sample_results.len(),
            passed_samples: sample_results.iter().filter(|s| s.passed).count(),
            failed_samples: failed_count,
            sample_results,
            average_score: stats.average_score,
        };

        Ok(result)
    }

    /// Cancel evaluation by marking as cancelled
    async fn cancel_evaluation_internal(&self, eval_id: &EvalId) -> EvalResult<()> {
        // In a real implementation, this would:
        // 1. Signal the running evaluation to stop
        // 2. Update the evaluation status in storage
        // 3. Clean up any resources
        
        // For now, we'll just return success
        // The actual cancellation logic would depend on the storage implementation
        Ok(())
    }
}

#[async_trait]
impl EvaluationService for DefaultEvaluationService {
    async fn run_evaluation(&self, config: EvalConfig) -> EvalResult<FullEvalResult> {
        // Validate configuration
        config.validate()?;

        // Check if dataset exists
        let _dataset_info = self.dataset_service.get_dataset_info(&config.dataset).await?;

        // Check model availability
        let _model_info = self.model_service.get_model_info().await?;

        // Run evaluation
        self.run_evaluation_with_progress(config).await
    }

    async fn cancel_evaluation(&self, eval_id: &EvalId) -> EvalResult<()> {
        self.cancel_evaluation_internal(eval_id).await
    }

    async fn get_evaluation_status(&self, eval_id: &EvalId) -> EvalResult<EvalStatus> {
        // In a real implementation, this would query the storage service
        // For now, we'll return a default status
        Ok(EvalStatus::Running)
    }
}
