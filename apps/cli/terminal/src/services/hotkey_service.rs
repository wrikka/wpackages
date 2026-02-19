use crate::error::{AppError, AppResult};
use crate::types::{
    Hotkey, HotkeyBinding, HotkeyConfig, HotkeyConflict, HotkeyContext, KeyCode, ModifierKey,
};
use dashmap::DashMap;
use serde::Serialize;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Runtime};
use tokio::sync::RwLock;

#[derive(Clone, Serialize)]
pub struct HotkeyEvent {
    pub event_type: HotkeyEventType,
    pub binding: Option<HotkeyBinding>,
    pub conflict: Option<HotkeyConflict>,
}

#[derive(Clone, Serialize)]
pub enum HotkeyEventType {
    Registered,
    Unregistered,
    ConflictDetected,
    ConflictResolved,
}

#[derive(Clone)]
pub struct HotkeyService {
    bindings: Arc<DashMap<String, HotkeyBinding>>,
    contexts: Arc<DwMap<String, HotkeyContext>>,
    config: Arc<RwLock<HotkeyConfig>>,
    active_contexts: Arc<RwLock<Vec<String>>>,
}

impl Default for HotkeyService {
    fn default() -> Self {
        Self::new()
    }
}

impl HotkeyService {
    pub fn new() -> Self {
        let service = Self {
            bindings: Arc::new(DashMap::new()),
            contexts: Arc::new(DashMap::new()),
            config: Arc::new(RwLock::new(HotkeyConfig::default())),
            active_contexts: Arc::new(RwLock::new(Vec::new())),
        };

        // Register default contexts
        tokio::spawn({
            let contexts = service.contexts.clone();
            async move {
                contexts.insert(
                    "global".to_string(),
                    HotkeyContext::new("global".to_string(), "Global".to_string()).with_priority(0),
                );
                contexts.insert(
                    "terminal".to_string(),
                    HotkeyContext::new("terminal".to_string(), "Terminal".to_string())
                        .with_priority(10),
                );
                contexts.insert(
                    "tab".to_string(),
                    HotkeyContext::new("tab".to_string(), "Tab".to_string()).with_priority(20),
                );
                contexts.insert(
                    "pane".to_string(),
                    HotkeyContext::new("pane".to_string(), "Pane".to_string()).with_priority(20),
                );
            }
        });

        service
    }

