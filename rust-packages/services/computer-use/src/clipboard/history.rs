//! Clipboard History
//!
//! Multi-item clipboard with search functionality.

use crate::error::{Error, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::fs;
use tokio::sync::{broadcast, Mutex};
use uuid::Uuid;

/// Clipboard history manager
pub struct ClipboardHistory {
    items: Arc<Mutex<Vec<ClipboardItem>>>,
    favorites: Arc<Mutex<Vec<String>>>,
    max_items: usize,
    storage_path: PathBuf,
    event_tx: broadcast::Sender<ClipboardEvent>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClipboardItem {
    pub id: String,
    pub content: String,
    pub content_type: ContentType,
    pub source_app: String,
    pub timestamp: u64,
    pub size_bytes: usize,
    pub tags: Vec<String>,
    pub is_favorite: bool,
    pub usage_count: u64,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum ContentType {
    Text,
    Html,
    Image,
    FileList,
    RichText,
    Code,
    Url,
}

#[derive(Debug, Clone)]
pub enum ClipboardEvent {
    ItemAdded { item: ClipboardItem },
    ItemRemoved { id: String },
    ItemRestored { id: String },
    Cleared,
}

impl ClipboardHistory {
    pub fn new(max_items: usize, storage_path: PathBuf) -> Self {
        let (event_tx, _) = broadcast::channel(100);
        
        Self {
            items: Arc::new(Mutex::new(vec![])),
            favorites: Arc::new(Mutex::new(vec![])),
            max_items,
            storage_path,
            event_tx,
        }
    }

    pub async fn initialize(&self) -> Result<()> {
        fs::create_dir_all(&self.storage_path).await.map_err(|e| Error::Io(e))?;
        self.load_history().await?;
        Ok(())
    }

    /// Add item to history
    pub async fn add_item(&self, content: String, content_type: ContentType, source_app: String) -> String {
        // Check for duplicates
        let items = self.items.lock().await;
        if let Some(existing) = items.iter().find(|i| i.content == content) {
            let id = existing.id.clone();
            drop(items);
            return id;
        }
        drop(items);

        let item = ClipboardItem {
            id: Uuid::new_uuid().to_string(),
            content,
            content_type,
            source_app,
            timestamp: current_timestamp(),
            size_bytes: 0,
            tags: vec![],
            is_favorite: false,
            usage_count: 0,
        };

        let id = item.id.clone();
        
        let mut items = self.items.lock().await;
        items.insert(0, item.clone());
        
        // Trim to max size
        if items.len() > self.max_items {
            items.truncate(self.max_items);
        }
        drop(items);

        let _ = self.event_tx.send(ClipboardEvent::ItemAdded { item });
        
        id
    }

    /// Get all items
    pub async fn get_items(&self, limit: usize) -> Vec<ClipboardItem> {
        self.items.lock().await.iter().take(limit).cloned().collect()
    }

    /// Search items
    pub async fn search(&self, query: &str, content_type: Option<ContentType>) -> Vec<ClipboardItem> {
        let query_lower = query.to_lowercase();
        self.items
            .lock()
            .await
            .iter()
            .filter(|item| {
                let matches_query = item.content.to_lowercase().contains(&query_lower)
                    || item.tags.iter().any(|t| t.to_lowercase().contains(&query_lower))
                    || item.source_app.to_lowercase().contains(&query_lower);
                
                let matches_type = content_type.map_or(true, |t| item.content_type == t);
                
                matches_query && matches_type
            })
            .cloned()
            .collect()
    }

    /// Get item by ID
    pub async fn get_item(&self, id: &str) -> Option<ClipboardItem> {
        self.items.lock().await.iter().find(|i| i.id == id).cloned()
    }

    /// Remove item
    pub async fn remove_item(&self, id: &str) -> Result<()> {
        let mut items = self.items.lock().await;
        let pos = items.iter().position(|i| i.id == id)
            .ok_or_else(|| Error::InvalidCommand(format!("Item {} not found", id)))?;
        items.remove(pos);
        drop(items);

        // Remove from favorites if present
        let mut favorites = self.favorites.lock().await;
        if let Some(pos) = favorites.iter().position(|f| f == id) {
            favorites.remove(pos);
        }

        let _ = self.event_tx.send(ClipboardEvent::ItemRemoved { id: id.to_string() });
        Ok(())
    }

    /// Clear all history
    pub async fn clear(&self) {
        self.items.lock().await.clear();
        self.favorites.lock().await.clear();
        let _ = self.event_tx.send(ClipboardEvent::Cleared);
    }

    /// Toggle favorite
    pub async fn toggle_favorite(&self, id: &str) -> Result<bool> {
        let mut items = self.items.lock().await;
        let item = items.iter_mut().find(|i| i.id == id)
            .ok_or_else(|| Error::InvalidCommand(format!("Item {} not found", id)))?;
        
        item.is_favorite = !item.is_favorite;
        let is_favorite = item.is_favorite;
        drop(items);

        let mut favorites = self.favorites.lock().await;
        if is_favorite {
            if !favorites.contains(&id.to_string()) {
                favorites.push(id.to_string());
            }
        } else {
            favorites.retain(|f| f != id);
        }

        Ok(is_favorite)
    }

    /// Get favorites
    pub async fn get_favorites(&self) -> Vec<ClipboardItem> {
        let favorites = self.favorites.lock().await.clone();
        let items = self.items.lock().await;
        
        favorites
            .into_iter()
            .filter_map(|id| items.iter().find(|i| i.id == id).cloned())
            .collect()
    }

    /// Add tag to item
    pub async fn add_tag(&self, id: &str, tag: &str) -> Result<()> {
        let mut items = self.items.lock().await;
        let item = items.iter_mut().find(|i| i.id == id)
            .ok_or_else(|| Error::InvalidCommand(format!("Item {} not found", id)))?;
        
        if !item.tags.contains(&tag.to_string()) {
            item.tags.push(tag.to_string());
        }
        Ok(())
    }

    /// Subscribe to events
    pub fn subscribe(&self) -> broadcast::Receiver<ClipboardEvent> {
        self.event_tx.subscribe()
    }

    /// Persist history
    pub async fn save(&self) -> Result<()> {
        let path = self.storage_path.join("history.json");
        let json = serde_json::to_string_pretty(&*self.items.lock().await)
            .map_err(|e| Error::Protocol(e.to_string()))?;
        fs::write(path, json).await.map_err(|e| Error::Io(e))?;
        Ok(())
    }

    async fn load_history(&self) -> Result<()> {
        let path = self.storage_path.join("history.json");
        if let Ok(content) = fs::read_to_string(&path).await {
            if let Ok(items) = serde_json::from_str::<Vec<ClipboardItem>>(&content) {
                *self.items.lock().await = items;
            }
        }
        Ok(())
    }
}

fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}
