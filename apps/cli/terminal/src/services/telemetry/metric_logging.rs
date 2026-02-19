use crate::error::AppResult;
use crate::types::TelemetryMetric;
use tauri::{AppHandle, Runtime};

pub async fn log_metric<R: Runtime>(
    service: &super::TelemetryService,
    app_handle: AppHandle<R>,
    name: String,
    value: f64,
    unit: Option<String>,
) -> AppResult<()> {
    if !service.is_enabled().await {
        return Ok(());
    }

    let mut metric = TelemetryMetric::new(name, value);
    if let Some(u) = unit {
        metric = metric.with_unit(u);
    }

    service.add_metric(metric).await;

    Ok(())
}

pub async fn log_performance_metric<R: Runtime>(
    service: &super::TelemetryService,
    app_handle: AppHandle<R>,
    name: String,
    value: f64,
) -> AppResult<()> {
    if !service.is_enabled().await {
        return Ok(());
    }

    let config = service.state.read().await;
    if !config.config.performance_tracking {
        return Ok(());
    }
    drop(config);

    log_metric(service, app_handle, name, value, Some("ms".to_string())).await
}
