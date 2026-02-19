use crate::error::AppResult;
use crate::services::ClipboardService;
use crate::types::{ClipboardConfig, ClipboardFormat, ClipboardHistory, ClipboardSelection};
use tauri::{AppHandle, Runtime, State};

#[tauri::command]
pub async fn copy<R: Runtime>(
    app_handle: AppHandle<R>,
    clipboard_service: State<'_, ClipboardService>,
    text: String,
    format: ClipboardFormat,
) -> AppResult<()> {
    clipboard_service.copy(app_handle, text, format).await
}

#[tauri::command]
pub async fn paste<R: Runtime>(
    app_handle: AppHandle<R>,
    clipboard_service: State<'_, ClipboardService>,
) -> AppResult<Option<String>> {
    clipboard_service.paste(app_handle).await
}

#[tauri::command]
pub async fn paste_from_history<R: Runtime>(
    app_handle: AppHandle<R>,
    clipboard_service: State<'_, ClipboardService>,
    item_id: String,
) -> AppResult<Option<String>> {
    clipboard_service
        .paste_from_history(app_handle, &item_id)
        .await
}

#[tauri::command]
pub async fn set_selection<R: Runtime>(
    app_handle: AppHandle<R>,
    clipboard_service: State<'_, ClipboardService>,
    selection: ClipboardSelection,
) -> AppResult<()> {
    clipboard_service.set_selection(app_handle, selection).await
}

#[tauri::command]
pub async fn get_selection<R: Runtime>(
    clipboard_service: State<'_, ClipboardService>,
) -> AppResult<Option<ClipboardSelection>> {
    Ok(clipboard_service.get_selection().await)
}

#[tauri::command]
pub async fn clear_selection<R: Runtime>(
    clipboard_service: State<'_, ClipboardService>,
) -> AppResult<()> {
    clipboard_service.clear_selection().await;
    Ok(())
}

#[tauri::command]
pub async fn has_selection<R: Runtime>(
    clipboard_service: State<'_, ClipboardService>,
) -> AppResult<bool> {
    Ok(clipboard_service.has_selection().await)
}

#[tauri::command]
pub async fn get_history<R: Runtime>(
    clipboard_service: State<'_, ClipboardService>,
) -> AppResult<ClipboardHistory> {
    Ok(clipboard_service.get_history().await)
}

#[tauri::command]
pub async fn get_history_items<R: Runtime>(
    clipboard_service: State<'_, ClipboardService>,
) -> AppResult<Vec<crate::types::ClipboardItem>> {
    Ok(clipboard_service.get_history_items().await)
}

#[tauri::command]
pub async fn search_history<R: Runtime>(
    clipboard_service: State<'_, ClipboardService>,
    query: String,
) -> AppResult<Vec<crate::types::ClipboardItem>> {
    Ok(clipboard_service.search_history(&query).await)
}

#[tauri::command]
pub async fn clear_history<R: Runtime>(
    clipboard_service: State<'_, ClipboardService>,
) -> AppResult<()> {
    clipboard_service.clear_history().await;
    Ok(())
}

#[tauri::command]
pub async fn remove_history_item<R: Runtime>(
    clipboard_service: State<'_, ClipboardService>,
    item_id: String,
) -> AppResult<()> {
    clipboard_service.remove_history_item(&item_id).await;
    Ok(())
}

#[tauri::command]
pub async fn get_clipboard_config<R: Runtime>(
    clipboard_service: State<'_, ClipboardService>,
) -> AppResult<ClipboardConfig> {
    Ok(clipboard_service.get_config().await)
}

#[tauri::command]
pub async fn update_clipboard_config<R: Runtime>(
    clipboard_service: State<'_, ClipboardService>,
    config: ClipboardConfig,
) -> AppResult<()> {
    clipboard_service.update_config(config).await;
    Ok(())
}

#[tauri::command]
pub async fn get_total_history_size<R: Runtime>(
    clipboard_service: State<'_, ClipboardService>,
) -> AppResult<usize> {
    Ok(clipboard_service.get_total_history_size().await)
}

#[tauri::command]
pub async fn is_history_over_limit<R: Runtime>(
    clipboard_service: State<'_, ClipboardService>,
) -> AppResult<bool> {
    Ok(clipboard_service.is_history_over_limit().await)
}

#[tauri::command]
pub async fn get_recent_items<R: Runtime>(
    clipboard_service: State<'_, ClipboardService>,
    count: usize,
) -> AppResult<Vec<crate::types::ClipboardItem>> {
    Ok(clipboard_service.get_recent_items(count).await)
}
