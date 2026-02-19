use crate::error::AppResult;
use crate::services::ThemeService;
use crate::types::Theme;
use tauri::{AppHandle, Runtime, State};

#[tauri::command]
pub async fn get_themes<R: Runtime>(
    theme_service: State<'_, ThemeService>,
) -> AppResult<Vec<Theme>> {
    Ok(theme_service.get_all_themes().await)
}

#[tauri::command]
pub async fn get_theme<R: Runtime>(
    theme_service: State<'_, ThemeService>,
    theme_id: String,
) -> AppResult<Option<Theme>> {
    Ok(theme_service.get_theme(&theme_id).await)
}

#[tauri::command]
pub async fn get_active_theme<R: Runtime>(
    theme_service: State<'_, ThemeService>,
) -> AppResult<Option<Theme>> {
    Ok(theme_service.get_active_theme().await)
}

#[tauri::command]
pub async fn get_active_theme_id<R: Runtime>(
    theme_service: State<'_, ThemeService>,
) -> AppResult<Option<String>> {
    Ok(theme_service.get_active_theme_id().await)
}

#[tauri::command]
pub async fn apply_theme<R: Runtime>(
    app_handle: AppHandle<R>,
    theme_service: State<'_, ThemeService>,
    theme_id: String,
) -> AppResult<()> {
    theme_service.apply_theme(app_handle, theme_id).await
}

#[tauri::command]
pub async fn create_theme<R: Runtime>(
    app_handle: AppHandle<R>,
    theme_service: State<'_, ThemeService>,
    theme: Theme,
) -> AppResult<String> {
    theme_service.create_theme(app_handle, theme).await
}

#[tauri::command]
pub async fn update_theme<R: Runtime>(
    app_handle: AppHandle<R>,
    theme_service: State<'_, ThemeService>,
    theme_id: String,
    theme: Theme,
) -> AppResult<()> {
    theme_service
        .update_theme(app_handle, theme_id, theme)
        .await
}

#[tauri::command]
pub async fn delete_theme<R: Runtime>(
    app_handle: AppHandle<R>,
    theme_service: State<'_, ThemeService>,
    theme_id: String,
) -> AppResult<()> {
    theme_service.delete_theme(app_handle, theme_id).await
}

#[tauri::command]
pub async fn import_theme<R: Runtime>(
    app_handle: AppHandle<R>,
    theme_service: State<'_, ThemeService>,
    theme: Theme,
) -> AppResult<String> {
    theme_service.import_theme(app_handle, theme).await
}

#[tauri::command]
pub async fn export_theme<R: Runtime>(
    theme_service: State<'_, ThemeService>,
    theme_id: String,
) -> AppResult<String> {
    theme_service.export_theme(&theme_id).await
}

#[tauri::command]
pub async fn get_themes_by_variant<R: Runtime>(
    theme_service: State<'_, ThemeService>,
    variant: crate::types::ThemeVariant,
) -> AppResult<Vec<Theme>> {
    Ok(theme_service.get_themes_by_variant(variant).await)
}

#[tauri::command]
pub async fn load_themes_from_disk<R: Runtime>(
    theme_service: State<'_, ThemeService>,
) -> AppResult<()> {
    theme_service.load_themes_from_disk().await
}

#[tauri::command]
pub async fn save_theme_to_disk<R: Runtime>(
    theme_service: State<'_, ThemeService>,
    theme_id: String,
) -> AppResult<()> {
    theme_service.save_theme_to_disk(&theme_id).await
}
