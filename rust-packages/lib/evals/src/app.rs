//! Application Layer - Orchestrates flows between components and services

use std::sync::Arc;
use ai_evals::prelude::*;
use ai_evals::services::{
    EvaluationService, ModelService, DatasetService, StorageService,
};
use ai_evals::components::similarity::SimilarityCalculator;
use ai_evals::adapters::logger::LoggerFactory;

/// Application orchestrator that coordinates all services
pub struct Application {
    evaluation_service: Arc<dyn EvaluationService>,
    model_service: Arc<dyn ModelService>,
    dataset_service: Arc<dyn DatasetService>,
    storage_service: Arc<dyn StorageService>,
    similarity_calculator: Arc<dyn SimilarityCalculator>,
    logger: ai_evals::adapters::logger::Logger,
}

impl Application {
    /// Create a new application instance with all required services
    pub fn new(
        evaluation_service: Arc<dyn EvaluationService>,
        model_service: Arc<dyn ModelService>,
        dataset_service: Arc<dyn DatasetService>,
        storage_service: Arc<dyn StorageService>,
        similarity_calculator: Arc<dyn SimilarityCalculator>,
    ) -> Self {
        Self {
            evaluation_service,
            model_service,
            dataset_service,
            storage_service,
            similarity_calculator,
            logger: LoggerFactory::create("app"),
        }
    }

    /// Run a complete evaluation workflow
    pub async fn run_evaluation_workflow(
        &self,
        config: EvalConfig,
    ) -> EvalResult<FullEvalResult> {
        log_info!(
            self.logger,
            "Starting evaluation workflow",
            name => &config.name,
            model => &config.model,
            dataset => &config.dataset
        );

        // Validate configuration
        config.validate()?;

        // Check if dataset exists
        let dataset_info = self.dataset_service.get_dataset_info(&config.dataset).await?;
        log_info!(
            self.logger,
            "Dataset loaded",
            id => &dataset_info.id,
            samples => dataset_info.sample_count
        );

        // Check model availability
        let model_info = self.model_service.get_model_info().await?;
        log_info!(
            self.logger,
            "Model ready",
            name => &model_info.name,
            version => &model_info.version
        );

        // Run evaluation
        let result = self.evaluation_service.run_evaluation(config).await?;

        // Save results
        self.storage_service.save_evaluation_result(&result).await?;
        log_info!(
            self.logger,
            "Evaluation completed and saved",
            eval_id => %result.id.0,
            pass_rate => result.pass_rate()
        );

        Ok(result)
    }

    /// Get evaluation result by ID
    pub async fn get_evaluation_result(&self, eval_id: &EvalId) -> EvalResult<FullEvalResult> {
        self.storage_service.load_evaluation_result(&eval_id.0.to_string()).await
    }

    /// List all evaluations
    pub async fn list_evaluations(&self) -> EvalResult<Vec<ai_evals::services::storage::EvalSummary>> {
        self.storage_service.list_evaluations().await
    }

    /// Cancel running evaluation
    pub async fn cancel_evaluation(&self, eval_id: &EvalId) -> EvalResult<()> {
        log_info!(self.logger, "Cancelling evaluation", eval_id => %eval_id.0);
        self.evaluation_service.cancel_evaluation(eval_id).await
    }

    /// List available datasets
    pub async fn list_datasets(&self) -> EvalResult<Vec<ai_evals::services::dataset::DatasetInfo>> {
        self.dataset_service.list_datasets().await
    }

    /// Get model information
    pub async fn get_model_info(&self) -> EvalResult<ai_evals::services::model::ModelInfo> {
        self.model_service.get_model_info().await
    }

    /// Validate system health
    pub async fn health_check(&self) -> EvalResult<SystemHealth> {
        let mut checks = Vec::new();

        // Check model service
        let model_health = self.check_model_service().await;
        checks.push(model_health);

        // Check dataset service
        let dataset_health = self.check_dataset_service().await;
        checks.push(dataset_health);

        // Check storage service
        let storage_health = self.check_storage_service().await;
        checks.push(storage_health);

        let overall_healthy = checks.iter().all(|check| check.healthy);
        let health = SystemHealth {
            healthy: overall_healthy,
            checks,
            timestamp: chrono::Utc::now(),
        };

        Ok(health)
    }

    /// Check model service health
    async fn check_model_service(&self) -> ServiceHealth {
        match self.model_service.get_model_info().await {
            Ok(info) => ServiceHealth {
                service: "model".to_string(),
                healthy: true,
                message: format!("Model {} is available", info.name),
                details: Some(serde_json::json!({
                    "name": info.name,
                    "version": info.version,
                    "capabilities": info.capabilities
                })),
            },
            Err(e) => ServiceHealth {
                service: "model".to_string(),
                healthy: false,
                message: format!("Model service unavailable: {}", e),
                details: None,
            },
        }
    }

    /// Check dataset service health
    async fn check_dataset_service(&self) -> ServiceHealth {
        match self.dataset_service.list_datasets().await {
            Ok(datasets) => ServiceHealth {
                service: "dataset".to_string(),
                healthy: true,
                message: format!("Dataset service available with {} datasets", datasets.len()),
                details: Some(serde_json::json!({
                    "dataset_count": datasets.len()
                })),
            },
            Err(e) => ServiceHealth {
                service: "dataset".to_string(),
                healthy: false,
                message: format!("Dataset service unavailable: {}", e),
                details: None,
            },
        }
    }

