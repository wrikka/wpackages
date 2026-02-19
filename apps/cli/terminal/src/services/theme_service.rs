use crate::error::{AppError, AppResult};
use crate::types::{Theme, ThemeVariant};
use dashmap::DashMap;
use serde::Serialize;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Runtime};
use tokio::sync::RwLock;

#[derive(Clone, Serialize)]
pub struct ThemeEvent {
    pub event_type: ThemeEventType,
    pub theme_id: String,
    pub theme: Option<Theme>,
}

#[derive(Clone, Serialize)]
pub enum ThemeEventType {
    Applied,
    Created,
    Updated,
    Deleted,
    Imported,
}

#[derive(Clone)]
pub struct ThemeService {
    themes: Arc<DashMap<String, Theme>>,
    active_theme_id: Arc<RwLock<Option<String>>>,
    themes_dir: Arc<RwLock<std::path::PathBuf>>,
}

impl Default for ThemeService {
    fn default() -> Self {
        Self::new()
    }
}

impl ThemeService {
    pub fn new() -> Self {
        let themes = Arc::new(DashMap::new());

        // Add default themes
        themes.insert("default-dark".to_string(), Theme::default());
        themes.insert(
            "default-light".to_string(),
            Theme {
                id: "default-light".to_string(),
                name: "Default Light".to_string(),
                variant: ThemeVariant::Light,
                colors: crate::types::ColorScheme {
                    background: "#FFFFFF".to_string(),
                    foreground: "#000000".to_string(),
                    cursor: "#000000".to_string(),
                    cursor_foreground: None,
                    selection: "#B4D5FE".to_string(),
                    selection_foreground: None,
                    black: "#000000".to_string(),
                    red: "#CD3131".to_string(),
                    green: "#0DBC79".to_string(),
                    yellow: "#E5E510".to_string(),
                    blue: "#2472C8".to_string(),
                    magenta: "#BC3FBC".to_string(),
                    cyan: "#11A8CD".to_string(),
                    white: "#E5E5E5".to_string(),
                    bright_black: "#666666".to_string(),
                    bright_red: "#F14C4C".to_string(),
                    bright_green: "#23D18B".to_string(),
                    bright_yellow: "#F5F543".to_string(),
                    bright_blue: "#3B8EEA".to_string(),
                    bright_magenta: "#D670D6".to_string(),
                    bright_cyan: "#29B8DB".to_string(),
                    bright_white: "#FFFFFF".to_string(),
                },
                ui: crate::types::ThemeUI::default(),
                description: Some("Default light theme".to_string()),
                author: Some("WAI".to_string()),
                version: "1.0.0".to_string(),
                custom_properties: std::collections::HashMap::new(),
            },
        );

        Self {
            themes,
            active_theme_id: Arc::new(RwLock::new(Some("default-dark".to_string()))),
            themes_dir: Arc::new(RwLock::new(std::path::PathBuf::from("themes"))),
        }
    }

