//! Application Layer
//!
//! This module orchestrates business flows and coordinates between services.
//! It serves as the main application logic layer.

use crate::error::Result;
use tauri::Builder;

use crate::config::ConfigManager;
use crate::services::{
    clipboard_service, config_service, hotkey_service, pane_service, profile_service, pty_service,
    remote_multiplexer, search_service, session_service, shell_integration_service, tab_service,
    telemetry_service, theme_service,
};
use crate::telemetry;

pub struct App {
    config_manager: ConfigManager,
}

impl App {
    pub fn new() -> Result<Self> {
        let config_manager = ConfigManager::new()?;
        Ok(Self { config_manager })
    }

    pub fn build_tauri(self) -> Result<tauri::App> {
        let config = self.config_manager.config.clone();

        let app = Builder::default()
            .manage(pty_service::PtyService::new())
            .manage(config_service::ConfigService::new(config))
            .manage(tab_service::TabService::new())
            .manage(pane_service::PaneService::new())
            .manage(theme_service::ThemeService::new())
            .manage(profile_service::ProfileService::new())
            .manage(search_service::SearchService::new())
            .manage(clipboard_service::ClipboardService::new())
            .manage(hotkey_service::HotkeyService::new())
            .manage(session_service::SessionService::new())
            .manage(shell_integration_service::ShellIntegrationService::new())
            .manage(telemetry_service::TelemetryService::new())
            .manage(remote_multiplexer::RemoteMultiplexer::default())
            .invoke_handler(crate::app::invocation::handlers());

        Ok(app.build(tauri::generate_context!())?)
    }

    pub fn run(self) -> Result<()> {
        self.build_tauri()?.run(|_app_handle, _event| {});
        Ok(())
    }
}

pub mod clipboard_commands;
pub mod config_commands;
pub mod hotkey_commands;
pub mod invocation;
pub mod new_features_commands;
pub mod pane_commands;
pub mod profile_commands;
pub mod pty_commands;
pub mod search_commands;
pub mod session_commands;
pub mod tab_commands;
pub mod telemetry_commands;
pub mod theme_commands;
