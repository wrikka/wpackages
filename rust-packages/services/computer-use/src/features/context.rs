//! Feature 13: Context-Aware Actions

use serde::{Deserialize, Serialize};
use crate::types::Action;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AppType { Browser, Editor, IDE, Unknown }

#[derive(Debug, Clone)]
pub struct AppContext { pub app_type: AppType, pub suggested: Vec<Action> }

pub struct ContextManager { current: Option<AppContext> }

impl ContextManager {
    pub fn new() -> Self { Self { current: None } }
    pub fn detect(&mut self, process: &str) {
        let app_type = if process.contains("chrome") { AppType::Browser }
            else if process.contains("code") { AppType::IDE }
            else { AppType::Unknown };
        self.current = Some(AppContext { app_type, suggested: vec![Action::Snapshot] });
    }
    pub fn current(&self) -> Option<&AppContext> { self.current.as_ref() }
}
impl Default for ContextManager { fn default() -> Self { Self::new() } }
