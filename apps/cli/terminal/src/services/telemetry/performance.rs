use crate::types::PerformanceMetrics;

pub async fn update_performance_metrics(
    service: &super::TelemetryService,
    metrics: PerformanceMetrics,
) {
    let mut state = service.state.write().await;
    state.performance_metrics = metrics;
}

pub async fn get_performance_metrics(service: &super::TelemetryService) -> PerformanceMetrics {
    service.state.read().await.performance_metrics.clone()
}

pub async fn record_startup_time(service: &super::TelemetryService, time_ms: u64) {
    let mut state = service.state.write().await;
    state.performance_metrics.startup_time_ms = Some(time_ms);
}

pub async fn record_render_time(service: &super::TelemetryService, time_ms: u64) {
    let mut state = service.state.write().await;
    state.performance_metrics.render_time_ms = Some(time_ms);
}

pub async fn record_pty_response_time(service: &super::TelemetryService, time_ms: u64) {
    let mut state = service.state.write().await;
    state.performance_metrics.pty_response_time_ms = Some(time_ms);
}

pub async fn record_memory_usage(service: &super::TelemetryService, memory_mb: f64) {
    let mut state = service.state.write().await;
    state.performance_metrics.memory_usage_mb = Some(memory_mb);
}

pub async fn record_cpu_usage(service: &super::TelemetryService, cpu_percent: f64) {
    let mut state = service.state.write().await;
    state.performance_metrics.cpu_usage_percent = Some(cpu_percent);
}

pub async fn record_fps(service: &super::TelemetryService, fps: f64) {
    let mut state = service.state.write().await;
    state.performance_metrics.fps = Some(fps);
}
