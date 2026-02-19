use crate::error::{AppError, AppResult};
use crate::types::{TelemetryConfig, TelemetryEvent, TelemetryMetric, TelemetryState};
use dashmap::DashMap;
use serde::Serialize;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Runtime};
use tokio::sync::RwLock;

pub mod telemetry;

#[derive(Clone, Serialize)]
pub struct TelemetryEventPayload {
    pub event: TelemetryEvent,
}

#[derive(Clone)]
pub struct TelemetryService {
    pub(crate) state: Arc<RwLock<TelemetryState>>,
    pub(crate) events: Arc<DashMap<String, Vec<TelemetryEvent>>>,
    pub(crate) metrics: Arc<DashMap<String, Vec<TelemetryMetric>>>,
}

impl Default for TelemetryService {
    fn default() -> Self {
        Self::new()
    }
}

impl TelemetryService {
    pub fn new() -> Self {
        Self {
            state: Arc::new(RwLock::new(TelemetryState::default())),
            events: Arc::new(DashMap::new()),
            metrics: Arc::new(DashMap::new()),
        }
    }

    pub async fn with_config(config: TelemetryConfig) -> Self {
        Self {
            state: Arc::new(RwLock::new(TelemetryState::new(config))),
            events: Arc::new(DashMap::new()),
            metrics: Arc::new(DashMap::new()),
        }
    }

    pub async fn is_enabled(&self) -> bool {
        self.state.read().await.config.enabled
    }

    pub async fn set_enabled(&self, enabled: bool) {
        self.state.write().await.config.enabled = enabled;
    }

    pub async fn get_config(&self) -> TelemetryConfig {
        self.state.read().await.config.clone()
    }

    pub async fn update_config(&self, config: TelemetryConfig) {
        self.state.write().await.config = config;
    }

