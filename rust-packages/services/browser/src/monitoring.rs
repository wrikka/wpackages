use axum::{
    routing::get,
    Router,
};
use metrics_exporter_prometheus::{PrometheusBuilder, PrometheusHandle};
use std::net::SocketAddr;
use tracing::{error, info};

pub fn setup_metrics_recorder() -> Result<PrometheusHandle, String> {
    PrometheusBuilder::new()
        .install_recorder()
        .map_err(|e| format!("Failed to install recorder: {}", e))
}

pub async fn start_metrics_server(addr: SocketAddr, handle: PrometheusHandle) {
    let app = Router::new().route("/metrics", get(move || std::future::ready(handle.render())));

    info!("Metrics server listening on {}", addr);
    let listener = match tokio::net::TcpListener::bind(addr).await {
        Ok(l) => l,
        Err(e) => {
            error!(error = %e, "Failed to bind metrics server on {}", addr);
            return;
        }
    };

    if let Err(e) = axum::serve(listener, app).await {
        error!(error = %e, "Metrics server failed");
    }
}
