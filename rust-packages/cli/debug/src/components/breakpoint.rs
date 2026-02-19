use crate::error::{DebugError, DebugResult};
use crate::types::SourceLocation;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

/// Breakpoint
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Breakpoint {
    pub id: String,
    pub source: SourceLocation,
    pub enabled: bool,
    pub condition: Option<String>,
    pub hit_condition: Option<HitCondition>,
    pub log_message: Option<String>,
}

impl Breakpoint {
    pub fn new(source: SourceLocation) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            source,
            enabled: true,
            condition: None,
            hit_condition: None,
            log_message: None,
        }
    }

    pub fn with_enabled(mut self, enabled: bool) -> Self {
        self.enabled = enabled;
        self
    }

    pub fn with_condition(mut self, condition: impl Into<String>) -> Self {
        self.condition = Some(condition.into());
        self
    }

    pub fn with_hit_condition(mut self, condition: HitCondition) -> Self {
        self.hit_condition = Some(condition);
        self
    }

    pub fn with_log_message(mut self, message: impl Into<String>) -> Self {
        self.log_message = Some(message.into());
        self
    }

    pub fn is_conditional(&self) -> bool {
        self.condition.is_some() || self.hit_condition.is_some()
    }

    pub fn is_logpoint(&self) -> bool {
        self.log_message.is_some()
    }
}

/// Hit condition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HitCondition {
    pub condition: HitConditionType,
    pub value: i64,
}

impl HitCondition {
    pub fn new(condition: HitConditionType, value: i64) -> Self {
        Self { condition, value }
    }
}

/// Hit condition type
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum HitConditionType {
    GreaterThan,
    GreaterThanOrEqual,
    Equal,
    LessThan,
    LessThanOrEqual,
    Modulo,
}

/// Breakpoint state
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum BreakpointState {
    Unverified,
    Verified,
    Error,
}

/// Breakpoint manager
#[derive(Debug, Clone)]
pub struct BreakpointManager {
    breakpoints: Arc<Mutex<Vec<Breakpoint>>>,
    states: Arc<Mutex<HashMap<String, BreakpointState>>>,
}

impl BreakpointManager {
    pub fn new() -> Self {
        Self {
            breakpoints: Arc::new(Mutex::new(Vec::new())),
            states: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn add(&self, breakpoint: Breakpoint) -> DebugResult<()> {
        let mut breakpoints = self.breakpoints.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        breakpoints.push(breakpoint);
        Ok(())
    }

    pub fn remove(&self, id: &str) -> DebugResult<Breakpoint> {
        let mut breakpoints = self.breakpoints.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        let mut states = self.states.lock().map_err(|e| DebugError::Other(e.to_string()))?;

        let index = breakpoints
            .iter()
            .position(|b| b.id == id)
            .ok_or_else(|| DebugError::BreakpointNotFound)?;

        let breakpoint = breakpoints.remove(index);
        states.remove(id);

        Ok(breakpoint)
    }

    pub fn get(&self, id: &str) -> DebugResult<Breakpoint> {
        let breakpoints = self.breakpoints.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        breakpoints
            .iter()
            .find(|b| b.id == id)
            .cloned()
            .ok_or_else(|| DebugError::BreakpointNotFound)
    }

    pub fn get_all(&self) -> DebugResult<Vec<Breakpoint>> {
        let breakpoints = self.breakpoints.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        Ok(breakpoints.clone())
    }

    pub fn get_enabled(&self) -> DebugResult<Vec<Breakpoint>> {
        let breakpoints = self.breakpoints.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        Ok(breakpoints.iter().filter(|b| b.enabled).cloned().collect())
    }

    pub fn get_for_source(&self, uri: &lsp_types::Url) -> DebugResult<Vec<Breakpoint>> {
        let breakpoints = self.breakpoints.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        Ok(breakpoints
            .iter()
            .filter(|b| b.source.uri == *uri)
            .cloned()
            .collect())
    }

    pub fn set_state(&self, id: &str, state: BreakpointState) -> DebugResult<()> {
        let mut states = self.states.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        states.insert(id.to_string(), state);
        Ok(())
    }

    pub fn get_state(&self, id: &str) -> DebugResult<BreakpointState> {
        let states = self.states.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        Ok(states.get(id).copied().unwrap_or(BreakpointState::Unverified))
    }

    pub fn toggle(&self, id: &str) -> DebugResult<bool> {
        let mut breakpoints = self.breakpoints.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        let breakpoint = breakpoints
            .iter_mut()
            .find(|b| b.id == id)
            .ok_or_else(|| DebugError::BreakpointNotFound)?;

        breakpoint.enabled = !breakpoint.enabled;
        Ok(breakpoint.enabled)
    }

    pub fn clear(&self) -> DebugResult<()> {
        let mut breakpoints = self.breakpoints.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        let mut states = self.states.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        breakpoints.clear();
        states.clear();
        Ok(())
    }

    pub fn count(&self) -> DebugResult<usize> {
        let breakpoints = self.breakpoints.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        Ok(breakpoints.len())
    }

    pub fn is_empty(&self) -> DebugResult<bool> {
        let breakpoints = self.breakpoints.lock().map_err(|e| DebugError::Other(e.to_string()))?;
        Ok(breakpoints.is_empty())
    }
}

impl Default for BreakpointManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_breakpoint() {
        let uri = lsp_types::Url::parse("file:///test.rs").unwrap();
        let bp = Breakpoint::new(SourceLocation::new(uri, 10, 5))
            .with_condition("x > 0")
            .with_enabled(true);

        assert_eq!(bp.source.line, 10);
        assert!(bp.enabled);
        assert!(bp.is_conditional());
    }

    #[test]
    fn test_breakpoint_manager() {
        let manager = BreakpointManager::new();

        let uri = lsp_types::Url::parse("file:///test.rs").unwrap();
        let bp = Breakpoint::new(SourceLocation::new(uri, 10, 5));

        manager.add(bp.clone()).unwrap();
        assert_eq!(manager.count().unwrap(), 1);

        let retrieved = manager.get(&bp.id).unwrap();
        assert_eq!(retrieved.id, bp.id);

        manager.remove(&bp.id).unwrap();
        assert_eq!(manager.count().unwrap(), 0);
    }

    #[test]
    fn test_breakpoint_toggle() {
        let manager = BreakpointManager::new();

        let uri = lsp_types::Url::parse("file:///test.rs").unwrap();
        let bp = Breakpoint::new(SourceLocation::new(uri, 10, 5));

        manager.add(bp).unwrap();
        manager.toggle(&bp.id).unwrap();

        let retrieved = manager.get(&bp.id).unwrap();
        assert!(!retrieved.enabled);
    }
}