    pub async fn register_hotkey<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        binding: HotkeyBinding,
    ) -> AppResult<()> {
        let binding_id = binding.hotkey.id.as_str().to_string();

        // Check for conflicts
        let conflicts = self.find_conflicts(&binding).await;
        if !conflicts.is_empty() && !self.config.read().await.allow_overrides {
            return Err(AppError::Other(format!(
                "Hotkey conflicts detected: {}",
                conflicts.len()
            )));
        }

        self.bindings.insert(binding_id.clone(), binding.clone());

        // Emit conflict events if any
        for conflict in conflicts {
            self.emit_event(
                &app_handle,
                HotkeyEvent {
                    event_type: HotkeyEventType::ConflictDetected,
                    binding: None,
                    conflict: Some(conflict),
                },
            )?;
        }

        self.emit_event(
            &app_handle,
            HotkeyEvent {
                event_type: HotkeyEventType::Registered,
                binding: Some(binding),
                conflict: None,
            },
        )?;

        Ok(())
    }

    pub async fn unregister_hotkey<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        hotkey_id: &str,
    ) -> AppResult<()> {
        let binding = self.bindings.remove(hotkey_id);

        if let Some((_, binding)) = binding {
            self.emit_event(
                &app_handle,
                HotkeyEvent {
                    event_type: HotkeyEventType::Unregistered,
                    binding: Some(binding),
                    conflict: None,
                },
            )?;
        }

        Ok(())
    }

    pub async fn get_binding(&self, hotkey_id: &str) -> Option<HotkeyBinding> {
        self.bindings.get(hotkey_id).map(|b| b.clone())
    }

    pub async fn get_all_bindings(&self) -> Vec<HotkeyBinding> {
        self.bindings.iter().map(|b| b.clone()).collect()
    }

    pub async fn get_binding_for_hotkey(
        &self,
        modifiers: &[ModifierKey],
        key: &KeyCode,
    ) -> Option<HotkeyBinding> {
        let active_contexts = self.active_contexts.read().await;

        // Find binding in active contexts with highest priority
        let mut best_binding: Option<HotkeyBinding> = None;
        let mut best_priority = i32::MIN;

        for binding in self.bindings.iter() {
            if binding.hotkey.matches(modifiers, key) {
                if let Some(context) = &binding.when {
                    if active_contexts.contains(context) {
                        if let Some(ctx) = self.contexts.get(context) {
                            if ctx.priority > best_priority {
                                best_binding = Some(binding.clone());
                                best_priority = ctx.priority;
                            }
                        }
                    }
                } else {
                    // Global binding (no context)
                    if best_priority < 0 {
                        best_binding = Some(binding.clone());
                        best_priority = 0;
                    }
                }
            }
        }

        best_binding
    }

    pub async fn add_context(&self, context: HotkeyContext) {
        self.contexts.insert(context.id.clone(), context);
    }

    pub async fn remove_context(&self, context_id: &str) {
        self.contexts.remove(context_id);
    }

    pub async fn get_context(&self, context_id: &str) -> Option<HotkeyContext> {
        self.contexts.get(context_id).map(|c| c.clone())
    }

    pub async fn get_all_contexts(&self) -> Vec<HotkeyContext> {
        self.contexts.iter().map(|c| c.clone()).collect()
    }

    pub async fn activate_context(&self, context_id: String) {
        let mut active_contexts = self.active_contexts.write().await;
        if !active_contexts.contains(&context_id) {
            active_contexts.push(context_id);
        }
    }

    pub async fn deactivate_context(&self, context_id: &str) {
        let mut active_contexts = self.active_contexts.write().await;
        active_contexts.retain(|id| id != context_id);
    }

    pub async fn get_active_contexts(&self) -> Vec<String> {
        self.active_contexts.read().await.clone()
    }

    pub async fn find_conflicts(&self, binding: &HotkeyBinding) -> Vec<HotkeyConflict> {
        let mut conflicts = Vec::new();

        for existing_binding in self.bindings.iter() {
            if existing_binding.hotkey.modifiers == binding.hotkey.modifiers
                && existing_binding.hotkey.key == binding.hotkey.key
                && existing_binding.hotkey.id != binding.hotkey.id
            {
                conflicts.push(HotkeyConflict {
                    binding1: existing_binding.clone(),
                    binding2: binding.clone(),
                    context: binding.when.clone(),
                });
            }
        }

        conflicts
    }

    pub async fn find_all_conflicts(&self) -> Vec<HotkeyConflict> {
        let mut conflicts = Vec::new();
        let bindings: Vec<_> = self.bindings.iter().cloned().collect();

        for (i, binding1) in bindings.iter().enumerate() {
            for binding2 in bindings.iter().skip(i + 1) {
                if binding1.hotkey.modifiers == binding2.hotkey.modifiers
                    && binding1.hotkey.key == binding2.hotkey.key
                {
                    conflicts.push(HotkeyConflict {
                        binding1: binding1.clone(),
                        binding2: binding2.clone(),
                        context: binding1.when.clone(),
                    });
                }
            }
        }

        conflicts
    }

    pub async fn resolve_conflict<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        hotkey_id: &str,
        new_hotkey: Hotkey,
    ) -> AppResult<()> {
        if let Some(mut binding) = self.bindings.get_mut(hotkey_id) {
            binding.hotkey = new_hotkey.clone();
            let binding = binding.clone();

            // Check if conflict is resolved
            let conflicts = self.find_conflicts(&binding).await;
            if conflicts.is_empty() {
                self.emit_event(
                    &app_handle,
                    HotkeyEvent {
                        event_type: HotkeyEventType::ConflictResolved,
                        binding: Some(binding),
                        conflict: None,
                    },
                )?;
            }
        }

        Ok(())
    }

    pub async fn get_config(&self) -> HotkeyConfig {
        self.config.read().await.clone()
    }

    pub async fn update_config(&self, config: HotkeyConfig) {
        *self.config.write().await = config;
    }

    pub async fn reset_to_defaults(&self) {
        self.bindings.clear();
        *self.config.write().await = HotkeyConfig::default();
    }

    fn emit_event<R: Runtime>(
        &self,
        app_handle: &AppHandle<R>,
        event: HotkeyEvent,
    ) -> AppResult<()> {
        app_handle
            .emit("hotkey-event", event)
            .map_err(|e| AppError::Other(format!("Failed to emit hotkey event: {}", e)))?;
        Ok(())
    }

    pub async fn export_bindings(&self) -> AppResult<String> {
        let bindings: Vec<HotkeyBinding> = self.bindings.iter().map(|b| b.clone()).collect();
        serde_json::to_string_pretty(&bindings)
            .map_err(|e| AppError::Other(format!("Failed to export bindings: {}", e)))
    }

    pub async fn import_bindings(&self, data: &str) -> AppResult<usize> {
        let bindings: Vec<HotkeyBinding> = serde_json::from_str(data)
            .map_err(|e| AppError::Other(format!("Failed to import bindings: {}", e)))?;

        let count = bindings.len();
        for binding in bindings {
            self.bindings
                .insert(binding.hotkey.id.as_str().to_string(), binding);
        }

        Ok(count)
    }
}
