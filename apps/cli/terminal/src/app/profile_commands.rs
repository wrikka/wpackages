use crate::error::AppResult;
use crate::services::ProfileService;
use crate::types::Profile;
use tauri::{AppHandle, Runtime, State};

#[tauri::command]
pub async fn get_profiles<R: Runtime>(
    profile_service: State<'_, ProfileService>,
) -> AppResult<Vec<Profile>> {
    Ok(profile_service.get_all_profiles().await)
}

#[tauri::command]
pub async fn get_profile<R: Runtime>(
    profile_service: State<'_, ProfileService>,
    profile_id: String,
) -> AppResult<Option<Profile>> {
    Ok(profile_service.get_profile(&profile_id).await)
}

#[tauri::command]
pub async fn get_active_profile<R: Runtime>(
    profile_service: State<'_, ProfileService>,
) -> AppResult<Option<Profile>> {
    Ok(profile_service.get_active_profile().await)
}

#[tauri::command]
pub async fn get_active_profile_id<R: Runtime>(
    profile_service: State<'_, ProfileService>,
) -> AppResult<Option<String>> {
    Ok(profile_service.get_active_profile_id().await)
}

#[tauri::command]
pub async fn create_profile<R: Runtime>(
    app_handle: AppHandle<R>,
    profile_service: State<'_, ProfileService>,
    profile: Profile,
) -> AppResult<String> {
    profile_service.create_profile(app_handle, profile).await
}

#[tauri::command]
pub async fn update_profile<R: Runtime>(
    app_handle: AppHandle<R>,
    profile_service: State<'_, ProfileService>,
    profile_id: String,
    profile: Profile,
) -> AppResult<()> {
    profile_service
        .update_profile(app_handle, profile_id, profile)
        .await
}

#[tauri::command]
pub async fn delete_profile<R: Runtime>(
    app_handle: AppHandle<R>,
    profile_service: State<'_, ProfileService>,
    profile_id: String,
) -> AppResult<()> {
    profile_service.delete_profile(app_handle, profile_id).await
}

#[tauri::command]
pub async fn activate_profile<R: Runtime>(
    app_handle: AppHandle<R>,
    profile_service: State<'_, ProfileService>,
    profile_id: String,
) -> AppResult<()> {
    profile_service
        .activate_profile(app_handle, profile_id)
        .await
}

#[tauri::command]
pub async fn duplicate_profile<R: Runtime>(
    app_handle: AppHandle<R>,
    profile_service: State<'_, ProfileService>,
    profile_id: String,
    new_name: String,
) -> AppResult<String> {
    profile_service
        .duplicate_profile(app_handle, profile_id, new_name)
        .await
}

#[tauri::command]
pub async fn create_template<R: Runtime>(
    app_handle: AppHandle<R>,
    profile_service: State<'_, ProfileService>,
    template: crate::types::ProfileTemplate,
) -> AppResult<String> {
    profile_service.create_template(app_handle, template).await
}

#[tauri::command]
pub async fn get_templates<R: Runtime>(
    profile_service: State<'_, ProfileService>,
) -> AppResult<Vec<crate::types::ProfileTemplate>> {
    Ok(profile_service.get_templates().await)
}

#[tauri::command]
pub async fn get_template<R: Runtime>(
    profile_service: State<'_, ProfileService>,
    template_id: String,
) -> AppResult<Option<crate::types::ProfileTemplate>> {
    Ok(profile_service.get_template(&template_id).await)
}

#[tauri::command]
pub async fn apply_template<R: Runtime>(
    app_handle: AppHandle<R>,
    profile_service: State<'_, ProfileService>,
    template_id: String,
    profile_name: String,
) -> AppResult<String> {
    profile_service
        .apply_template(app_handle, &template_id, profile_name)
        .await
}

#[tauri::command]
pub async fn save_profiles_to_disk<R: Runtime>(
    profile_service: State<'_, ProfileService>,
) -> AppResult<()> {
    profile_service.save_profiles_to_disk().await
}

#[tauri::command]
pub async fn load_profiles_from_disk<R: Runtime>(
    profile_service: State<'_, ProfileService>,
) -> AppResult<()> {
    profile_service.load_profiles_from_disk().await
}

#[tauri::command]
pub async fn search_profiles<R: Runtime>(
    profile_service: State<'_, ProfileService>,
    query: String,
) -> AppResult<Vec<Profile>> {
    Ok(profile_service.search_profiles(&query).await)
}
