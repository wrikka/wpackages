use crate::error::RsuiError;
use std::sync::Arc;

/// Focus management trait
pub trait FocusService {
    fn set_focus(&self, id: &str) -> Result<(), RsuiError>;
    fn get_focus(&self) -> Option<String>;
    fn clear_focus(&self) -> Result<(), RsuiError>;
    fn trap_focus(&self, container_id: &str) -> Result<(), RsuiError>;
    fn release_focus(&self) -> Result<(), RsuiError>;
    fn is_focus_trapped(&self) -> bool;
}

/// Focus state
#[derive(Debug, Clone)]
pub struct FocusState {
    pub current: Option<String>,
    pub trapped_container: Option<String>,
    pub focus_history: Vec<String>,
}

impl Default for FocusState {
    fn default() -> Self {
        Self {
            current: None,
            trapped_container: None,
            focus_history: Vec::new(),
        }
    }
}

impl FocusState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn push_history(&mut self, id: String) {
        if let Some(current) = &self.current {
            if current != &id {
                self.focus_history.push(current.clone());
            }
        }
    }

    pub fn pop_history(&mut self) -> Option<String> {
        self.focus_history.pop()
    }
}

/// Default focus service implementation
pub struct DefaultFocusService {
    state: Arc<std::sync::RwLock<FocusState>>,
}

impl DefaultFocusService {
    fn default() -> Self {
        Self {
            state: Arc::new(std::sync::RwLock::new(FocusState::new())),
        }
    }
}

impl FocusService for DefaultFocusService {
    fn set_focus(&self, id: &str) -> Result<(), RsuiError> {
        let mut state = self.state.write().map_err(|e| RsuiError::State(e.to_string()))?;
        
        let current = state.current.clone();
        if let Some(current) = current {
            if current != id {
                state.push_history(current);
            }
        }
        
        state.current = Some(id.to_string());
        Ok(())
    }

    fn get_focus(&self) -> Option<String> {
        let state = self.state.read().ok()?;
        state.current.clone()
    }

    fn clear_focus(&self) -> Result<(), RsuiError> {
        let mut state = self.state.write().map_err(|e| RsuiError::State(e.to_string()))?;
        state.current = None;
        Ok(())
    }

    fn trap_focus(&self, container_id: &str) -> Result<(), RsuiError> {
        let mut state = self.state.write().map_err(|e| RsuiError::State(e.to_string()))?;
        state.trapped_container = Some(container_id.to_string());
        Ok(())
    }

    fn release_focus(&self) -> Result<(), RsuiError> {
        let mut state = self.state.write().map_err(|e| RsuiError::State(e.to_string()))?;
        state.trapped_container = None;
        Ok(())
    }

    fn is_focus_trapped(&self) -> bool {
        self.state
            .read()
            .ok()
            .map_or(false, |state| state.trapped_container.is_some())
    }
}

/// Focus utility functions
pub fn focus_next(current: &str, focusable_ids: &[String]) -> Option<String> {
    let index = focusable_ids.iter().position(|id| id == current)?;
    let next_index = (index + 1) % focusable_ids.len();
    Some(focusable_ids[next_index].clone())
}

pub fn focus_previous(current: &str, focusable_ids: &[String]) -> Option<String> {
    let index = focusable_ids.iter().position(|id| id == current)?;
    let prev_index = if index == 0 {
        focusable_ids.len() - 1
    } else {
        index - 1
    };
    Some(focusable_ids[prev_index].clone())
}

pub fn focus_first(focusable_ids: &[String]) -> Option<String> {
    focusable_ids.first().cloned()
}

pub fn focus_last(focusable_ids: &[String]) -> Option<String> {
    focusable_ids.last().cloned()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_focus_state() {
        let mut state = FocusState::new();
        
        assert!(state.current.is_none());
        assert!(state.trapped_container.is_none());
        
        state.push_history("button1".to_string());
        assert_eq!(state.focus_history, vec!["button1"]);
        
        let prev = state.pop_history();
        assert_eq!(prev, Some("button1".to_string()));
    }

    #[test]
    fn test_focus_navigation() {
        let ids = vec!["button1".to_string(), "button2".to_string(), "button3".to_string()];
        
        assert_eq!(focus_next("button1", &ids), Some("button2".to_string()));
        assert_eq!(focus_next("button3", &ids), Some("button1".to_string()));
        assert_eq!(focus_previous("button1", &ids), Some("button3".to_string()));
        assert_eq!(focus_previous("button2", &ids), Some("button1".to_string()));
        assert_eq!(focus_first(&ids), Some("button1".to_string()));
        assert_eq!(focus_last(&ids), Some("button3".to_string()));
    }

    #[test]
    fn test_default_focus_service() {
        let service = DefaultFocusService::default();
        
        assert!(service.set_focus("button1").is_ok());
        assert_eq!(service.get_focus(), Some("button1".to_string()));
        
        assert!(service.trap_focus("modal").is_ok());
        assert!(service.is_focus_trapped());
        
        assert!(service.release_focus().is_ok());
        assert!(!service.is_focus_trapped());
        
        assert!(service.clear_focus().is_ok());
        assert!(service.get_focus().is_none());
    }
}
