use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub enum ProfileType {
    Default,
    Custom,
    Template,
}

impl Default for ProfileType {
    fn default() -> Self {
        Self::Default
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ProfileShell {
    pub path: String,
    pub args: Vec<String>,
    pub env_vars: HashMap<String, String>,
}

impl Default for ProfileShell {
    fn default() -> Self {
        Self {
            path: if cfg!(windows) {
                "powershell.exe".to_string()
            } else {
                "/bin/bash".to_string()
            },
            args: vec![],
            env_vars: HashMap::new(),
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ProfileAppearance {
    pub theme_id: Option<String>,
    pub font_family: Option<String>,
    pub font_size: Option<u8>,
    pub line_height: Option<f32>,
    pub letter_spacing: Option<f32>,
}

impl Default for ProfileAppearance {
    fn default() -> Self {
        Self {
            theme_id: None,
            font_family: None,
            font_size: None,
            line_height: None,
            letter_spacing: None,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ProfileTerminal {
    pub rows: u16,
    pub cols: u16,
    pub scrollback_size: usize,
    pub bell_style: String,
    pub cursor_style: String,
}

impl Default for ProfileTerminal {
    fn default() -> Self {
        Self {
            rows: 24,
            cols: 80,
            scrollback_size: 10000,
            bell_style: "none".to_string(),
            cursor_style: "block".to_string(),
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ProfileAdvanced {
    pub shell_integration: bool,
    pub confirm_close: bool,
    pub auto_save: bool,
    pub restore_session: bool,
    pub enable_gpu_acceleration: bool,
}

impl Default for ProfileAdvanced {
    fn default() -> Self {
        Self {
            shell_integration: true,
            confirm_close: false,
            auto_save: true,
            restore_session: false,
            enable_gpu_acceleration: true,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ProfileConfig {
    pub shell: ProfileShell,
    pub appearance: ProfileAppearance,
    pub terminal: ProfileTerminal,
    pub advanced: ProfileAdvanced,
    pub working_dir: Option<PathBuf>,
}

impl Default for ProfileConfig {
    fn default() -> Self {
        Self {
            shell: ProfileShell::default(),
            appearance: ProfileAppearance::default(),
            terminal: ProfileTerminal::default(),
            advanced: ProfileAdvanced::default(),
            working_dir: None,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Profile {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub profile_type: ProfileType,
    pub config: ProfileConfig,
    pub icon: Option<String>,
    pub tags: Vec<String>,
    pub is_readonly: bool,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl Default for Profile {
    fn default() -> Self {
        let now = chrono::Utc::now();
        Self {
            id: "default".to_string(),
            name: "Default".to_string(),
            description: Some("Default profile".to_string()),
            profile_type: ProfileType::Default,
            config: ProfileConfig::default(),
            icon: None,
            tags: vec![],
            is_readonly: true,
            created_at: now,
            updated_at: now,
        }
    }
}

impl Profile {
    pub fn new(name: String, config: ProfileConfig) -> Self {
        let now = chrono::Utc::now();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            description: None,
            profile_type: ProfileType::Custom,
            config,
            icon: None,
            tags: vec![],
            is_readonly: false,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn with_id(id: String, name: String, config: ProfileConfig) -> Self {
        let now = chrono::Utc::now();
        Self {
            id,
            name,
            description: None,
            profile_type: ProfileType::Custom,
            config,
            icon: None,
            tags: vec![],
            is_readonly: false,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn set_description(&mut self, description: String) {
        self.description = Some(description);
        self.updated_at = chrono::Utc::now();
    }

    pub fn add_tag(&mut self, tag: String) {
        if !self.tags.contains(&tag) {
            self.tags.push(tag);
            self.updated_at = chrono::Utc::now();
        }
    }

    pub fn remove_tag(&mut self, tag: &str) {
        self.tags.retain(|t| t != tag);
        self.updated_at = chrono::Utc::now();
    }

    pub fn set_icon(&mut self, icon: String) {
        self.icon = Some(icon);
        self.updated_at = chrono::Utc::now();
    }

    pub fn is_default(&self) -> bool {
        self.profile_type == ProfileType::Default
    }

    pub fn is_template(&self) -> bool {
        self.profile_type == ProfileType::Template
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ProfileTemplate {
    pub id: String,
    pub name: String,
    pub description: String,
    pub profile: Profile,
    pub category: String,
    pub preview_image: Option<String>,
}

impl ProfileTemplate {
    pub fn new(name: String, description: String, profile: Profile, category: String) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            description,
            profile,
            category,
            preview_image: None,
        }
    }
}
