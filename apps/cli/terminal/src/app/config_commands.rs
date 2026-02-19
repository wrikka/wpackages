use crate::config::AppConfig;
use crate::error::AppResult;
use crate::services::config_service::ConfigService;
use tauri::State;

#[tauri::command]
pub async fn get_config(config_service: State<'_, ConfigService>) -> AppResult<AppConfig> {
    let config = config_service.get_config().await;
    Ok(config)
}

#[tauri::command]
pub async fn set_config(
    config_service: State<'_, ConfigService>,
    config: AppConfig,
) -> AppResult<()> {
    config_service.set_config(config).await;
    Ok(())
}
