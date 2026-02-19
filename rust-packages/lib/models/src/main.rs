//! AI Models Application Entry Point (Composition Root)
//!
//! This is the composition root that wires up all dependencies and starts the application.

use ai_models::{init_subscriber, AiModelsApp, Result};
use tracing::{error, info};

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize telemetry (logging/tracing)
    init_subscriber();

    info!("Starting AI Models Library v{}", ai_models::VERSION);

    // Create the application with default providers
    let app = AiModelsApp::with_defaults().await?;

    info!("Application initialized successfully");
    info!(
        "Registered chat providers: {:?}",
        app.registry().read().await.list_chat_providers().await
    );

    // Run the application
    if let Err(e) = run_app(&app).await {
        error!("Application error: {}", e);
        return Err(e);
    }

    Ok(())
}

/// Main application logic
#[tracing::instrument(skip(app))]
async fn run_app(app: &AiModelsApp) -> Result<()> {
    info!("Application running");

    // Example: List available models
    match app.list_models().await {
        Ok(models) => {
            info!("Available models: {}", models.len());
            for model in models.iter().take(5) {
                info!("  - {} ({})", model.display_name, model.provider.as_str());
            }
        }
        Err(e) => {
            tracing::warn!("Failed to list models: {}", e);
        }
    }

    // Note: Add application logic here would require:
    // - Implementing model inference and generation
    // - Handling API requests and responses
    // - Managing model lifecycle and resources
    // For now, this is a placeholder that would be replaced with actual application logic

    Ok(())
}
