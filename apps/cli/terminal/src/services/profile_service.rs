use crate::error::{AppError, AppResult};
use crate::types::{Profile, ProfileConfig, ProfileTemplate, ProfileType};
use dashmap::DashMap;
use serde::Serialize;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Runtime};
use tokio::sync::RwLock;

#[derive(Clone, Serialize)]
pub struct ProfileEvent {
    pub event_type: ProfileEventType,
    pub profile_id: String,
    pub profile: Option<Profile>,
}

#[derive(Clone, Serialize)]
pub enum ProfileEventType {
    Created,
    Updated,
    Deleted,
    Activated,
    Imported,
}

#[derive(Clone)]
pub struct ProfileService {
    profiles: Arc<DashMap<String, Profile>>,
    active_profile_id: Arc<RwLock<Option<String>>>,
    templates: Arc<RwLock<Vec<ProfileTemplate>>>,
    profiles_dir: Arc<RwLock<std::path::PathBuf>>,
}

impl Default for ProfileService {
    fn default() -> Self {
        Self::new()
    }
}

impl ProfileService {
    pub fn new() -> Self {
        let profiles = Arc::new(DashMap::new());

        // Add default profile
        profiles.insert(
            "default".to_string(),
            Profile {
                id: "default".to_string(),
                name: "Default".to_string(),
                description: Some("Default profile".to_string()),
                profile_type: ProfileType::Default,
                config: ProfileConfig::default(),
                icon: None,
                tags: vec![],
                is_readonly: true,
                created_at: chrono::Utc::now(),
                updated_at: chrono::Utc::now(),
            },
        );

        Self {
            profiles,
            active_profile_id: Arc::new(RwLock::new(Some("default".to_string()))),
            templates: Arc::new(RwLock::new(Vec::new())),
            profiles_dir: Arc::new(RwLock::new(std::path::PathBuf::from("profiles"))),
        }
    }

