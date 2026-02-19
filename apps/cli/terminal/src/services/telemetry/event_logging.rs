use crate::error::AppResult;
use crate::types::{TelemetryEvent, TelemetryEventLevel, TelemetryEventType};
use tauri::{AppHandle, Runtime};

pub async fn log_event<R: Runtime>(
    service: &super::TelemetryService,
    app_handle: AppHandle<R>,
    event_type: TelemetryEventType,
    message: String,
) -> AppResult<()> {
    if !service.is_enabled().await {
        return Ok(());
    }

    let event = TelemetryEvent::new(event_type, message);
    service.add_event(event).await;

    Ok(())
}

pub async fn log_event_with_level<R: Runtime>(
    service: &super::TelemetryService,
    app_handle: AppHandle<R>,
    event_type: TelemetryEventType,
    message: String,
    level: TelemetryEventLevel,
) -> AppResult<()> {
    if !service.is_enabled().await {
        return Ok(());
    }

    let event = TelemetryEvent::new(event_type, message).with_level(level);
    service.add_event(event).await;

    Ok(())
}

pub async fn log_event_with_data<R: Runtime>(
    service: &super::TelemetryService,
    app_handle: AppHandle<R>,
    event_type: TelemetryEventType,
    message: String,
    data: std::collections::HashMap<String, serde_json::Value>,
) -> AppResult<()> {
    if !service.is_enabled().await {
        return Ok(());
    }

    let mut event = TelemetryEvent::new(event_type, message);
    for (key, value) in data {
        event = event.with_data(key, value);
    }
    service.add_event(event).await;

    Ok(())
}

pub async fn log_error<R: Runtime>(
    service: &super::TelemetryService,
    app_handle: AppHandle<R>,
    error_type: String,
    message: String,
    stack_trace: Option<String>,
) -> AppResult<()> {
    if !service.is_enabled().await {
        return Ok(());
    }

    let mut event = TelemetryEvent::new(TelemetryEventType::Error, message)
        .with_level(TelemetryEventLevel::Error);

    event = event.with_data(
        "error_type".to_string(),
        serde_json::Value::String(error_type.clone()),
    );

    if let Some(trace) = stack_trace {
        event = event.with_data("stack_trace".to_string(), serde_json::Value::String(trace));
    }

    service.add_event(event).await;

    Ok(())
}

pub async fn log_warning<R: Runtime>(
    service: &super::TelemetryService,
    app_handle: AppHandle<R>,
    message: String,
) -> AppResult<()> {
    log_event_with_level(
        service,
        app_handle,
        TelemetryEventType::Warning,
        message,
        TelemetryEventLevel::Warn,
    )
    .await
}

pub async fn log_info<R: Runtime>(
    service: &super::TelemetryService,
    app_handle: AppHandle<R>,
    message: String,
) -> AppResult<()> {
    log_event_with_level(
        service,
        app_handle,
        TelemetryEventType::Info,
        message,
        TelemetryEventLevel::Info,
    )
    .await
}
