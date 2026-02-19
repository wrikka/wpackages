use tauri::{command, AppHandle, Manager, Runtime, State};
use terminal::services::pty_service::{self, PtyManager};
use terminal::types::config::PtyConfig;

#[command]
pub async fn pty_init<R: Runtime>(
    app: AppHandle<R>,
    tab_id: String,
    pty_manager: State<'_, PtyManager>,
) -> Result<(), String> {
    // A default config for now, this could be made configurable later
    let config = PtyConfig {
        rows: 24,
        cols: 80,
        shell: None, // Use default shell
        shell_args: None,
    };

    pty_service::init_pty(app, tab_id, config, &pty_manager)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn pty_write(
    tab_id: String,
    data: String,
    pty_manager: State<'_, PtyManager>,
) -> Result<(), String> {
    pty_service::write_to_pty(tab_id, data, &pty_manager)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn pty_resize(
    tab_id: String,
    rows: u16,
    cols: u16,
    pty_manager: State<'_, PtyManager>,
) -> Result<(), String> {
    pty_service::resize_pty(tab_id, rows, cols, &pty_manager)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn pty_close(tab_id: String, pty_manager: State<'_, PtyManager>) -> Result<(), String> {
    pty_service::close_pty(tab_id, &pty_manager)
        .await
        .map_err(|e| e.to_string())
}