    pub async fn create_profile<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        mut profile: Profile,
    ) -> AppResult<String> {
        profile.id = uuid::Uuid::new_v4().to_string();
        let profile_id = profile.id.clone();

        self.profiles.insert(profile_id.clone(), profile.clone());

        self.emit_event(
            &app_handle,
            ProfileEvent {
                event_type: ProfileEventType::Created,
                profile_id: profile_id.clone(),
                profile: Some(profile),
            },
        )?;

        Ok(profile_id)
    }

    pub async fn update_profile<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        profile_id: String,
        mut profile: Profile,
    ) -> AppResult<()> {
        if !self.profiles.contains_key(&profile_id) {
            return Err(AppError::Other(format!(
                "Profile not found: {}",
                profile_id
            )));
        }

        let existing = self.profiles.get(&profile_id).unwrap();
        if existing.is_readonly {
            return Err(AppError::Other(
                "Cannot update readonly profile".to_string(),
            ));
        }

        profile.id = profile_id.clone();
        profile.updated_at = chrono::Utc::now();
        self.profiles.insert(profile_id.clone(), profile.clone());

        self.emit_event(
            &app_handle,
            ProfileEvent {
                event_type: ProfileEventType::Updated,
                profile_id: profile_id.clone(),
                profile: Some(profile),
            },
        )?;

        Ok(())
    }

    pub async fn delete_profile<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        profile_id: String,
    ) -> AppResult<()> {
        let profile = self.profiles.remove(&profile_id);

        if let Some((_, profile)) = profile {
            if profile.is_readonly {
                return Err(AppError::Other(
                    "Cannot delete readonly profile".to_string(),
                ));
            }

            // Reset to default if this was the active profile
            let mut active_id = self.active_profile_id.write().await;
            if active_id.as_ref() == Some(&profile_id) {
                *active_id = Some("default".to_string());
            }
            drop(active_id);

            self.emit_event(
                &app_handle,
                ProfileEvent {
                    event_type: ProfileEventType::Deleted,
                    profile_id,
                    profile: Some(profile),
                },
            )?;
        }

        Ok(())
    }

    pub async fn activate_profile<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        profile_id: String,
    ) -> AppResult<()> {
        if !self.profiles.contains_key(&profile_id) {
            return Err(AppError::Other(format!(
                "Profile not found: {}",
                profile_id
            )));
        }

        *self.active_profile_id.write().await = Some(profile_id.clone());

        self.emit_event(
            &app_handle,
            ProfileEvent {
                event_type: ProfileEventType::Activated,
                profile_id: profile_id.clone(),
                profile: self.profiles.get(&profile_id).map(|p| p.clone()),
            },
        )?;

        Ok(())
    }

    pub async fn get_profile(&self, profile_id: &str) -> Option<Profile> {
        self.profiles.get(profile_id).map(|p| p.clone())
    }

    pub async fn get_all_profiles(&self) -> Vec<Profile> {
        self.profiles.iter().map(|p| p.clone()).collect()
    }

    pub async fn get_active_profile(&self) -> Option<Profile> {
        let active_id = self.active_profile_id.read().await;
        active_id
            .as_ref()
            .and_then(|id| self.profiles.get(id).map(|p| p.clone()))
    }

    pub async fn get_active_profile_id(&self) -> Option<String> {
        self.active_profile_id.read().await.clone()
    }

    pub async fn duplicate_profile<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        profile_id: String,
        new_name: String,
    ) -> AppResult<String> {
        let profile = self
            .profiles
            .get(&profile_id)
            .ok_or_else(|| AppError::Other(format!("Profile not found: {}", profile_id)))?;

        let mut new_profile = profile.clone();
        new_profile.id = uuid::Uuid::new_v4().to_string();
        new_profile.name = new_name;
        new_profile.profile_type = ProfileType::Custom;
        new_profile.is_readonly = false;
        new_profile.created_at = chrono::Utc::now();
        new_profile.updated_at = chrono::Utc::now();

        let new_profile_id = new_profile.id.clone();
        self.profiles
            .insert(new_profile_id.clone(), new_profile.clone());

        self.emit_event(
            &app_handle,
            ProfileEvent {
                event_type: ProfileEventType::Created,
                profile_id: new_profile_id.clone(),
                profile: Some(new_profile),
            },
        )?;

        Ok(new_profile_id)
    }

    pub async fn create_template<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        template: ProfileTemplate,
    ) -> AppResult<String> {
        let template_id = template.id.clone();
        let mut templates = self.templates.write().await;
        templates.push(template);
        drop(templates);

        Ok(template_id)
    }

    pub async fn get_templates(&self) -> Vec<ProfileTemplate> {
        self.templates.read().await.clone()
    }

    pub async fn get_template(&self, template_id: &str) -> Option<ProfileTemplate> {
        self.templates
            .read()
            .await
            .iter()
            .find(|t| t.id == template_id)
            .cloned()
    }

    pub async fn apply_template<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        template_id: &str,
        profile_name: String,
    ) -> AppResult<String> {
        let template = self
            .get_template(template_id)
            .ok_or_else(|| AppError::Other(format!("Template not found: {}", template_id)))?;

        let mut profile = template.profile.clone();
        profile.id = uuid::Uuid::new_v4().to_string();
        profile.name = profile_name;
        profile.profile_type = ProfileType::Custom;
        profile.is_readonly = false;

        self.create_profile(app_handle, profile).await
    }

    pub async fn save_profiles_to_disk(&self) -> AppResult<()> {
        let profiles_dir = self.profiles_dir.read().await;

        if !profiles_dir.exists() {
            std::fs::create_dir_all(&*profiles_dir)?;
        }

        for profile_entry in self.profiles.iter() {
            if profile_entry.is_readonly {
                continue;
            }

            let profile_path = profiles_dir.join(format!("{}.json", profile_entry.id));
            let content = serde_json::to_string_pretty(&*profile_entry)
                .map_err(|e| AppError::Other(format!("Failed to serialize profile: {}", e)))?;

            std::fs::write(&profile_path, content)?;
        }

        Ok(())
    }

    pub async fn load_profiles_from_disk(&self) -> AppResult<()> {
        let profiles_dir = self.profiles_dir.read().await;

        if !profiles_dir.exists() {
            return Ok(());
        }

        for entry in std::fs::read_dir(&*profiles_dir)? {
            let entry = entry?;
            let path = entry.path();

            if path.extension().and_then(|s| s.to_str()) == Some("json") {
                if let Ok(content) = std::fs::read_to_string(&path) {
                    if let Ok(profile) = serde_json::from_str::<Profile>(&content) {
                        self.profiles.insert(profile.id.clone(), profile);
                    }
                }
            }
        }

        Ok(())
    }

    fn emit_event<R: Runtime>(
        &self,
        app_handle: &AppHandle<R>,
        event: ProfileEvent,
    ) -> AppResult<()> {
        app_handle
            .emit("profile-event", event)
            .map_err(|e| AppError::Other(format!("Failed to emit profile event: {}", e)))?;
        Ok(())
    }

    pub async fn search_profiles(&self, query: &str) -> Vec<Profile> {
        let query_lower = query.to_lowercase();
        self.profiles
            .iter()
            .filter(|p| {
                p.name.to_lowercase().contains(&query_lower)
                    || p.description
                        .as_ref()
                        .map(|d| d.to_lowercase().contains(&query_lower))
                        .unwrap_or(false)
                    || p.tags
                        .iter()
                        .any(|t| t.to_lowercase().contains(&query_lower))
            })
            .map(|p| p.clone())
            .collect()
    }
}