    /// Check storage service health
    async fn check_storage_service(&self) -> ServiceHealth {
        match self.storage_service.list_evaluations().await {
            Ok(evaluations) => ServiceHealth {
                service: "storage".to_string(),
                healthy: true,
                message: format!("Storage service available with {} evaluations", evaluations.len()),
                details: Some(serde_json::json!({
                    "evaluation_count": evaluations.len()
                })),
            },
            Err(e) => ServiceHealth {
                service: "storage".to_string(),
                healthy: false,
                message: format!("Storage service unavailable: {}", e),
                details: None,
            },
        }
    }
}

/// System health information
#[derive(Debug, Clone)]
pub struct SystemHealth {
    pub healthy: bool,
    pub checks: Vec<ServiceHealth>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

/// Individual service health information
#[derive(Debug, Clone)]
pub struct ServiceHealth {
    pub service: String,
    pub healthy: bool,
    pub message: String,
    pub details: Option<serde_json::Value>,
}

/// Application builder for convenient construction
pub struct ApplicationBuilder {
    evaluation_service: Option<Arc<dyn EvaluationService>>,
    model_service: Option<Arc<dyn ModelService>>,
    dataset_service: Option<Arc<dyn DatasetService>>,
    storage_service: Option<Arc<dyn StorageService>>,
    similarity_calculator: Option<Arc<dyn SimilarityCalculator>>,
}

impl ApplicationBuilder {
    /// Create a new application builder
    pub fn new() -> Self {
        Self {
            evaluation_service: None,
            model_service: None,
            dataset_service: None,
            storage_service: None,
            similarity_calculator: None,
        }
    }

    /// Set evaluation service
    pub fn with_evaluation_service(mut self, service: Arc<dyn EvaluationService>) -> Self {
        self.evaluation_service = Some(service);
        self
    }

    /// Set model service
    pub fn with_model_service(mut self, service: Arc<dyn ModelService>) -> Self {
        self.model_service = Some(service);
        self
    }

    /// Set dataset service
    pub fn with_dataset_service(mut self, service: Arc<dyn DatasetService>) -> Self {
        self.dataset_service = Some(service);
        self
    }

    /// Set storage service
    pub fn with_storage_service(mut self, service: Arc<dyn StorageService>) -> Self {
        self.storage_service = Some(service);
        self
    }

    /// Set similarity calculator
    pub fn with_similarity_calculator(mut self, calculator: Arc<dyn SimilarityCalculator>) -> Self {
        self.similarity_calculator = Some(calculator);
        self
    }

    /// Build the application
    pub fn build(self) -> EvalResult<Application> {
        let evaluation_service = self.evaluation_service
            .ok_or_else(|| EvalError::invalid_configuration("Evaluation service is required"))?;
        
        let model_service = self.model_service
            .ok_or_else(|| EvalError::invalid_configuration("Model service is required"))?;
        
        let dataset_service = self.dataset_service
            .ok_or_else(|| EvalError::invalid_configuration("Dataset service is required"))?;
        
        let storage_service = self.storage_service
            .ok_or_else(|| EvalError::invalid_configuration("Storage service is required"))?;
        
        let similarity_calculator = self.similarity_calculator
            .ok_or_else(|| EvalError::invalid_configuration("Similarity calculator is required"))?;

        Ok(Application {
            evaluation_service,
            model_service,
            dataset_service,
            storage_service,
            similarity_calculator,
            logger: LoggerFactory::create("app"),
        })
    }
}

impl Default for ApplicationBuilder {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ai_evals::services::{
        MockEvaluationService, MockModelService, MemoryDatasetService, MemoryStorageService,
    };
    use ai_evals::components::similarity::JaccardSimilarity;

    #[tokio::test]
    async fn test_application_builder() {
        let model_service = Arc::new(MockModelService::new("test".to_string()));
        let dataset_service = Arc::new(MemoryDatasetService::new());
        let storage_service = Arc::new(MemoryStorageService::new());
        let similarity_calculator = Arc::new(JaccardSimilarity);

        // This would fail because evaluation_service is missing
        let result = ApplicationBuilder::new()
            .with_model_service(model_service.clone())
            .with_dataset_service(dataset_service.clone())
            .with_storage_service(storage_service.clone())
            .with_similarity_calculator(similarity_calculator.clone())
            .build();

        assert!(result.is_err());

        // This should work with all services
        let eval_service = Arc::new(MockEvaluationService::new());
        let result = ApplicationBuilder::new()
            .with_evaluation_service(eval_service)
            .with_model_service(model_service)
            .with_dataset_service(dataset_service)
            .with_storage_service(storage_service)
            .with_similarity_calculator(similarity_calculator)
            .build();

        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_health_check() {
        let model_service = Arc::new(MockModelService::new("test".to_string()));
        let dataset_service = Arc::new(MemoryDatasetService::new());
        let storage_service = Arc::new(MemoryStorageService::new());
        let similarity_calculator = Arc::new(JaccardSimilarity);
        let eval_service = Arc::new(MockEvaluationService::new());

        let app = ApplicationBuilder::new()
            .with_evaluation_service(eval_service)
            .with_model_service(model_service)
            .with_dataset_service(dataset_service)
            .with_storage_service(storage_service)
            .with_similarity_calculator(similarity_calculator)
            .build()
            .unwrap();

        let health = app.health_check().await.unwrap();
        assert!(health.healthy);
        assert_eq!(health.checks.len(), 3);
    }
}
