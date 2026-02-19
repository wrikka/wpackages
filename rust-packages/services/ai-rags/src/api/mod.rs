pub mod handlers;
pub mod state;

use crate::application::services::{document_service::DocumentService, evaluation_service::EvaluationService, finetuning_service::FineTuningService, graph_service::GraphService, plugin_service::PluginService,
    job_service::JobService, qna_service::QnAService,
};
use crate::config::RagConfig;
use axum::{extract::FromRef,
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use tower_http::cors::CorsLayer;

pub async fn run_api_server() {
    let config = RagConfig::new();
        let qna_service = Arc::new(QnAService::new(config).await.unwrap());
        let job_service = Arc::new(JobService::new(qna_service.rag_service.clone()));
        let document_service = Arc::new(DocumentService::new(qna_service.rag_service.clone()));
        let evaluation_service = Arc::new(EvaluationService::new());
        let graph_service = Arc::new(GraphService::new());
        let fine_tuning_service = Arc::new(FineTuningService::new());
    let plugin_service = Arc::new(PluginService::new());

    // Load plugins
    plugin_service.on_load_all(qna_service.rag_service.clone()).unwrap();

    let app_state = AppState { qna_service, job_service, document_service, evaluation_service, graph_service, fine_tuning_service, plugin_service };

    let app = Router::new()
        .route("/ask", post(handlers::ask))
        .route("/process", post(handlers::process_documents))
        .route("/jobs/:id", get(handlers::get_job_status))
        .route("/documents", post(handlers::upload_document).get(handlers::list_documents))
        .route("/documents/:id", get(handlers::get_document).delete(handlers::delete_document))
        .route("/evaluate", post(handlers::evaluate))
        .route("/metrics/:id", get(handlers::get_metrics))
        .route("/graphs", post(handlers::build_graph))
        .route("/graphs/:id", get(handlers::get_graph))
        .route("/finetuning/datasets", post(handlers::create_dataset))
        .route("/finetuning/jobs", post(handlers::start_fine_tuning_job))
        .route("/finetuning/jobs/:id", get(handlers::get_fine_tuning_job_status))
        .route("/batch_ask", post(handlers::batch_ask))
        .layer(CorsLayer::permissive())
        .with_state(app_state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
