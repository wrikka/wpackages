use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq, Hash)]
pub struct SessionId(pub String);

impl SessionId {
    pub fn new() -> Self {
        Self(uuid::Uuid::new_v4().to_string())
    }

    pub fn from_string(id: String) -> Self {
        Self(id)
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl Default for SessionId {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct SessionProfile {
    pub id: String,
    pub name: String,
    pub shell: String,
    pub shell_args: Vec<String>,
    pub working_dir: Option<PathBuf>,
    pub env_vars: HashMap<String, String>,
    pub description: Option<String>,
    pub icon: Option<String>,
}

impl Default for SessionProfile {
    fn default() -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name: "Default".to_string(),
            shell: if cfg!(windows) {
                "powershell.exe".to_string()
            } else {
                "/bin/bash".to_string()
            },
            shell_args: vec![],
            working_dir: None,
            env_vars: HashMap::new(),
            description: None,
            icon: None,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct SessionHistoryEntry {
    pub command: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub working_dir: Option<PathBuf>,
    pub exit_code: Option<i32>,
    pub duration_ms: Option<u64>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct SessionHistory {
    pub entries: Vec<SessionHistoryEntry>,
    pub max_entries: usize,
}

impl Default for SessionHistory {
    fn default() -> Self {
        Self {
            entries: Vec::new(),
            max_entries: 1000,
        }
    }
}

impl SessionHistory {
    pub fn add_entry(&mut self, entry: SessionHistoryEntry) {
        self.entries.push(entry);
        if self.entries.len() > self.max_entries {
            self.entries.remove(0);
        }
    }

    pub fn search(&self, query: &str) -> Vec<&SessionHistoryEntry> {
        self.entries
            .iter()
            .filter(|e| e.command.contains(query))
            .collect()
    }

    pub fn clear(&mut self) {
        self.entries.clear();
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct SessionConfig {
    pub profile: SessionProfile,
    pub history: SessionHistory,
    pub auto_save: bool,
    pub restore_on_startup: bool,
}

impl Default for SessionConfig {
    fn default() -> Self {
        Self {
            profile: SessionProfile::default(),
            history: SessionHistory::default(),
            auto_save: true,
            restore_on_startup: false,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Session {
    pub id: SessionId,
    pub name: String,
    pub config: SessionConfig,
    pub tab_layout: Option<super::tab::TabLayout>,
    pub pane_layout: Option<super::pane::PaneLayout>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub last_accessed_at: chrono::DateTime<chrono::Utc>,
    pub metadata: HashMap<String, String>,
}

impl Session {
    pub fn new(name: String, config: SessionConfig) -> Self {
        let now = chrono::Utc::now();
        Self {
            id: SessionId::new(),
            name,
            config,
            tab_layout: None,
            pane_layout: None,
            created_at: now,
            updated_at: now,
            last_accessed_at: now,
            metadata: HashMap::new(),
        }
    }

    pub fn with_id(id: SessionId, name: String, config: SessionConfig) -> Self {
        let now = chrono::Utc::now();
        Self {
            id,
            name,
            config,
            tab_layout: None,
            pane_layout: None,
            created_at: now,
            updated_at: now,
            last_accessed_at: now,
            metadata: HashMap::new(),
        }
    }

    pub fn update_access_time(&mut self) {
        self.last_accessed_at = chrono::Utc::now();
    }

    pub fn set_name(&mut self, name: String) {
        self.name = name;
        self.updated_at = chrono::Utc::now();
    }

    pub fn set_metadata(&mut self, key: String, value: String) {
        self.metadata.insert(key, value);
        self.updated_at = chrono::Utc::now();
    }

    pub fn get_metadata(&self, key: &str) -> Option<&String> {
        self.metadata.get(key)
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct SessionTemplate {
    pub id: String,
    pub name: String,
    pub description: String,
    pub session: Session,
    pub tags: Vec<String>,
}

impl SessionTemplate {
    pub fn new(name: String, description: String, session: Session) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            description,
            session,
            tags: vec![],
        }
    }
}
