use crate::error::AppResult;
use crate::services::TelemetryService;
use crate::types::{
    ErrorReport, PerformanceMetrics, TelemetryConfig, TelemetryEventLevel, TelemetryEventType,
};
use tauri::{AppHandle, Runtime, State};

#[tauri::command]
pub async fn log_telemetry_event<R: Runtime>(
    app_handle: AppHandle<R>,
    telemetry_service: State<'_, TelemetryService>,
    event_type: TelemetryEventType,
    message: String,
) -> AppResult<()> {
    telemetry_service
        .log_event(app_handle, event_type, message)
        .await
}

#[tauri::command]
pub async fn log_telemetry_event_with_level<R: Runtime>(
    app_handle: AppHandle<R>,
    telemetry_service: State<'_, TelemetryService>,
    event_type: TelemetryEventType,
    message: String,
    level: TelemetryEventLevel,
) -> AppResult<()> {
    telemetry_service
        .log_event_with_level(app_handle, event_type, message, level)
        .await
}

#[tauri::command]
pub async fn log_telemetry_error<R: Runtime>(
    app_handle: AppHandle<R>,
    telemetry_service: State<'_, TelemetryService>,
    error_type: String,
    message: String,
    stack_trace: Option<String>,
) -> AppResult<()> {
    telemetry_service
        .log_error(app_handle, error_type, message, stack_trace)
        .await
}

#[tauri::command]
pub async fn log_telemetry_warning<R: Runtime>(
    app_handle: AppHandle<R>,
    telemetry_service: State<'_, TelemetryService>,
    message: String,
) -> AppResult<()> {
    telemetry_service.log_warning(app_handle, message).await
}

#[tauri::command]
pub async fn log_telemetry_info<R: Runtime>(
    app_handle: AppHandle<R>,
    telemetry_service: State<'_, TelemetryService>,
    message: String,
) -> AppResult<()> {
    telemetry_service.log_info(app_handle, message).await
}

#[tauri::command]
pub async fn log_telemetry_metric<R: Runtime>(
    app_handle: AppHandle<R>,
    telemetry_service: State<'_, TelemetryService>,
    name: String,
    value: f64,
    unit: Option<String>,
) -> AppResult<()> {
    telemetry_service
        .log_metric(app_handle, name, value, unit)
        .await
}

#[tauri::command]
pub async fn log_telemetry_performance_metric<R: Runtime>(
    app_handle: AppHandle<R>,
    telemetry_service: State<'_, TelemetryService>,
    name: String,
    value: f64,
) -> AppResult<()> {
    telemetry_service
        .log_performance_metric(app_handle, name, value)
        .await
}

#[tauri::command]
pub async fn update_telemetry_performance_metrics<R: Runtime>(
    telemetry_service: State<'_, TelemetryService>,
    metrics: PerformanceMetrics,
) -> AppResult<()> {
    telemetry_service.update_performance_metrics(metrics).await;
    Ok(())
}

#[tauri::command]
pub async fn get_telemetry_performance_metrics<R: Runtime>(
    telemetry_service: State<'_, TelemetryService>,
) -> AppResult<PerformanceMetrics> {
    Ok(telemetry_service.get_performance_metrics().await)
}

#[tauri::command]
pub async fn record_telemetry_startup_time<R: Runtime>(
    telemetry_service: State<'_, TelemetryService>,
    time_ms: u64,
) -> AppResult<()> {
    telemetry_service.record_startup_time(time_ms).await;
    Ok(())
}

#[tauri::command]
pub async fn record_telemetry_render_time<R: Runtime>(
    telemetry_service: State<'_, TelemetryService>,
    time_ms: u64,
) -> AppResult<()> {
    telemetry_service.record_render_time(time_ms).await;
    Ok(())
}

#[tauri::command]
pub async fn record_telemetry_pty_response_time<R: Runtime>(
    telemetry_service: State<'_, TelemetryService>,
    time_ms: u64,
) -> AppResult<()> {
    telemetry_service.record_pty_response_time(time_ms).await;
    Ok(())
}

#[tauri::command]
pub async fn record_telemetry_memory_usage<R: Runtime>(
    telemetry_service: State<'_, TelemetryService>,
    memory_mb: f64,
) -> AppResult<()> {
    telemetry_service.record_memory_usage(memory_mb).await;
    Ok(())
}

