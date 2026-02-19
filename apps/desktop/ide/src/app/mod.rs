use crate::error::AppResult;

// Modules created from refactoring ui.rs
#[allow(clippy::module_inception)]
mod app;
mod input;
mod lifecycle;
mod palette;
mod rendering;
mod styling;
mod runtime;

// Existing modules
mod actions;
pub(crate) mod background_jobs;
pub mod service_helpers;
mod panels;
mod persistence;
pub(crate) mod state;
pub mod ui;


pub fn run() -> AppResult<()> {
    desktop_components::run_with("ide", |cc| Ok(app::IdeApp::new(cc)))
        .map_err(|e| crate::error::AppError::InvalidInput(e.to_string()))?;
    Ok(())
}
