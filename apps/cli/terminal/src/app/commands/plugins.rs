use crate::services::plugin_marketplace::*;

#[tauri::command]
pub async fn search_plugins(
    query: String,
    category: Option<String>,
) -> Result<Vec<PluginManifest>, String> {
    let plugin_dir = std::env::temp_dir().join("terminal-plugins");
    let marketplace = PluginMarketplace::new(plugin_dir).map_err(|e| e.to_string())?;
    marketplace.initialize().await.map_err(|e| e.to_string())?;

    let cat = category.and_then(|c| serde_json::from_str(&c).ok());
    marketplace
        .search(&query, cat)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_featured_plugins() -> Result<Vec<PluginManifest>, String> {
    let plugin_dir = std::env::temp_dir().join("terminal-plugins");
    let marketplace = PluginMarketplace::new(plugin_dir).map_err(|e| e.to_string())?;
    marketplace.initialize().await.map_err(|e| e.to_string())?;

    marketplace.get_featured().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_popular_plugins() -> Result<Vec<PluginManifest>, String> {
    let plugin_dir = std::env::temp_dir().join("terminal-plugins");
    let marketplace = PluginMarketplace::new(plugin_dir).map_err(|e| e.to_string())?;
    marketplace.initialize().await.map_err(|e| e.to_string())?;

    marketplace.get_popular().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_recent_plugins() -> Result<Vec<PluginManifest>, String> {
    let plugin_dir = std::env::temp_dir().join("terminal-plugins");
    let marketplace = PluginMarketplace::new(plugin_dir).map_err(|e| e.to_string())?;
    marketplace.initialize().await.map_err(|e| e.to_string())?;

    marketplace.get_recent().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn install_plugin(plugin_id: String) -> Result<InstalledPlugin, String> {
    let plugin_dir = std::env::temp_dir().join("terminal-plugins");
    let marketplace = PluginMarketplace::new(plugin_dir).map_err(|e| e.to_string())?;
    marketplace.initialize().await.map_err(|e| e.to_string())?;

    marketplace
        .install(&plugin_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn uninstall_plugin(plugin_id: String) -> Result<(), String> {
    let plugin_dir = std::env::temp_dir().join("terminal-plugins");
    let marketplace = PluginMarketplace::new(plugin_dir).map_err(|e| e.to_string())?;
    marketplace.initialize().await.map_err(|e| e.to_string())?;

    marketplace
        .uninstall(&plugin_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn enable_plugin(plugin_id: String) -> Result<(), String> {
    let plugin_dir = std::env::temp_dir().join("terminal-plugins");
    let marketplace = PluginMarketplace::new(plugin_dir).map_err(|e| e.to_string())?;
    marketplace.initialize().await.map_err(|e| e.to_string())?;

    marketplace
        .enable(&plugin_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn disable_plugin(plugin_id: String) -> Result<(), String> {
    let plugin_dir = std::env::temp_dir().join("terminal-plugins");
    let marketplace = PluginMarketplace::new(plugin_dir).map_err(|e| e.to_string())?;
    marketplace.initialize().await.map_err(|e| e.to_string())?;

    marketplace
        .disable(&plugin_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_installed_plugins() -> Result<Vec<InstalledPlugin>, String> {
    let plugin_dir = std::env::temp_dir().join("terminal-plugins");
    let marketplace = PluginMarketplace::new(plugin_dir).map_err(|e| e.to_string())?;
    marketplace.initialize().await.map_err(|e| e.to_string())?;

    Ok(marketplace.get_installed())
}

#[tauri::command]
pub async fn get_plugin_reviews(plugin_id: String) -> Result<Vec<PluginReview>, String> {
    let plugin_dir = std::env::temp_dir().join("terminal-plugins");
    let marketplace = PluginMarketplace::new(plugin_dir).map_err(|e| e.to_string())?;
    marketplace.initialize().await.map_err(|e| e.to_string())?;

    marketplace
        .get_reviews(&plugin_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_plugin_review(review_json: String) -> Result<(), String> {
    let plugin_dir = std::env::temp_dir().join("terminal-plugins");
    let marketplace = PluginMarketplace::new(plugin_dir).map_err(|e| e.to_string())?;
    marketplace.initialize().await.map_err(|e| e.to_string())?;

    let review: PluginReview = serde_json::from_str(&review_json).map_err(|e| e.to_string())?;
    marketplace
        .add_review(review)
        .await
        .map_err(|e| e.to_string())
}
