//! Drag and drop support
//! 
//! Provides drag and drop functionality for UI elements

use std::collections::HashSet;

/// Drag and drop state
#[derive(Debug, Clone)]
pub enum DragDropState {
    Idle,
    Dragging {
        item_id: String,
        start_pos: (f32, f32),
        current_pos: (f32, f32),
    },
    Dropping {
        item_id: String,
        target_id: String,
    },
}

/// Drag and drop manager
pub struct DragDropManager {
    state: DragDropState,
    draggable_items: HashSet<String>,
    drop_targets: HashSet<String>,
}

impl DragDropManager {
    /// Create a new drag drop manager
    pub fn new() -> Self {
        Self {
            state: DragDropState::Idle,
            draggable_items: HashSet::new(),
            drop_targets: HashSet::new(),
        }
    }

    /// Register a draggable item
    pub fn register_draggable(&mut self, item_id: String) {
        self.draggable_items.insert(item_id);
    }

    /// Register a drop target
    pub fn register_drop_target(&mut self, target_id: String) {
        self.drop_targets.insert(target_id);
    }

    /// Start dragging
    pub fn start_drag(&mut self, item_id: String, pos: (f32, f32)) -> bool {
        if self.draggable_items.contains(&item_id) {
            self.state = DragDropState::Dragging {
                item_id,
                start_pos: pos,
                current_pos: pos,
            };
            true
        } else {
            false
        }
    }

    /// Update drag position
    pub fn update_drag(&mut self, pos: (f32, f32)) {
        if let DragDropState::Dragging { item_id, start_pos, .. } = &self.state {
            self.state = DragDropState::Dragging {
                item_id: item_id.clone(),
                start_pos: *start_pos,
                current_pos: pos,
            };
        }
    }

    /// Check if over drop target
    pub fn is_over_target(&self, target_id: &str) -> bool {
        self.drop_targets.contains(target_id)
    }

    /// Drop on target
    pub fn drop(&mut self, target_id: String) -> bool {
        if let DragDropState::Dragging { item_id, .. } = &self.state {
            if self.drop_targets.contains(&target_id) {
                self.state = DragDropState::Dropping {
                    item_id: item_id.clone(),
                    target_id: target_id.clone(),
                };
                true
            } else {
                false
            }
        } else {
            false
        }
    }

    /// Cancel drag
    pub fn cancel_drag(&mut self) {
        self.state = DragDropState::Idle;
    }

    /// Get current state
    pub fn state(&self) -> &DragDropState {
        &self.state
    }
}

impl Default for DragDropManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_drag_drop() {
        let mut manager = DragDropManager::new();
        manager.register_draggable("item1".to_string());
        manager.register_drop_target("target1".to_string());
        
        assert!(manager.start_drag("item1".to_string(), (0.0, 0.0)));
        assert!(manager.drop("target1".to_string()));
    }
}
