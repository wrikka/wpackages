use crate::application::services::{document_service::DocumentService, evaluation_service::EvaluationService, finetuning_service::FineTuningService, graph_service::GraphService, job_service::JobService, qna_service::QnAService};
use crate::domain::jobs::Job;
use crate::domain::{finetuning::{Dataset, FineTuningJob}, graph::KnowledgeGraph, metrics::Metrics, Document, MetadataFilter, RagResponse};
use axum::{extract::Path,
    extract::State,
    http::StatusCode,
    response::Json,
};
use serde::Deserialize;
use std::sync::Arc;

#[derive(Deserialize)]
pub struct AskRequest {
    query: String,
    paths: Vec<String>,
    filter: Option<MetadataFilter>,
}

#[derive(Deserialize)]
pub struct ProcessRequest {
    paths: Vec<String>,
}

pub async fn process_documents(
    State(job_service): State<Arc<JobService>>,
    Json(payload): Json<ProcessRequest>,
) -> Result<Json<String>, (StatusCode, String)> {
    match job_service.start_document_processing_job(payload.paths).await {
        Ok(job_id) => Ok(Json(job_id)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

pub async fn get_job_status(
    State(job_service): State<Arc<JobService>>,
    Path(job_id): Path<String>,
) -> Result<Json<Job>, (StatusCode, String)> {
    match job_service.get_job_status(&job_id).await {
        Ok(Some(job)) => Ok(Json(job)),
        Ok(None) => Err((StatusCode::NOT_FOUND, "Job not found".to_string())),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

#[derive(Deserialize)]
pub struct UploadRequest {
    path: String,
}

pub async fn upload_document(
    State(document_service): State<Arc<DocumentService>>,
    Json(payload): Json<UploadRequest>,
) -> Result<Json<Vec<Document>>, (StatusCode, String)> {
    match document_service.add_document(&payload.path).await {
        Ok(docs) => Ok(Json(docs)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

pub async fn list_documents(
    State(document_service): State<Arc<DocumentService>>,
) -> Result<Json<Vec<Document>>, (StatusCode, String)> {
    match document_service.list_documents().await {
        Ok(docs) => Ok(Json(docs)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

pub async fn get_document(
    State(document_service): State<Arc<DocumentService>>,
    Path(id): Path<String>,
) -> Result<Json<Document>, (StatusCode, String)> {
    match document_service.get_document(&id).await {
        Ok(Some(doc)) => Ok(Json(doc)),
        Ok(None) => Err((StatusCode::NOT_FOUND, "Document not found".to_string())),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

pub async fn delete_document(
    State(document_service): State<Arc<DocumentService>>,
    Path(id): Path<String>,
) -> Result<StatusCode, (StatusCode, String)> {
    match document_service.delete_document(&id).await {
        Ok(_) => Ok(StatusCode::NO_CONTENT),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

#[derive(Deserialize)]
pub struct EvaluateRequest {
    id: String,
    ground_truth: Vec<String>,
    retrieved_chunks: Vec<String>,
}

pub async fn evaluate(
    State(evaluation_service): State<Arc<EvaluationService>>,
    Json(payload): Json<EvaluateRequest>,
) -> Result<Json<Metrics>, (StatusCode, String)> {
    match evaluation_service.evaluate(&payload.id, &payload.ground_truth, &payload.retrieved_chunks).await {
        Ok(metrics) => Ok(Json(metrics)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

pub async fn get_metrics(
    State(evaluation_service): State<Arc<EvaluationService>>,
    Path(id): Path<String>,
) -> Result<Json<Metrics>, (StatusCode, String)> {
    match evaluation_service.get_metrics(&id).await {
        Ok(Some(metrics)) => Ok(Json(metrics)),
        Ok(None) => Err((StatusCode::NOT_FOUND, "Metrics not found".to_string())),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

#[derive(Deserialize)]
pub struct BuildGraphRequest {
    id: String,
    documents: Vec<Document>,
}

pub async fn build_graph(
    State(graph_service): State<Arc<GraphService>>,
    Json(payload): Json<BuildGraphRequest>,
) -> Result<Json<KnowledgeGraph>, (StatusCode, String)> {
    match graph_service.build_graph_from_documents(&payload.id, &payload.documents).await {
        Ok(graph) => Ok(Json(graph)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

pub async fn get_graph(
    State(graph_service): State<Arc<GraphService>>,
    Path(id): Path<String>,
) -> Result<Json<KnowledgeGraph>, (StatusCode, String)> {
    match graph_service.get_graph(&id).await {
        Ok(Some(graph)) => Ok(Json(graph)),
        Ok(None) => Err((StatusCode::NOT_FOUND, "Graph not found".to_string())),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

#[derive(Deserialize)]
pub struct CreateDatasetRequest {
    name: String,
}

#[derive(Deserialize)]
pub struct StartFineTuningRequest {
    dataset_id: String,
}

pub async fn create_dataset(
    State(fine_tuning_service): State<Arc<FineTuningService>>,
    Json(payload): Json<CreateDatasetRequest>,
) -> Result<Json<Dataset>, (StatusCode, String)> {
    match fine_tuning_service.create_dataset(&payload.name).await {
        Ok(dataset) => Ok(Json(dataset)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

pub async fn start_fine_tuning_job(
    State(fine_tuning_service): State<Arc<FineTuningService>>,
    Json(payload): Json<StartFineTuningRequest>,
) -> Result<Json<FineTuningJob>, (StatusCode, String)> {
    match fine_tuning_service.start_fine_tuning_job(&payload.dataset_id).await {
        Ok(job) => Ok(Json(job)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

pub async fn get_fine_tuning_job_status(
    State(fine_tuning_service): State<Arc<FineTuningService>>,
    Path(id): Path<String>,
) -> Result<Json<FineTuningJob>, (StatusCode, String)> {
    match fine_tuning_service.get_job_status(&id).await {
        Ok(Some(job)) => Ok(Json(job)),
        Ok(None) => Err((StatusCode::NOT_FOUND, "Job not found".to_string())),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

#[derive(Deserialize)]
pub struct BatchAskRequest {
    queries: Vec<String>,
    paths: Vec<String>,
    filter: Option<MetadataFilter>,
}

pub async fn batch_ask(
    State(qna_service): State<Arc<QnAService>>,
    Json(payload): Json<BatchAskRequest>,
) -> Result<Json<Vec<RagResponse>>, (StatusCode, String)> {
    let paths: Vec<&str> = payload.paths.iter().map(|s| s.as_str()).collect();
    match qna_service.batch_ask(&payload.queries, &paths, payload.filter.as_ref()).await {
        Ok(responses) => Ok(Json(responses)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

pub async fn ask(
    State(qna_service): State<Arc<QnAService>>,
    Json(payload): Json<AskRequest>,
) -> Result<Json<RagResponse>, (StatusCode, String)> {
    let paths: Vec<&str> = payload.paths.iter().map(|s| s.as_str()).collect();
    match qna_service.ask(&payload.query, &paths, payload.filter.as_ref()).await {
        Ok(response) => Ok(Json(response)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}
