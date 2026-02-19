// Task plugin integration

use crate::services::plugin::{PluginEvent, PluginManager};
use std::sync::Arc;

pub struct TaskPluginManager {
    manager: Arc<PluginManager>,
    enabled: bool,
}

impl TaskPluginManager {
    pub fn new(manager: Arc<PluginManager>) -> Self {
        let enabled = manager.is_enabled();
        TaskPluginManager { manager, enabled }
    }

    pub fn is_enabled(&self) -> bool {
        self.enabled
    }

    pub fn emit_before_task(&self, workspace: &str, task: &str, hash: &str) {
        if !self.enabled {
            return;
        }
        let manager = self.manager.clone();
        let workspace = workspace.to_string();
        let task = task.to_string();
        let hash = hash.to_string();
        tokio::spawn(async move {
            manager.emit(PluginEvent::BeforeTask {
                workspace: &workspace,
                task: &task,
                hash: &hash,
            });
        });
    }

    pub fn emit_cache_hit(&self, workspace: &str, task: &str, hash: &str, source: &str) {
        if !self.enabled {
            return;
        }
        let manager = self.manager.clone();
        let workspace = workspace.to_string();
        let task = task.to_string();
        let hash = hash.to_string();
        let source = source.to_string();
        tokio::spawn(async move {
            manager.emit(PluginEvent::CacheHit {
                workspace: &workspace,
                task: &task,
                hash: &hash,
                source: &source,
            });
        });
    }

    pub fn emit_cache_miss(&self, workspace: &str, task: &str, hash: &str) {
        if !self.enabled {
            return;
        }
        let manager = self.manager.clone();
        let workspace = workspace.to_string();
        let task = task.to_string();
        let hash = hash.to_string();
        tokio::spawn(async move {
            manager.emit(PluginEvent::CacheMiss {
                workspace: &workspace,
                task: &task,
                hash: &hash,
            });
        });
    }

    pub fn emit_after_task(&self, workspace: &str, task: &str, hash: &str, success: bool) {
        if !self.enabled {
            return;
        }
        let manager = self.manager.clone();
        let workspace = workspace.to_string();
        let task = task.to_string();
        let hash = hash.to_string();
        tokio::spawn(async move {
            manager.emit(PluginEvent::AfterTask {
                workspace: &workspace,
                task: &task,
                hash: &hash,
                success,
            });
        });
    }
}
