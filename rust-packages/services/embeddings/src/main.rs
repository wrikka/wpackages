use embeddings::{AppState,
    create_router,
    grpc::server::run_grpc_server,
    init_subscriber,
    middleware::rate_limiter::get_rate_limiter,
    ui::{routes::create_ui_router, visualization::create_visualization_router},
    EmbeddingsApp,
    EmbeddingsConfig,
};
use std::sync::Arc;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;

async fn run() -> anyhow::Result<()> {
    init_subscriber();
    tracing::info!("Starting Embeddings Server v{}", env!("CARGO_PKG_VERSION"));

    let config = EmbeddingsConfig::load()?;
    config.validate()?;

    let app = Arc::new(EmbeddingsApp::new(config.clone()).await?);
    let state = AppState { app: app.clone() };

    let mut router = create_router(state)
        .merge(create_ui_router())
        .merge(create_visualization_router())
        .layer(TraceLayer::new_for_http())
        .layer(CorsLayer::permissive());

    if let Some(limit) = config.rate_limit {
        router = router.layer(get_rate_limiter(limit).clone());
    }

    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".to_string()).parse::<u16>()?;
    let addr = format!("0.0.0.0:{}", port);
    tracing::info!("HTTP server listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    let http_server = axum::serve(listener, router);

    let grpc_addr = "[::1]:50051".to_string();
    let grpc_server = run_grpc_server(state.app.service.clone(), &grpc_addr);

    tokio::select! {
        http_res = http_server => http_res?,
        grpc_res = grpc_server => grpc_res.map_err(|e| anyhow::anyhow!(e))?,
    }

    Ok(())
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    run().await
}