    pub async fn apply_theme<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        theme_id: String,
    ) -> AppResult<()> {
        if !self.themes.contains_key(&theme_id) {
            return Err(AppError::Other(format!("Theme not found: {}", theme_id)));
        }

        *self.active_theme_id.write().await = Some(theme_id.clone());

        self.emit_event(
            &app_handle,
            ThemeEvent {
                event_type: ThemeEventType::Applied,
                theme_id: theme_id.clone(),
                theme: self.themes.get(&theme_id).map(|t| t.clone()),
            },
        )?;

        Ok(())
    }

    pub async fn get_theme(&self, theme_id: &str) -> Option<Theme> {
        self.themes.get(theme_id).map(|t| t.clone())
    }

    pub async fn get_all_themes(&self) -> Vec<Theme> {
        self.themes.iter().map(|t| t.clone()).collect()
    }

    pub async fn get_active_theme(&self) -> Option<Theme> {
        let active_id = self.active_theme_id.read().await;
        active_id
            .as_ref()
            .and_then(|id| self.themes.get(id).map(|t| t.clone()))
    }

    pub async fn get_active_theme_id(&self) -> Option<String> {
        self.active_theme_id.read().await.clone()
    }

    pub async fn create_theme<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        mut theme: Theme,
    ) -> AppResult<String> {
        theme.id = uuid::Uuid::new_v4().to_string();
        let theme_id = theme.id.clone();

        self.themes.insert(theme_id.clone(), theme.clone());

        self.emit_event(
            &app_handle,
            ThemeEvent {
                event_type: ThemeEventType::Created,
                theme_id: theme_id.clone(),
                theme: Some(theme),
            },
        )?;

        Ok(theme_id)
    }

    pub async fn update_theme<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        theme_id: String,
        mut theme: Theme,
    ) -> AppResult<()> {
        if !self.themes.contains_key(&theme_id) {
            return Err(AppError::Other(format!("Theme not found: {}", theme_id)));
        }

        theme.id = theme_id.clone();
        self.themes.insert(theme_id.clone(), theme.clone());

        self.emit_event(
            &app_handle,
            ThemeEvent {
                event_type: ThemeEventType::Updated,
                theme_id: theme_id.clone(),
                theme: Some(theme),
            },
        )?;

        Ok(())
    }

    pub async fn delete_theme<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        theme_id: String,
    ) -> AppResult<()> {
        if theme_id == "default-dark" || theme_id == "default-light" {
            return Err(AppError::Other("Cannot delete default themes".to_string()));
        }

        let theme = self.themes.remove(&theme_id);

        if let Some((_, theme)) = theme {
            // Reset to default if this was the active theme
            let mut active_id = self.active_theme_id.write().await;
            if active_id.as_ref() == Some(&theme_id) {
                *active_id = Some("default-dark".to_string());
            }
            drop(active_id);

            self.emit_event(
                &app_handle,
                ThemeEvent {
                    event_type: ThemeEventType::Deleted,
                    theme_id,
                    theme: Some(theme),
                },
            )?;
        }

        Ok(())
    }

    pub async fn import_theme<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        theme: Theme,
    ) -> AppResult<String> {
        let theme_id = theme.id.clone();

        self.themes.insert(theme_id.clone(), theme.clone());

        self.emit_event(
            &app_handle,
            ThemeEvent {
                event_type: ThemeEventType::Imported,
                theme_id: theme_id.clone(),
                theme: Some(theme),
            },
        )?;

        Ok(theme_id)
    }

    pub async fn export_theme(&self, theme_id: &str) -> AppResult<String> {
        let theme = self
            .themes
            .get(theme_id)
            .ok_or_else(|| AppError::Other(format!("Theme not found: {}", theme_id)))?;

        serde_json::to_string_pretty(&theme)
            .map_err(|e| AppError::Other(format!("Failed to export theme: {}", e)))
    }

    pub async fn load_themes_from_disk(&self) -> AppResult<()> {
        let themes_dir = self.themes_dir.read().await;

        if !themes_dir.exists() {
            return Ok(());
        }

        for entry in std::fs::read_dir(&*themes_dir)? {
            let entry = entry?;
            let path = entry.path();

            if path.extension().and_then(|s| s.to_str()) == Some("json") {
                if let Ok(content) = std::fs::read_to_string(&path) {
                    if let Ok(theme) = serde_json::from_str::<Theme>(&content) {
                        self.themes.insert(theme.id.clone(), theme);
                    }
                }
            }
        }

        Ok(())
    }

    pub async fn save_theme_to_disk(&self, theme_id: &str) -> AppResult<()> {
        let theme = self
            .themes
            .get(theme_id)
            .ok_or_else(|| AppError::Other(format!("Theme not found: {}", theme_id)))?;

        let mut themes_dir = self.themes_dir.write().await;
        if !themes_dir.exists() {
            std::fs::create_dir_all(&*themes_dir)?;
        }

        let theme_path = themes_dir.join(format!("{}.json", theme_id));
        let content = serde_json::to_string_pretty(&theme)
            .map_err(|e| AppError::Other(format!("Failed to serialize theme: {}", e)))?;

        std::fs::write(&theme_path, content)?;

        Ok(())
    }

    pub async fn get_themes_by_variant(&self, variant: ThemeVariant) -> Vec<Theme> {
        self.themes
            .iter()
            .filter(|t| t.variant == variant)
            .map(|t| t.clone())
            .collect()
    }

    fn emit_event<R: Runtime>(
        &self,
        app_handle: &AppHandle<R>,
        event: ThemeEvent,
    ) -> AppResult<()> {
        app_handle
            .emit("theme-event", event)
            .map_err(|e| AppError::Other(format!("Failed to emit theme event: {}", e)))?;
        Ok(())
    }
}
