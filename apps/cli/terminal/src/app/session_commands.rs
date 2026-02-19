use crate::error::AppResult;
use crate::services::SessionService;
use crate::types::{Session, SessionConfig, SessionHistoryEntry, SessionId};
use tauri::{AppHandle, Runtime, State};

#[tauri::command]
pub async fn create_session<R: Runtime>(
    app_handle: AppHandle<R>,
    session_service: State<'_, SessionService>,
    name: String,
    config: SessionConfig,
) -> AppResult<SessionId> {
    session_service
        .create_session(app_handle, name, config)
        .await
}

#[tauri::command]
pub async fn update_session<R: Runtime>(
    app_handle: AppHandle<R>,
    session_service: State<'_, SessionService>,
    session_id: String,
    session: Session,
) -> AppResult<()> {
    session_service
        .update_session(app_handle, SessionId::from_string(session_id), session)
        .await
}

#[tauri::command]
pub async fn delete_session<R: Runtime>(
    app_handle: AppHandle<R>,
    session_service: State<'_, SessionService>,
    session_id: String,
) -> AppResult<()> {
    session_service
        .delete_session(app_handle, SessionId::from_string(session_id))
        .await
}

#[tauri::command]
pub async fn activate_session<R: Runtime>(
    app_handle: AppHandle<R>,
    session_service: State<'_, SessionService>,
    session_id: String,
) -> AppResult<()> {
    session_service
        .activate_session(app_handle, SessionId::from_string(session_id))
        .await
}

#[tauri::command]
pub async fn get_session<R: Runtime>(
    session_service: State<'_, SessionService>,
    session_id: String,
) -> AppResult<Option<Session>> {
    Ok(session_service
        .get_session(&SessionId::from_string(session_id))
        .await)
}

#[tauri::command]
pub async fn get_all_sessions<R: Runtime>(
    session_service: State<'_, SessionService>,
) -> AppResult<Vec<Session>> {
    Ok(session_service.get_all_sessions().await)
}

#[tauri::command]
pub async fn get_active_session<R: Runtime>(
    session_service: State<'_, SessionService>,
) -> AppResult<Option<Session>> {
    Ok(session_service.get_active_session().await)
}

#[tauri::command]
pub async fn get_active_session_id<R: Runtime>(
    session_service: State<'_, SessionService>,
) -> AppResult<Option<SessionId>> {
    Ok(session_service.get_active_session_id().await)
}

#[tauri::command]
pub async fn save_session<R: Runtime>(
    app_handle: AppHandle<R>,
    session_service: State<'_, SessionService>,
    session_id: String,
) -> AppResult<()> {
    session_service
        .save_session(app_handle, SessionId::from_string(session_id))
        .await
}

#[tauri::command]
pub async fn load_session<R: Runtime>(
    app_handle: AppHandle<R>,
    session_service: State<'_, SessionService>,
    session_id: String,
) -> AppResult<Session> {
    session_service
        .load_session(app_handle, SessionId::from_string(session_id))
        .await
}

#[tauri::command]
pub async fn restore_last_session<R: Runtime>(
    app_handle: AppHandle<R>,
    session_service: State<'_, SessionService>,
) -> AppResult<Option<Session>> {
    session_service.restore_last_session(app_handle).await
}

#[tauri::command]
pub async fn add_command_to_history<R: Runtime>(
    session_service: State<'_, SessionService>,
    session_id: String,
    entry: SessionHistoryEntry,
) -> AppResult<()> {
    session_service
        .add_command_to_history(&SessionId::from_string(session_id), entry)
        .await;
    Ok(())
}

#[tauri::command]
pub async fn get_session_history<R: Runtime>(
    session_service: State<'_, SessionService>,
    session_id: String,
) -> AppResult<Option<Vec<SessionHistoryEntry>>> {
    Ok(session_service
        .get_session_history(&SessionId::from_string(session_id))
        .await)
}

#[tauri::command]
pub async fn search_session_history<R: Runtime>(
    session_service: State<'_, SessionService>,
    session_id: String,
    query: String,
) -> AppResult<Vec<SessionHistoryEntry>> {
    Ok(session_service
        .search_session_history(&SessionId::from_string(session_id), &query)
        .await)
}

#[tauri::command]
pub async fn create_session_template<R: Runtime>(
    app_handle: AppHandle<R>,
    session_service: State<'_, SessionService>,
    template: crate::types::SessionTemplate,
) -> AppResult<String> {
    session_service.create_template(app_handle, template).await
}

#[tauri::command]
pub async fn get_session_templates<R: Runtime>(
    session_service: State<'_, SessionService>,
) -> AppResult<Vec<crate::types::SessionTemplate>> {
    Ok(session_service.get_templates().await)
}

#[tauri::command]
pub async fn get_session_template<R: Runtime>(
    session_service: State<'_, SessionService>,
    template_id: String,
) -> AppResult<Option<crate::types::SessionTemplate>> {
    Ok(session_service.get_template(&template_id).await)
}

#[tauri::command]
pub async fn apply_session_template<R: Runtime>(
    app_handle: AppHandle<R>,
    session_service: State<'_, SessionService>,
    template_id: String,
    session_name: String,
) -> AppResult<SessionId> {
    session_service
        .apply_template(app_handle, &template_id, session_name)
        .await
}

#[tauri::command]
pub async fn set_session_auto_save<R: Runtime>(
    session_service: State<'_, SessionService>,
    enabled: bool,
) -> AppResult<()> {
    session_service.set_auto_save(enabled).await;
    Ok(())
}

#[tauri::command]
pub async fn is_session_auto_save_enabled<R: Runtime>(
    session_service: State<'_, SessionService>,
) -> AppResult<bool> {
    Ok(session_service.is_auto_save_enabled().await)
}

#[tauri::command]
pub async fn auto_save_active_session<R: Runtime>(
    app_handle: AppHandle<R>,
    session_service: State<'_, SessionService>,
) -> AppResult<()> {
    session_service.auto_save_active_session(app_handle).await
}

#[tauri::command]
pub async fn delete_all_sessions<R: Runtime>(
    session_service: State<'_, SessionService>,
) -> AppResult<()> {
    session_service.delete_all_sessions().await
}

#[tauri::command]
pub async fn search_sessions<R: Runtime>(
    session_service: State<'_, SessionService>,
    query: String,
) -> AppResult<Vec<Session>> {
    Ok(session_service.search_sessions(&query).await)
}
