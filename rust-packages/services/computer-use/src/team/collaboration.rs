//! Team Collaboration Features
//!
//! Share scripts, snippets, and best practices across team members.

use crate::error::{Error, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::fs;
use tokio::sync::{broadcast, Mutex};
use uuid::Uuid;

/// Team collaboration manager
pub struct TeamCollaboration {
    workspace_id: String,
    members: Arc<Mutex<HashMap<String, TeamMember>>>,
    shared_scripts: Arc<Mutex<HashMap<String, SharedScript>>>,
    snippets: Arc<Mutex<HashMap<String, CodeSnippet>>>,
    comments: Arc<Mutex<Vec<Comment>>>,
    activity_log: Arc<Mutex<Vec<Activity>>>,
    sync_tx: broadcast::Sender<SyncEvent>,
    storage_path: PathBuf,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamMember {
    pub id: String,
    pub name: String,
    pub email: String,
    pub role: MemberRole,
    pub avatar: Option<String>,
    pub joined_at: u64,
    pub last_active: u64,
    pub is_online: bool,
    pub current_action: Option<String>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum MemberRole {
    Admin,
    Editor,
    Viewer,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SharedScript {
    pub id: String,
    pub name: String,
    pub description: String,
    pub author_id: String,
    pub author_name: String,
    pub workflow: serde_json::Value,
    pub tags: Vec<String>,
    pub created_at: u64,
    pub updated_at: u64,
    pub version: u32,
    pub likes: u32,
    pub forks: u32,
    pub is_public: bool,
    pub access_level: AccessLevel,
    pub forked_from: Option<String>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum AccessLevel {
    Private,
    Team,
    Public,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeSnippet {
    pub id: String,
    pub title: String,
    pub code: String,
    pub language: String,
    pub description: String,
    pub author_id: String,
    pub tags: Vec<String>,
    pub usage_count: u64,
    pub created_at: u64,
    pub updated_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Comment {
    pub id: String,
    pub target_type: String,
    pub target_id: String,
    pub author_id: String,
    pub author_name: String,
    pub content: String,
    pub created_at: u64,
    pub replies: Vec<Comment>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Activity {
    pub id: String,
    pub user_id: String,
    pub user_name: String,
    pub action: String,
    pub target_type: String,
    pub target_id: String,
    pub target_name: String,
    pub timestamp: u64,
}

#[derive(Debug, Clone)]
pub enum SyncEvent {
    MemberJoined { member: TeamMember },
    MemberLeft { member_id: String },
    ScriptAdded { script: SharedScript },
    ScriptUpdated { script_id: String },
    SnippetAdded { snippet: CodeSnippet },
    CommentAdded { comment: Comment },
    ActivityLogged { activity: Activity },
}

impl TeamCollaboration {
    pub fn new(workspace_id: String, storage_path: PathBuf) -> Self {
        let (sync_tx, _) = broadcast::channel(100);
        
        Self {
            workspace_id,
            members: Arc::new(Mutex::new(HashMap::new())),
            shared_scripts: Arc::new(Mutex::new(HashMap::new())),
            snippets: Arc::new(Mutex::new(HashMap::new())),
            comments: Arc::new(Mutex::new(vec![])),
            activity_log: Arc::new(Mutex::new(vec![])),
            sync_tx,
            storage_path,
        }
    }

    pub async fn initialize(&self) -> Result<()> {
        fs::create_dir_all(&self.storage_path).await.map_err(|e| Error::Io(e))?;
        self.load_data().await?;
        Ok(())
    }

    /// Add team member
    pub async fn add_member(&self, member: TeamMember) -> Result<String> {
        let id = member.id.clone();
        self.members.lock().await.insert(id.clone(), member.clone());
        
        self.log_activity(&member.id, &member.name, "joined", "workspace", &self.workspace_id, &self.workspace_id).await;
        let _ = self.sync_tx.send(SyncEvent::MemberJoined { member });
        
        self.save_members().await?;
        Ok(id)
    }

    /// Remove team member
    pub async fn remove_member(&self, member_id: &str) -> Result<()> {
        if let Some(member) = self.members.lock().await.remove(member_id) {
            self.log_activity(member_id, &member.name, "left", "workspace", &self.workspace_id, &self.workspace_id).await;
            let _ = self.sync_tx.send(SyncEvent::MemberLeft { member_id: member_id.to_string() });
        }
        self.save_members().await?;
        Ok(())
    }

    /// Share a script
    pub async fn share_script(&self, mut script: SharedScript) -> Result<String> {
        let id = script.id.clone();
        script.created_at = current_timestamp();
        script.updated_at = script.created_at;
        
        self.shared_scripts.lock().await.insert(id.clone(), script.clone());
        
        self.log_activity(&script.author_id, &script.author_name, "shared", "script", &id, &script.name).await;
        let _ = self.sync_tx.send(SyncEvent::ScriptAdded { script });
        
        self.save_scripts().await?;
        Ok(id)
    }

    /// Fork a script
    pub async fn fork_script(&self, script_id: &str, new_author_id: &str, new_author_name: &str) -> Result<String> {
        let mut scripts = self.shared_scripts.lock().await;
        let original = scripts.get(script_id)
            .ok_or_else(|| Error::InvalidCommand(format!("Script {} not found", script_id)))?
            .clone();
        drop(scripts);
        
        let new_script = SharedScript {
            id: Uuid::new_uuid().to_string(),
            name: format!("{} (forked)", original.name),
            description: original.description.clone(),
            author_id: new_author_id.to_string(),
            author_name: new_author_name.to_string(),
            workflow: original.workflow.clone(),
            tags: original.tags.clone(),
            created_at: current_timestamp(),
            updated_at: current_timestamp(),
            version: 1,
            likes: 0,
            forks: 0,
            is_public: false,
            access_level: AccessLevel::Team,
            forked_from: Some(script_id.to_string()),
        };
        
        // Update fork count
        if let Some(original) = self.shared_scripts.lock().await.get_mut(script_id) {
            original.forks += 1;
        }
        
        let new_id = new_script.id.clone();
        self.shared_scripts.lock().await.insert(new_id.clone(), new_script.clone());
        
        self.log_activity(new_author_id, new_author_name, "forked", "script", &new_id, &new_script.name).await;
        
        self.save_scripts().await?;
        Ok(new_id)
    }

    /// Add code snippet
    pub async fn add_snippet(&self, mut snippet: CodeSnippet) -> Result<String> {
        let id = snippet.id.clone();
        snippet.created_at = current_timestamp();
        snippet.updated_at = snippet.created_at;
        snippet.usage_count = 0;
        
        self.snippets.lock().await.insert(id.clone(), snippet.clone());
        
        let _ = self.sync_tx.send(SyncEvent::SnippetAdded { snippet: snippet.clone() });
        
        // Log activity
        if let Some(member) = self.members.lock().await.get(&snippet.author_id) {
            self.log_activity(&snippet.author_id, &member.name, "added snippet", "snippet", &id, &snippet.title).await;
        }
        
        self.save_snippets().await?;
        Ok(id)
    }

    /// Search snippets
    pub async fn search_snippets(&self, query: &str, language: Option<&str>) -> Vec<CodeSnippet> {
        let snippets = self.snippets.lock().await;
        let query_lower = query.to_lowercase();
        
        snippets
            .values()
            .filter(|s| {
                let matches_query = s.title.to_lowercase().contains(&query_lower)
                    || s.description.to_lowercase().contains(&query_lower)
                    || s.code.to_lowercase().contains(&query_lower)
                    || s.tags.iter().any(|t| t.to_lowercase().contains(&query_lower));
                
                let matches_lang = language.map_or(true, |l| s.language == l);
                
                matches_query && matches_lang
            })
            .cloned()
            .collect()
    }

    /// Add comment
    pub async fn add_comment(&self, mut comment: Comment) -> Result<String> {
        let id = comment.id.clone();
        comment.created_at = current_timestamp();
        
        self.comments.lock().await.push(comment.clone());
        
        let _ = self.sync_tx.send(SyncEvent::CommentAdded { comment: comment.clone() });
        
        self.log_activity(&comment.author_id, &comment.author_name, "commented", &comment.target_type, &comment.target_id, &comment.content[..comment.content.len().min(50)]).await;
        
        self.save_comments().await?;
        Ok(id)
    }

    /// Get team activity feed
    pub async fn get_activity_feed(&self, limit: usize) -> Vec<Activity> {
        self.activity_log.lock().await
            .iter()
            .rev()
            .take(limit)
            .cloned()
            .collect()
    }

    /// Get member stats
    pub async fn get_member_stats(&self, member_id: &str) -> Option<MemberStats> {
        let members = self.members.lock().await;
        let member = members.get(member_id)?;
        
        let scripts_count = self.shared_scripts.lock().await
            .values()
            .filter(|s| s.author_id == member_id)
            .count();
        
        let snippets_count = self.snippets.lock().await
            .values()
            .filter(|s| s.author_id == member_id)
            .count();
        
        Some(MemberStats {
            member_id: member_id.to_string(),
            member_name: member.name.clone(),
            scripts_shared: scripts_count,
            snippets_shared: snippets_count,
            total_likes_received: 0,
        })
    }

    /// Subscribe to sync events
    pub fn subscribe(&self) -> broadcast::Receiver<SyncEvent> {
        self.sync_tx.subscribe()
    }

    /// Get online members
    pub async fn get_online_members(&self) -> Vec<TeamMember> {
        self.members.lock().await
            .values()
            .filter(|m| m.is_online)
            .cloned()
            .collect()
    }

    /// Update member presence
    pub async fn update_presence(&self, member_id: &str, is_online: bool, current_action: Option<String>) {
        if let Some(member) = self.members.lock().await.get_mut(member_id) {
            member.is_online = is_online;
            member.current_action = current_action;
            member.last_active = current_timestamp();
        }
    }

    async fn log_activity(&self, user_id: &str, user_name: &str, action: &str, target_type: &str, target_id: &str, target_name: &str) {
        let activity = Activity {
            id: Uuid::new_uuid().to_string(),
            user_id: user_id.to_string(),
            user_name: user_name.to_string(),
            action: action.to_string(),
            target_type: target_type.to_string(),
            target_id: target_id.to_string(),
            target_name: target_name.to_string(),
            timestamp: current_timestamp(),
        };
        
        self.activity_log.lock().await.push(activity.clone());
        let _ = self.sync_tx.send(SyncEvent::ActivityLogged { activity });
    }

    // Persistence methods
    async fn save_members(&self) -> Result<()> {
        let path = self.storage_path.join("members.json");
        let json = serde_json::to_string_pretty(&*self.members.lock().await)
            .map_err(|e| Error::Protocol(e.to_string()))?;
        fs::write(path, json).await.map_err(|e| Error::Io(e))?;
        Ok(())
    }

    async fn save_scripts(&self) -> Result<()> {
        let path = self.storage_path.join("scripts.json");
        let json = serde_json::to_string_pretty(&*self.shared_scripts.lock().await)
            .map_err(|e| Error::Protocol(e.to_string()))?;
        fs::write(path, json).await.map_err(|e| Error::Io(e))?;
        Ok(())
    }

    async fn save_snippets(&self) -> Result<()> {
        let path = self.storage_path.join("snippets.json");
        let json = serde_json::to_string_pretty(&*self.snippets.lock().await)
            .map_err(|e| Error::Protocol(e.to_string()))?;
        fs::write(path, json).await.map_err(|e| Error::Io(e))?;
        Ok(())
    }

    async fn save_comments(&self) -> Result<()> {
        let path = self.storage_path.join("comments.json");
        let json = serde_json::to_string_pretty(&*self.comments.lock().await)
            .map_err(|e| Error::Protocol(e.to_string()))?;
        fs::write(path, json).await.map_err(|e| Error::Io(e))?;
        Ok(())
    }

    async fn load_data(&self) -> Result<()> {
        // Load members
        let members_path = self.storage_path.join("members.json");
        if let Ok(content) = fs::read_to_string(&members_path).await {
            if let Ok(data) = serde_json::from_str::<HashMap<String, TeamMember>>(&content) {
                *self.members.lock().await = data;
            }
        }

        // Load scripts
        let scripts_path = self.storage_path.join("scripts.json");
        if let Ok(content) = fs::read_to_string(&scripts_path).await {
            if let Ok(data) = serde_json::from_str::<HashMap<String, SharedScript>>(&content) {
                *self.shared_scripts.lock().await = data;
            }
        }

        // Load snippets
        let snippets_path = self.storage_path.join("snippets.json");
        if let Ok(content) = fs::read_to_string(&snippets_path).await {
            if let Ok(data) = serde_json::from_str::<HashMap<String, CodeSnippet>>(&content) {
                *self.snippets.lock().await = data;
            }
        }

        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemberStats {
    pub member_id: String,
    pub member_name: String,
    pub scripts_shared: usize,
    pub snippets_shared: usize,
    pub total_likes_received: u32,
}

fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}
