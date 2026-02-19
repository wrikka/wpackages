use crate::error::{AppError, AppResult};
use crate::types::{
    ClipboardConfig, ClipboardFormat, ClipboardHistory, ClipboardItem, ClipboardSelection,
};
use dashmap::DashMap;
use serde::Serialize;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Runtime};
use tokio::sync::RwLock;

#[derive(Clone, Serialize)]
pub struct ClipboardEvent {
    pub event_type: ClipboardEventType,
    pub item: Option<ClipboardItem>,
    pub selection: Option<ClipboardSelection>,
}

#[derive(Clone, Serialize)]
pub enum ClipboardEventType {
    Copied,
    Pasted,
    SelectionChanged,
    HistoryUpdated,
}

#[derive(Clone)]
pub struct ClipboardService {
    history: Arc<RwLock<ClipboardHistory>>,
    config: Arc<RwLock<ClipboardConfig>>,
    current_selection: Arc<RwLock<Option<ClipboardSelection>>>,
}

impl Default for ClipboardService {
    fn default() -> Self {
        Self::new()
    }
}

impl ClipboardService {
    pub fn new() -> Self {
        Self {
            history: Arc::new(RwLock::new(ClipboardHistory::default())),
            config: Arc::new(RwLock::new(ClipboardConfig::default())),
            current_selection: Arc::new(RwLock::new(None)),
        }
    }

    pub async fn copy<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        text: String,
        format: ClipboardFormat,
    ) -> AppResult<()> {
        let config = self.config.read().await;
        if !config.history_enabled {
            return Ok(());
        }
        drop(config);

        let mut text = text;
        if self.config.read().await.strip_ansi_codes {
            text = self.strip_ansi_codes(&text);
        }

        if self.config.read().await.trim_whitespace {
            text = text.trim().to_string();
        }

        let item = ClipboardItem::new(text.clone(), format);
        let mut history = self.history.write().await;
        history.add_item(item.clone());
        drop(history);

        self.emit_event(
            &app_handle,
            ClipboardEvent {
                event_type: ClipboardEventType::Copied,
                item: Some(item),
                selection: None,
            },
        )?;

        Ok(())
    }

    pub async fn paste<R: Runtime>(&self, app_handle: AppHandle<R>) -> AppResult<Option<String>> {
        let history = self.history.read().await;
        let latest = history.get_latest().map(|item| item.content.clone());
        drop(history);

        if latest.is_some() {
            self.emit_event(
                &app_handle,
                ClipboardEvent {
                    event_type: ClipboardEventType::Pasted,
                    item: None,
                    selection: None,
                },
            )?;
        }

        Ok(latest)
    }

    pub async fn paste_from_history<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        item_id: &str,
    ) -> AppResult<Option<String>> {
        let history = self.history.read().await;
        let item = history.get_item(item_id).map(|item| item.content.clone());
        drop(history);

        if item.is_some() {
            self.emit_event(
                &app_handle,
                ClipboardEvent {
                    event_type: ClipboardEventType::Pasted,
                    item: None,
                    selection: None,
                },
            )?;
        }

        Ok(item)
    }

    pub async fn set_selection<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        selection: ClipboardSelection,
    ) -> AppResult<()> {
        *self.current_selection.write().await = Some(selection.clone());

        let config = self.config.read().await;
        if config.copy_on_select && !selection.is_empty() {
            drop(config);
            self.copy(
                app_handle,
                selection.text.clone(),
                ClipboardFormat::PlainText,
            )
            .await?;
        } else {
            self.emit_event(
                &app_handle,
                ClipboardEvent {
                    event_type: ClipboardEventType::SelectionChanged,
                    item: None,
                    selection: Some(selection),
                },
            )?;
        }

        Ok(())
    }

    pub async fn get_selection(&self) -> Option<ClipboardSelection> {
        self.current_selection.read().await.clone()
    }

    pub async fn clear_selection(&self) {
        *self.current_selection.write().await = None;
    }

    pub async fn has_selection(&self) -> bool {
        self.current_selection.read().await.is_some()
    }

    pub async fn get_history(&self) -> ClipboardHistory {
        self.history.read().await.clone()
    }

    pub async fn get_history_items(&self) -> Vec<ClipboardItem> {
        self.history.read().await.items.clone()
    }

    pub async fn search_history(&self, query: &str) -> Vec<ClipboardItem> {
        self.history.read().await.search(query)
    }

    pub async fn clear_history(&self) {
        self.history.write().await.clear();
    }

    pub async fn remove_history_item(&self, item_id: &str) {
        self.history.write().await.remove_item(item_id);
    }

    pub async fn get_config(&self) -> ClipboardConfig {
        self.config.read().await.clone()
    }

    pub async fn update_config(&self, config: ClipboardConfig) {
        *self.config.write().await = config;
    }

    pub async fn get_total_history_size(&self) -> usize {
        self.history.read().await.get_total_size()
    }

    pub async fn is_history_over_limit(&self) -> bool {
        self.history.read().await.is_over_limit()
    }

    fn strip_ansi_codes(&self, text: &str) -> String {
        // Simple ANSI code stripping
        let mut result = String::new();
        let mut chars = text.chars().peekable();

        while let Some(c) = chars.next() {
            if c == '\x1b' {
                // Skip ANSI escape sequence
                if chars.peek() == Some(&'[') {
                    chars.next(); // skip '['
                    while let Some(&c) = chars.peek() {
                        chars.next();
                        if c.is_ascii_alphabetic() {
                            break;
                        }
                    }
                }
            } else {
                result.push(c);
            }
        }

        result
    }

    fn emit_event<R: Runtime>(
        &self,
        app_handle: &AppHandle<R>,
        event: ClipboardEvent,
    ) -> AppResult<()> {
        app_handle
            .emit("clipboard-event", event)
            .map_err(|e| AppError::Other(format!("Failed to emit clipboard event: {}", e)))?;
        Ok(())
    }

    pub async fn get_recent_items(&self, count: usize) -> Vec<ClipboardItem> {
        let history = self.history.read().await;
        history.items.iter().take(count).cloned().collect()
    }
}
