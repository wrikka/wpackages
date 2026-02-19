//! Theme service for managing UI themes

use crate::error::{AppError, Result};
use crate::types::theme::{builtin, Theme, ThemePreset, ThemeType};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{debug, info};

/// Service for managing themes
#[derive(Clone)]
pub struct ThemeService {
    themes: Arc<RwLock<HashMap<String, Theme>>>,
    current_theme: Arc<RwLock<String>>,
    theme_dir: PathBuf,
}

impl ThemeService {
    /// Creates a new theme service
    pub fn new(theme_dir: PathBuf) -> Self {
        Self {
            themes: Arc::new(RwLock::new(HashMap::new())),
            current_theme: Arc::new(RwLock::new("dark".to_string())),
            theme_dir,
        }
    }

    /// Initializes the theme service with built-in themes
    pub async fn initialize(&self) -> Result<()> {
        debug!("Initializing theme service");

        let mut themes = self.themes.write().await;

        themes.insert("light".to_string(), builtin::light());
        themes.insert("dark".to_string(), builtin::dark());
        themes.insert("high-contrast".to_string(), builtin::high_contrast());

        if self.theme_dir.exists() {
            self.load_custom_themes(&mut themes).await?;
        }

        info!("Theme service initialized with {} themes", themes.len());
        Ok(())
    }

    /// Loads custom themes from directory
    async fn load_custom_themes(&self, themes: &mut HashMap<String, Theme>) -> Result<()> {
        debug!("Loading custom themes from {:?}", self.theme_dir);

        let entries = match tokio::fs::read_dir(&self.theme_dir).await {
            Ok(entries) => entries,
            Err(e) => {
                tracing::warn!("Failed to read theme directory: {}", e);
                return Ok(());
            }
        };

        let mut entry_stream = entries;

        while let Some(entry) = entry_stream.next_entry().await? {
            let path = entry.path();

            if path.extension().and_then(|s| s.to_str()) != Some("toml") {
                continue;
            }

            match self.load_theme_from_file(&path).await {
                Ok(theme) => {
                    themes.insert(theme.id.clone(), theme);
                    info!("Loaded custom theme: {}", path.display());
                }
                Err(e) => {
                    tracing::warn!("Failed to load theme {}: {}", path.display(), e);
                }
            }
        }

        Ok(())
    }

    /// Loads a theme from a file
    async fn load_theme_from_file(&self, path: &PathBuf) -> Result<Theme> {
        let content = tokio::fs::read_to_string(path).await?;
        let theme: Theme = toml::from_str(&content).map_err(AppError::TomlParse)?;
        Ok(theme)
    }

    /// Registers a new theme
    pub async fn register_theme(&self, theme: Theme) -> Result<()> {
        debug!("Registering theme: {}", theme.id);

        let theme_id = theme.id.clone();
        let mut themes = self.themes.write().await;
        themes.insert(theme_id.clone(), theme);

        info!("Theme {} registered", theme_id);
        Ok(())
    }

    /// Gets a theme by ID
    pub async fn get_theme(&self, theme_id: &str) -> Option<Theme> {
        let themes = self.themes.read().await;
        themes.get(theme_id).cloned()
    }

    /// Gets all available themes
    pub async fn get_all_themes(&self) -> Vec<Theme> {
        let themes = self.themes.read().await;
        themes.values().cloned().collect()
    }

    /// Gets the current theme
    pub async fn get_current_theme(&self) -> Theme {
        let current = self.current_theme.read().await;
        self.get_theme(&current).await.unwrap_or_else(builtin::dark)
    }

    /// Sets the current theme
    pub async fn set_current_theme(&self, theme_id: &str) -> Result<()> {
        debug!("Setting current theme: {}", theme_id);

        let themes = self.themes.read().await;
        if !themes.contains_key(theme_id) {
            return Err(AppError::SettingNotFound(format!(
                "Theme {} not found",
                theme_id
            )));
        }
        drop(themes);

        let mut current = self.current_theme.write().await;
        *current = theme_id.to_string();

        info!("Current theme set to {}", theme_id);
        Ok(())
    }

    /// Gets themes by type
    pub async fn get_themes_by_type(&self, theme_type: ThemeType) -> Vec<Theme> {
        let themes = self.themes.read().await;
        themes
            .values()
            .filter(|t| t.theme_type == theme_type)
            .cloned()
            .collect()
    }

    /// Checks if a theme exists
    pub async fn theme_exists(&self, theme_id: &str) -> bool {
        let themes = self.themes.read().await;
        themes.contains_key(theme_id)
    }

    /// Deletes a custom theme
    pub async fn delete_theme(&self, theme_id: &str) -> Result<()> {
        debug!("Deleting theme: {}", theme_id);

        if matches!(theme_id, "light" | "dark" | "high-contrast") {
            return Err(AppError::PermissionDenied(
                "Cannot delete built-in theme".to_string(),
            ));
        }

        let mut themes = self.themes.write().await;
        if themes.remove(theme_id).is_none() {
            return Err(AppError::SettingNotFound(format!(
                "Theme {} not found",
                theme_id
            )));
        }

        let theme_file = self.theme_dir.join(format!("{}.toml", theme_id));
        if theme_file.exists() {
            tokio::fs::remove_file(&theme_file).await?;
        }

        info!("Theme {} deleted", theme_id);
        Ok(())
    }

    /// Saves a theme to disk
    pub async fn save_theme(&self, theme: &Theme) -> Result<()> {
        debug!("Saving theme: {}", theme.id);

        if !self.theme_dir.exists() {
            tokio::fs::create_dir_all(&self.theme_dir).await?;
        }

        let theme_file = self.theme_dir.join(format!("{}.toml", theme.id));
        let content = toml::to_string_pretty(theme).map_err(AppError::TomlSerialize)?;
        tokio::fs::write(&theme_file, content).await?;

        info!("Theme {} saved to {}", theme.id, theme_file.display());
        Ok(())
    }

    /// Creates a theme preset
    pub async fn create_preset(
        &self,
        name: impl Into<String>,
        description: impl Into<String>,
        theme: Theme,
    ) -> ThemePreset {
        ThemePreset::new(name, description, theme)
    }

    /// Gets the theme directory
    pub fn theme_dir(&self) -> &PathBuf {
        &self.theme_dir
    }
}

impl Default for ThemeService {
    fn default() -> Self {
        Self::new(PathBuf::from(".themes"))
    }
}