    pub async fn log_event<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        event_type: crate::types::TelemetryEventType,
        message: String,
    ) -> AppResult<()> {
        telemetry::log_event(self, app_handle, event_type, message).await
    }

    pub async fn log_event_with_level<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        event_type: crate::types::TelemetryEventType,
        message: String,
        level: crate::types::TelemetryEventLevel,
    ) -> AppResult<()> {
        telemetry::log_event_with_level(self, app_handle, event_type, message, level).await
    }

    pub async fn log_event_with_data<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        event_type: crate::types::TelemetryEventType,
        message: String,
        data: std::collections::HashMap<String, serde_json::Value>,
    ) -> AppResult<()> {
        telemetry::log_event_with_data(self, app_handle, event_type, message, data).await
    }

    pub async fn log_error<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        error_type: String,
        message: String,
        stack_trace: Option<String>,
    ) -> AppResult<()> {
        telemetry::log_error(self, app_handle, error_type, message, stack_trace).await
    }

    pub async fn log_warning<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        message: String,
    ) -> AppResult<()> {
        telemetry::log_warning(self, app_handle, message).await
    }

    pub async fn log_info<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        message: String,
    ) -> AppResult<()> {
        telemetry::log_info(self, app_handle, message).await
    }

    pub async fn log_metric<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        name: String,
        value: f64,
        unit: Option<String>,
    ) -> AppResult<()> {
        telemetry::log_metric(self, app_handle, name, value, unit).await
    }

    pub async fn log_performance_metric<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        name: String,
        value: f64,
    ) -> AppResult<()> {
        telemetry::log_performance_metric(self, app_handle, name, value).await
    }

    pub async fn update_performance_metrics(&self, metrics: crate::types::PerformanceMetrics) {
        telemetry::update_performance_metrics(self, metrics).await
    }

    pub async fn get_performance_metrics(&self) -> crate::types::PerformanceMetrics {
        telemetry::get_performance_metrics(self).await
    }

    pub async fn record_startup_time(&self, time_ms: u64) {
        telemetry::record_startup_time(self, time_ms).await
    }

    pub async fn record_render_time(&self, time_ms: u64) {
        telemetry::record_render_time(self, time_ms).await
    }

    pub async fn record_pty_response_time(&self, time_ms: u64) {
        telemetry::record_pty_response_time(self, time_ms).await
    }

    pub async fn record_memory_usage(&self, memory_mb: f64) {
        telemetry::record_memory_usage(self, memory_mb).await
    }

    pub async fn record_cpu_usage(&self, cpu_percent: f64) {
        telemetry::record_cpu_usage(self, cpu_percent).await
    }

    pub async fn record_fps(&self, fps: f64) {
        telemetry::record_fps(self, fps).await
    }

    pub async fn create_error_report(
        &self,
        error_type: String,
        message: String,
        stack_trace: Option<String>,
    ) -> crate::types::ErrorReport {
        telemetry::create_error_report(self, error_type, message, stack_trace).await
    }

    pub async fn submit_error_report<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        report: crate::types::ErrorReport,
    ) -> AppResult<()> {
        telemetry::submit_error_report(self, app_handle, report).await
    }

    pub async fn get_events(&self, session_id: Option<&str>) -> Vec<TelemetryEvent> {
        let state = self.state.read().await;
        if let Some(sid) = session_id {
            state
                .events
                .iter()
                .filter(|e| e.session_id.as_ref().map(|s| s.as_str()) == Some(sid))
                .cloned()
                .collect()
        } else {
            state.events.clone()
        }
    }

    pub async fn get_events_by_type(
        &self,
        event_type: &crate::types::TelemetryEventType,
    ) -> Vec<TelemetryEvent> {
        self.state.read().await.get_events_by_type(event_type)
    }

    pub async fn get_errors(&self) -> Vec<TelemetryEvent> {
        self.state.read().await.get_errors()
    }

    pub async fn get_warnings(&self) -> Vec<TelemetryEvent> {
        self.state.read().await.get_warnings()
    }

    pub async fn get_metrics(&self) -> Vec<TelemetryMetric> {
        self.state.read().await.metrics.clone()
    }

    pub async fn clear_events(&self) {
        self.state.write().await.clear_events();
    }

    pub async fn clear_metrics(&self) {
        self.state.write().await.clear_metrics();
    }

    pub async fn export_events(&self) -> AppResult<String> {
        let events = self.get_events(None).await;
        serde_json::to_string_pretty(&events)
            .map_err(|e| AppError::Other(format!("Failed to export events: {}", e)))
    }

    pub async fn export_metrics(&self) -> AppResult<String> {
        let metrics = self.get_metrics().await;
        serde_json::to_string_pretty(&metrics)
            .map_err(|e| AppError::Other(format!("Failed to export metrics: {}", e)))
    }

    pub(crate) async fn add_event(&self, event: TelemetryEvent) {
        let mut state = self.state.write().await;
        state.add_event(event.clone());

        if let Some(session_id) = &event.session_id {
            self.events
                .entry(session_id.clone())
                .or_insert_with(Vec::new)
                .push(event);
        }
    }

    pub(crate) async fn add_metric(&self, metric: TelemetryMetric) {
        let mut state = self.state.write().await;
        state.add_metric(metric.clone());

        if let Some(session_id) = metric.tags.get("session_id") {
            self.metrics
                .entry(session_id.clone())
                .or_insert_with(Vec::new)
                .push(metric);
        }
    }

    pub async fn get_session_events(&self, session_id: &str) -> Vec<TelemetryEvent> {
        self.events
            .get(session_id)
            .map(|v| v.clone())
            .unwrap_or_default()
    }

    pub async fn get_session_metrics(&self, session_id: &str) -> Vec<TelemetryMetric> {
        self.metrics
            .get(session_id)
            .map(|v| v.clone())
            .unwrap_or_default()
    }

    pub async fn clear_session_data(&self, session_id: &str) {
        self.events.remove(session_id);
        self.metrics.remove(session_id);
    }
}
