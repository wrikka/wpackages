use crate::error::AppResult;
use crate::types::ErrorReport;
use tauri::{AppHandle, Runtime};

pub async fn create_error_report(
    service: &super::TelemetryService,
    error_type: String,
    message: String,
    stack_trace: Option<String>,
) -> ErrorReport {
    ErrorReport::new(error_type, message).with_stack_trace(stack_trace.unwrap_or_default())
}

pub async fn submit_error_report<R: Runtime>(
    service: &super::TelemetryService,
    app_handle: AppHandle<R>,
    report: ErrorReport,
) -> AppResult<()> {
    let config = service.state.read().await;
    if !config.config.error_reporting {
        return Ok(());
    }

    if let Some(endpoint) = &config.config.error_reporting_endpoint {
        tracing::info!("Submitting error report to: {}", endpoint);
    }

    Ok(())
}
