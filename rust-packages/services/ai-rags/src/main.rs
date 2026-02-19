//! Main entry point for the RAG application
//!
//! This is the Composition Root that sets up all dependencies and starts the application.

use rags::api::run_api_server;
use rags::cli::run_cli;
use rags::telemetry;
use std::env;

#[tokio::main]
async fn main() {
    telemetry::init_subscriber();

    let args: Vec<String> = env::args().collect();
    if args.len() > 1 && args[1] == "cli" {
        tracing::info!("Starting RAG CLI");
        run_cli().await;
    } else {
        tracing::info!("Starting RAG API server");
        run_api_server().await;
    }
}
