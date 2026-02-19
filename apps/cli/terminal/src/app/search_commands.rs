use crate::error::AppResult;
use crate::services::SearchService;
use crate::types::{SearchDirection, SearchMatch, SearchQuery, SearchResult};
use tauri::{AppHandle, Runtime, State};

#[tauri::command]
pub async fn search<R: Runtime>(
    app_handle: AppHandle<R>,
    search_service: State<'_, SearchService>,
    tab_id: String,
    query: SearchQuery,
    content: String,
) -> AppResult<SearchResult> {
    search_service
        .start_search(app_handle, tab_id, query, &content)
        .await
}

#[tauri::command]
pub async fn update_search<R: Runtime>(
    app_handle: AppHandle<R>,
    search_service: State<'_, SearchService>,
    tab_id: String,
    query: SearchQuery,
    content: String,
) -> AppResult<SearchResult> {
    search_service
        .update_search(app_handle, tab_id, query, &content)
        .await
}

#[tauri::command]
pub async fn next_match<R: Runtime>(
    app_handle: AppHandle<R>,
    search_service: State<'_, SearchService>,
    tab_id: String,
) -> AppResult<Option<SearchMatch>> {
    search_service.next_match(app_handle, tab_id).await
}

#[tauri::command]
pub async fn previous_match<R: Runtime>(
    app_handle: AppHandle<R>,
    search_service: State<'_, SearchService>,
    tab_id: String,
) -> AppResult<Option<SearchMatch>> {
    search_service.previous_match(app_handle, tab_id).await
}

#[tauri::command]
pub async fn clear_search<R: Runtime>(
    app_handle: AppHandle<R>,
    search_service: State<'_, SearchService>,
    tab_id: String,
) -> AppResult<()> {
    search_service.clear_search(app_handle, tab_id).await
}

#[tauri::command]
pub async fn get_search_state<R: Runtime>(
    search_service: State<'_, SearchService>,
    tab_id: String,
) -> AppResult<Option<crate::types::SearchState>> {
    Ok(search_service.get_search_state(&tab_id).await)
}

#[tauri::command]
pub async fn is_searching<R: Runtime>(
    search_service: State<'_, SearchService>,
    tab_id: String,
) -> AppResult<bool> {
    Ok(search_service.is_searching(&tab_id).await)
}

#[tauri::command]
pub async fn replace_all<R: Runtime>(
    app_handle: AppHandle<R>,
    search_service: State<'_, SearchService>,
    tab_id: String,
    query: SearchQuery,
    replacement: String,
    content: String,
) -> AppResult<(String, usize)> {
    search_service
        .replace_all(app_handle, tab_id, query, replacement, &content)
        .await
}

#[tauri::command]
pub async fn get_all_search_states<R: Runtime>(
    search_service: State<'_, SearchService>,
) -> AppResult<Vec<(String, crate::types::SearchState)>> {
    Ok(search_service.get_all_search_states().await)
}
