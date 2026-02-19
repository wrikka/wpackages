use crate::application::services::{document_service::DocumentService, evaluation_service::EvaluationService, finetuning_service::FineTuningService, graph_service::GraphService, plugin_service::PluginService,
    job_service::JobService, qna_service::QnAService,
};
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub qna_service: Arc<QnAService>,
    pub job_service: Arc<JobService>,
        pub document_service: Arc<DocumentService>,
        pub evaluation_service: Arc<EvaluationService>,
        pub graph_service: Arc<GraphService>,
        pub fine_tuning_service: Arc<FineTuningService>,
    pub plugin_service: Arc<PluginService>,
}

impl FromRef<AppState> for Arc<QnAService> {
    fn from_ref(app_state: &AppState) -> Arc<QnAService> {
        app_state.qna_service.clone()
    }
}

impl FromRef<AppState> for Arc<JobService> {
    fn from_ref(app_state: &AppState) -> Arc<JobService> {
        app_state.job_service.clone()
    }
}

impl FromRef<AppState> for Arc<DocumentService> {
    fn from_ref(app_state: &AppState) -> Arc<DocumentService> {
        app_state.document_service.clone()
    }
}

impl FromRef<AppState> for Arc<EvaluationService> {
    fn from_ref(app_state: &AppState) -> Arc<EvaluationService> {
        app_state.evaluation_service.clone()
    }
}

impl FromRef<AppState> for Arc<GraphService> {
    fn from_ref(app_state: &AppState) -> Arc<GraphService> {
        app_state.graph_service.clone()
    }
}

impl FromRef<AppState> for Arc<FineTuningService> {
    fn from_ref(app_state: &AppState) -> Arc<FineTuningService> {
        app_state.fine_tuning_service.clone()
    }
}

impl FromRef<AppState> for Arc<PluginService> {
    fn from_ref(app_state: &AppState) -> Arc<PluginService> {
        app_state.plugin_service.clone()
    }
}
