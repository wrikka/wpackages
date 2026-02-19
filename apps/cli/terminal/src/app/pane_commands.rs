use crate::error::AppResult;
use crate::services::PaneService;
use crate::types::{PaneConfig, PaneId, SplitDirection};
use tauri::{AppHandle, Runtime, State};

#[tauri::command]
pub async fn create_pane<R: Runtime>(
    app_handle: AppHandle<R>,
    pane_service: State<'_, PaneService>,
    config: Option<PaneConfig>,
    tab_id: Option<String>,
) -> AppResult<PaneId> {
    let pane_config = config.unwrap_or_default();
    let tab = tab_id.map(|id| crate::types::TabId::from_string(id));
    pane_service.create_pane(app_handle, pane_config, tab).await
}

#[tauri::command]
pub async fn close_pane<R: Runtime>(
    app_handle: AppHandle<R>,
    pane_service: State<'_, PaneService>,
    pane_id: String,
) -> AppResult<()> {
    pane_service
        .close_pane(app_handle, PaneId::from_string(pane_id))
        .await
}

#[tauri::command]
pub async fn split_pane_horizontal<R: Runtime>(
    app_handle: AppHandle<R>,
    pane_service: State<'_, PaneService>,
    pane_id: String,
    ratio: Option<f32>,
) -> AppResult<PaneId> {
    pane_service
        .split_pane(
            app_handle,
            PaneId::from_string(pane_id),
            SplitDirection::Horizontal,
            ratio.unwrap_or(0.5),
        )
        .await
}

#[tauri::command]
pub async fn split_pane_vertical<R: Runtime>(
    app_handle: AppHandle<R>,
    pane_service: State<'_, PaneService>,
    pane_id: String,
    ratio: Option<f32>,
) -> AppResult<PaneId> {
    pane_service
        .split_pane(
            app_handle,
            PaneId::from_string(pane_id),
            SplitDirection::Vertical,
            ratio.unwrap_or(0.5),
        )
        .await
}

#[tauri::command]
pub async fn resize_pane<R: Runtime>(
    app_handle: AppHandle<R>,
    pane_service: State<'_, PaneService>,
    pane_id: String,
    ratio: f32,
) -> AppResult<()> {
    pane_service
        .resize_pane(app_handle, PaneId::from_string(pane_id), ratio)
        .await
}

#[tauri::command]
pub async fn focus_pane<R: Runtime>(
    app_handle: AppHandle<R>,
    pane_service: State<'_, PaneService>,
    pane_id: String,
) -> AppResult<()> {
    pane_service
        .focus_pane(app_handle, PaneId::from_string(pane_id))
        .await
}

#[tauri::command]
pub async fn get_pane<R: Runtime>(
    pane_service: State<'_, PaneService>,
    pane_id: String,
) -> AppResult<Option<crate::types::Pane>> {
    Ok(pane_service.get_pane(&PaneId::from_string(pane_id)).await)
}

#[tauri::command]
pub async fn get_all_panes<R: Runtime>(
    pane_service: State<'_, PaneService>,
) -> AppResult<Vec<crate::types::Pane>> {
    Ok(pane_service.get_all_panes().await)
}

#[tauri::command]
pub async fn get_pane_layout<R: Runtime>(
    pane_service: State<'_, PaneService>,
) -> AppResult<crate::types::PaneLayout> {
    Ok(pane_service.get_layout().await)
}

#[tauri::command]
pub async fn get_active_pane<R: Runtime>(
    pane_service: State<'_, PaneService>,
) -> AppResult<Option<crate::types::Pane>> {
    Ok(pane_service.get_active_pane().await)
}

#[tauri::command]
pub async fn get_root_pane<R: Runtime>(
    pane_service: State<'_, PaneService>,
) -> AppResult<Option<crate::types::Pane>> {
    Ok(pane_service.get_root_pane().await)
}

#[tauri::command]
pub async fn get_pane_children<R: Runtime>(
    pane_service: State<'_, PaneService>,
    pane_id: String,
) -> AppResult<Vec<crate::types::Pane>> {
    Ok(pane_service
        .get_pane_children(&PaneId::from_string(pane_id))
        .await)
}

#[tauri::command]
pub async fn is_leaf_pane<R: Runtime>(
    pane_service: State<'_, PaneService>,
    pane_id: String,
) -> AppResult<bool> {
    Ok(pane_service
        .is_leaf_pane(&PaneId::from_string(pane_id))
        .await)
}

#[tauri::command]
pub async fn is_root_pane<R: Runtime>(
    pane_service: State<'_, PaneService>,
    pane_id: String,
) -> AppResult<bool> {
    Ok(pane_service
        .is_root_pane(&PaneId::from_string(pane_id))
        .await)
}

#[tauri::command]
pub async fn get_pane_count<R: Runtime>(pane_service: State<'_, PaneService>) -> AppResult<usize> {
    Ok(pane_service.get_pane_count().await)
}