#[tauri::command]
pub async fn record_telemetry_cpu_usage<R: Runtime>(
    telemetry_service: State<'_, TelemetryService>,
    cpu_percent: f64,
) -> AppResult<()> {
    telemetry_service.record_cpu_usage(cpu_percent).await;
    Ok(())
}

#[tauri::command]
pub async fn record_telemetry_fps<R: Runtime>(
    telemetry_service: State<'_, TelemetryService>,
    fps: f64,
) -> AppResult<()> {
    telemetry_service.record_fps(fps).await;
    Ok(())
}

#[tauri::command]
pub async fn create_telemetry_error_report<R: Runtime>(
    telemetry_service: State<'_, TelemetryService>,
    error_type: String,
    message: String,
    stack_trace: Option<String>,
) -> AppResult<ErrorReport> {
    Ok(telemetry_service
        .create_error_report(error_type, message, stack_trace)
        .await)
}

#[tauri::command]
pub async fn submit_telemetry_error_report<R: Runtime>(
    app_handle: AppHandle<R>,
    telemetry_service: State<'_, TelemetryService>,
    report: ErrorReport,
) -> AppResult<()> {
    telemetry_service
        .submit_error_report(app_handle, report)
        .await
}

#[tauri::command]
pub async fn get_telemetry_events<R: Runtime>(
    telemetry_service: State<'_, TelemetryService>,
    session_id: Option<String>,
) -> AppResult<Vec<crate::types::TelemetryEvent>> {
    Ok(telemetry_service.get_events(session_id.as_deref()).await)
}

#[tauri::command]
pub async fn get_telemetry_events_by_type<R: Runtime>(
    telemetry_service: State<'_, TelemetryService>,
    event_type: TelemetryEventType,
) -> AppResult<Vec<crate::types::TelemetryEvent>> {
    Ok(telemetry_service.get_events_by_type(&event_type).await)
}

#[tauri::command]
pub async fn get_telemetry_errors<R: Runtime>(
    telemetry_service: State<'_, TelemetryService>,
) -> AppResult<Vec<crate::types::TelemetryEvent>> {
    Ok(telemetry_service.get_errors().await)
}

#[tauri::command]
pub async fn get_telemetry_warnings<R: Runtime>(
    telemetry_service: State<'_, TelemetryService>,
) -> AppResult<Vec<crate::types::TelemetryEvent>> {
    Ok(telemetry_service.get_warnings().await)
}

#[tauri::command]
pub async fn get_telemetry_metrics<R: Runtime>(
    telemetry_service: State<'_, TelemetryService>,
) -> AppResult<Vec<crate::types::TelemetryMetric>> {
    Ok(telemetry_service.get_metrics().await)
}

#[tauri::command]
pub async fn clear_telemetry_events<R: Runtime>(
    telemetry_service: State<'_, TelemetryService>,
) -> AppResult<()> {
    telemetry_service.clear_events().await;
    Ok(())
}

#[tauri::command]
pub async fn clear_telemetry_metrics<R: Runtime>(
    telemetry_service: State<'_, TelemetryService>,
) -> AppResult<()> {
    telemetry_service.clear_metrics().await;
    Ok(())
}

#[tauri::command]
pub async fn export_telemetry_events<R: Runtime>(
    telemetry_service: State<'_, TelemetryService>,
) -> AppResult<String> {
    telemetry_service.export_events().await
}

#[tauri::command]
pub async fn export_telemetry_metrics<R: Runtime>(
    telemetry_service: State<'_, TelemetryService>,
) -> AppResult<String> {
    telemetry_service.export_metrics().await
}

#[tauri::command]
pub async fn get_telemetry_config<R: Runtime>(
    telemetry_service: State<'_, TelemetryService>,
) -> AppResult<TelemetryConfig> {
    Ok(telemetry_service.get_config().await)
}

#[tauri::command]
pub async fn update_telemetry_config<R: Runtime>(
    telemetry_service: State<'_, TelemetryService>,
    config: TelemetryConfig,
) -> AppResult<()> {
    telemetry_service.update_config(config).await;
    Ok(())
}

#[tauri::command]
pub async fn is_telemetry_enabled<R: Runtime>(
    telemetry_service: State<'_, TelemetryService>,
) -> AppResult<bool> {
    Ok(telemetry_service.is_enabled().await)
}

#[tauri::command]
pub async fn set_telemetry_enabled<R: Runtime>(
    telemetry_service: State<'_, TelemetryService>,
    enabled: bool,
) -> AppResult<()> {
    telemetry_service.set_enabled(enabled).await;
    Ok(())
}
