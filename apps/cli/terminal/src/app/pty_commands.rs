use crate::error::AppResult;
use crate::services::pty_service::PtyService;
use crate::types::config::PtyConfig;
use tauri::{AppHandle, Runtime, State};

#[tauri::command]
pub async fn create_pty_session<R: Runtime>(
    app_handle: AppHandle<R>,
    pty_service: State<'_, PtyService>,
    tab_id: String,
    config: Option<PtyConfig>,
) -> AppResult<()> {
    let pty_config = config.unwrap_or_default();
    pty_service
        .create_pty_session(app_handle, tab_id, pty_config)
        .await
}

#[tauri::command]
pub async fn write_to_pty(
    pty_service: State<'_, PtyService>,
    tab_id: String,
    data: String,
) -> AppResult<()> {
    pty_service.write_to_pty(tab_id, data).await
}

#[tauri::command]
pub async fn resize_pty(
    pty_service: State<'_, PtyService>,
    tab_id: String,
    rows: u16,
    cols: u16,
) -> AppResult<()> {
    pty_service.resize_pty(tab_id, rows, cols).await
}

#[tauri::command]
pub fn close_pty_session(pty_service: State<'_, PtyService>, tab_id: String) -> AppResult<()> {
    pty_service.close_pty_session(tab_id)
}
