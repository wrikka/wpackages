use crate::error::AppResult;
use crate::services::TabService;
use crate::types::{TabConfig, TabId, TabState};
use tauri::{AppHandle, Runtime, State};

#[tauri::command]
pub async fn create_tab<R: Runtime>(
    app_handle: AppHandle<R>,
    tab_service: State<'_, TabService>,
    config: Option<TabConfig>,
) -> AppResult<TabId> {
    let tab_config = config.unwrap_or_default();
    tab_service.create_tab(app_handle, tab_config).await
}

#[tauri::command]
pub async fn close_tab<R: Runtime>(
    app_handle: AppHandle<R>,
    tab_service: State<'_, TabService>,
    tab_id: String,
) -> AppResult<()> {
    tab_service
        .close_tab(app_handle, TabId::from_string(tab_id))
        .await
}

#[tauri::command]
pub async fn switch_tab<R: Runtime>(
    app_handle: AppHandle<R>,
    tab_service: State<'_, TabService>,
    tab_id: String,
) -> AppResult<()> {
    tab_service
        .switch_tab(app_handle, TabId::from_string(tab_id))
        .await
}

#[tauri::command]
pub async fn rename_tab<R: Runtime>(
    app_handle: AppHandle<R>,
    tab_service: State<'_, TabService>,
    tab_id: String,
    title: String,
) -> AppResult<()> {
    tab_service
        .rename_tab(app_handle, TabId::from_string(tab_id), title)
        .await
}

#[tauri::command]
pub async fn move_tab<R: Runtime>(
    app_handle: AppHandle<R>,
    tab_service: State<'_, TabService>,
    tab_id: String,
    new_index: usize,
) -> AppResult<()> {
    tab_service
        .move_tab(app_handle, TabId::from_string(tab_id), new_index)
        .await
}

#[tauri::command]
pub async fn get_tab<R: Runtime>(
    tab_service: State<'_, TabService>,
    tab_id: String,
) -> AppResult<Option<crate::types::Tab>> {
    Ok(tab_service.get_tab(&TabId::from_string(tab_id)).await)
}

#[tauri::command]
pub async fn get_all_tabs<R: Runtime>(
    tab_service: State<'_, TabService>,
) -> AppResult<Vec<crate::types::Tab>> {
    Ok(tab_service.get_all_tabs().await)
}

#[tauri::command]
pub async fn get_tab_layout<R: Runtime>(
    tab_service: State<'_, TabService>,
) -> AppResult<crate::types::TabLayout> {
    Ok(tab_service.get_layout().await)
}

#[tauri::command]
pub async fn get_active_tab<R: Runtime>(
    tab_service: State<'_, TabService>,
) -> AppResult<Option<crate::types::Tab>> {
    Ok(tab_service.get_active_tab().await)
}

#[tauri::command]
pub async fn set_tab_state<R: Runtime>(
    tab_service: State<'_, TabService>,
    tab_id: String,
    state: TabState,
) -> AppResult<()> {
    tab_service
        .set_tab_state(&TabId::from_string(tab_id), state)
        .await;
    Ok(())
}

#[tauri::command]
pub async fn set_tab_metadata<R: Runtime>(
    tab_service: State<'_, TabService>,
    tab_id: String,
    key: String,
    value: String,
) -> AppResult<()> {
    tab_service
        .set_tab_metadata(&TabId::from_string(tab_id), key, value)
        .await;
    Ok(())
}

#[tauri::command]
pub async fn get_tab_metadata<R: Runtime>(
    tab_service: State<'_, TabService>,
    tab_id: String,
    key: String,
) -> AppResult<Option<String>> {
    Ok(tab_service
        .get_tab_metadata(&TabId::from_string(tab_id), &key)
        .await)
}

#[tauri::command]
pub async fn get_tab_count<R: Runtime>(tab_service: State<'_, TabService>) -> AppResult<usize> {
    Ok(tab_service.get_tab_count().await)
}

#[tauri::command]
pub async fn has_tabs<R: Runtime>(tab_service: State<'_, TabService>) -> AppResult<bool> {
    Ok(tab_service.has_tabs().await)
}
