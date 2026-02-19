use crate::error::AppResult;
use crate::services::HotkeyService;
use crate::types::{Hotkey, HotkeyBinding, HotkeyConfig, HotkeyContext};
use tauri::{AppHandle, Runtime, State};

#[tauri::command]
pub async fn register_hotkey<R: Runtime>(
    app_handle: AppHandle<R>,
    hotkey_service: State<'_, HotkeyService>,
    binding: HotkeyBinding,
) -> AppResult<()> {
    hotkey_service.register_hotkey(app_handle, binding).await
}

#[tauri::command]
pub async fn unregister_hotkey<R: Runtime>(
    app_handle: AppHandle<R>,
    hotkey_service: State<'_, HotkeyService>,
    hotkey_id: String,
) -> AppResult<()> {
    hotkey_service
        .unregister_hotkey(app_handle, &hotkey_id)
        .await
}

#[tauri::command]
pub async fn get_hotkey<R: Runtime>(
    hotkey_service: State<'_, HotkeyService>,
    hotkey_id: String,
) -> AppResult<Option<HotkeyBinding>> {
    Ok(hotkey_service.get_binding(&hotkey_id).await)
}

#[tauri::command]
pub async fn get_all_hotkeys<R: Runtime>(
    hotkey_service: State<'_, HotkeyService>,
) -> AppResult<Vec<HotkeyBinding>> {
    Ok(hotkey_service.get_all_bindings().await)
}

#[tauri::command]
pub async fn get_hotkey_config<R: Runtime>(
    hotkey_service: State<'_, HotkeyService>,
) -> AppResult<HotkeyConfig> {
    Ok(hotkey_service.get_config().await)
}

#[tauri::command]
pub async fn update_hotkey_config<R: Runtime>(
    hotkey_service: State<'_, HotkeyService>,
    config: HotkeyConfig,
) -> AppResult<()> {
    hotkey_service.update_config(config).await;
    Ok(())
}

#[tauri::command]
pub async fn add_hotkey_context<R: Runtime>(
    hotkey_service: State<'_, HotkeyService>,
    context: HotkeyContext,
) -> AppResult<()> {
    hotkey_service.add_context(context).await;
    Ok(())
}

#[tauri::command]
pub async fn remove_hotkey_context<R: Runtime>(
    hotkey_service: State<'_, HotkeyService>,
    context_id: String,
) -> AppResult<()> {
    hotkey_service.remove_context(&context_id).await;
    Ok(())
}

#[tauri::command]
pub async fn get_hotkey_context<R: Runtime>(
    hotkey_service: State<'_, HotkeyService>,
    context_id: String,
) -> AppResult<Option<HotkeyContext>> {
    Ok(hotkey_service.get_context(&context_id).await)
}

#[tauri::command]
pub async fn get_all_hotkey_contexts<R: Runtime>(
    hotkey_service: State<'_, HotkeyService>,
) -> AppResult<Vec<HotkeyContext>> {
    Ok(hotkey_service.get_all_contexts().await)
}

#[tauri::command]
pub async fn activate_hotkey_context<R: Runtime>(
    hotkey_service: State<'_, HotkeyService>,
    context_id: String,
) -> AppResult<()> {
    hotkey_service.activate_context(context_id).await;
    Ok(())
}

#[tauri::command]
pub async fn deactivate_hotkey_context<R: Runtime>(
    hotkey_service: State<'_, HotkeyService>,
    context_id: String,
) -> AppResult<()> {
    hotkey_service.deactivate_context(&context_id).await;
    Ok(())
}

#[tauri::command]
pub async fn get_active_hotkey_contexts<R: Runtime>(
    hotkey_service: State<'_, HotkeyService>,
) -> AppResult<Vec<String>> {
    Ok(hotkey_service.get_active_contexts().await)
}

#[tauri::command]
pub async fn find_hotkey_conflicts<R: Runtime>(
    hotkey_service: State<'_, HotkeyService>,
) -> AppResult<Vec<crate::types::HotkeyConflict>> {
    Ok(hotkey_service.find_all_conflicts().await)
}

#[tauri::command]
pub async fn resolve_hotkey_conflict<R: Runtime>(
    app_handle: AppHandle<R>,
    hotkey_service: State<'_, HotkeyService>,
    hotkey_id: String,
    new_hotkey: Hotkey,
) -> AppResult<()> {
    hotkey_service
        .resolve_conflict(app_handle, &hotkey_id, new_hotkey)
        .await
}

#[tauri::command]
pub async fn reset_hotkeys_to_defaults<R: Runtime>(
    hotkey_service: State<'_, HotkeyService>,
) -> AppResult<()> {
    hotkey_service.reset_to_defaults().await;
    Ok(())
}

#[tauri::command]
pub async fn export_hotkeys<R: Runtime>(
    hotkey_service: State<'_, HotkeyService>,
) -> AppResult<String> {
    hotkey_service.export_bindings().await
}

#[tauri::command]
pub async fn import_hotkeys<R: Runtime>(
    hotkey_service: State<'_, HotkeyService>,
    data: String,
) -> AppResult<usize> {
    hotkey_service.import_bindings(&data).await
}
