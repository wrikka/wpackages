use crate::config::app_config::AppConfig;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum SettingsMode {
    #[default]
    Ui,
    Json,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum SettingsPage {
    #[default]
    General,
    Appearance,
    Editor,
    Extensions,
    AI,
    Network,
}

impl SettingsPage {
    pub fn label(self) -> &'static str {
        match self {
            Self::General => "General",
            Self::Appearance => "Appearance",
            Self::Editor => "Editor",
            Self::Extensions => "Extensions",
            Self::AI => "AI",
            Self::Network => "Network",
        }
    }

    pub fn all() -> [(Self, &'static str); 6] {
        [
            (Self::General, "General"),
            (Self::Appearance, "Appearance"),
            (Self::Editor, "Editor"),
            (Self::Extensions, "Extensions"),
            (Self::AI, "AI"),
            (Self::Network, "Network"),
        ]
    }
}

pub struct SettingsState {
    pub settings_page: SettingsPage,
    pub settings_mode: SettingsMode,
    pub settings_json: String,
    pub settings_json_error: Option<String>,
    pub config: AppConfig,
}

impl Default for SettingsState {
    fn default() -> Self {
        let config = AppConfig::default();
        Self {
            settings_page: SettingsPage::General,
            settings_mode: SettingsMode::Ui,
            settings_json: crate::config::app_config::to_pretty_json(&config),
            settings_json_error: None,
            config,
        }
    }
}
