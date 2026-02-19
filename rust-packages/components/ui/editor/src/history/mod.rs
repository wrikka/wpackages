use crate::error::{HistoryError, HistoryResult};
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TextOperation {
    Insert {
        position: usize,
        text: String,
    },
    Remove {
        position: usize,
        text: String,
    },
    Replace {
        position: usize,
        old_text: String,
        new_text: String,
    },
}

impl TextOperation {
    pub fn insert(position: usize, text: String) -> Self {
        Self::Insert { position, text }
    }

    pub fn remove(position: usize, text: String) -> Self {
        Self::Remove { position, text }
    }

    pub fn replace(position: usize, old_text: String, new_text: String) -> Self {
        Self::Replace {
            position,
            old_text,
            new_text,
        }
    }

    pub fn reverse(&self) -> Self {
        match self {
            Self::Insert { position, text } => Self::Remove {
                position: *position,
                text: text.clone(),
            },
            Self::Remove { position, text } => Self::Insert {
                position: *position,
                text: text.clone(),
            },
            Self::Replace {
                position,
                old_text,
                new_text,
            } => Self::Replace {
                position: *position,
                old_text: new_text.clone(),
                new_text: old_text.clone(),
            },
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    operation: TextOperation,
    timestamp: u64,
}

impl HistoryEntry {
    pub fn new(operation: TextOperation) -> Self {
        Self {
            operation,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        }
    }

    pub fn operation(&self) -> &TextOperation {
        &self.operation
    }

    pub fn timestamp(&self) -> u64 {
        self.timestamp
    }
}

#[derive(Debug, Clone)]
pub struct HistoryManager {
    undo_stack: VecDeque<HistoryEntry>,
    redo_stack: VecDeque<HistoryEntry>,
    limit: usize,
    group_level: usize,
}

impl HistoryManager {
    pub fn new() -> Self {
        Self {
            undo_stack: VecDeque::new(),
            redo_stack: VecDeque::new(),
            limit: 1000,
            group_level: 0,
        }
    }

    pub fn with_limit(limit: usize) -> Self {
        Self {
            undo_stack: VecDeque::new(),
            redo_stack: VecDeque::new(),
            limit,
            group_level: 0,
        }
    }

    pub fn push(&mut self, operation: TextOperation) -> HistoryResult<()> {
        if self.undo_stack.len() >= self.limit {
            self.undo_stack.pop_front();
        }
        self.undo_stack.push_back(HistoryEntry::new(operation));
        self.redo_stack.clear();
        Ok(())
    }

    pub fn push_group<F>(&mut self, f: F) -> HistoryResult<()>
    where
        F: FnOnce(&mut Self) -> HistoryResult<()>,
    {
        self.group_level += 1;
        let result = f(self);
        self.group_level -= 1;
        result
    }

    pub fn can_undo(&self) -> bool {
        !self.undo_stack.is_empty()
    }

    pub fn can_redo(&self) -> bool {
        !self.redo_stack.is_empty()
    }

    pub fn undo(&mut self) -> HistoryResult<TextOperation> {
        if !self.can_undo() {
            return Err(HistoryError::NoUndoHistory);
        }
        let entry = self.undo_stack.pop_back().unwrap();
        let operation = entry.operation().reverse();
        if self.redo_stack.len() >= self.limit {
            self.redo_stack.pop_front();
        }
        self.redo_stack.push_back(entry);
        Ok(operation)
    }

    pub fn redo(&mut self) -> HistoryResult<TextOperation> {
        if !self.can_redo() {
            return Err(HistoryError::NoRedoHistory);
        }
        let entry = self.redo_stack.pop_back().unwrap();
        let operation = entry.operation().clone();
        if self.undo_stack.len() >= self.limit {
            self.undo_stack.pop_front();
        }
        self.undo_stack.push_back(entry);
        Ok(operation)
    }

    pub fn clear(&mut self) {
        self.undo_stack.clear();
        self.redo_stack.clear();
    }

    pub fn undo_count(&self) -> usize {
        self.undo_stack.len()
    }

    pub fn redo_count(&self) -> usize {
        self.redo_stack.len()
    }

    pub fn set_limit(&mut self, limit: usize) {
        self.limit = limit;
        while self.undo_stack.len() > limit {
            self.undo_stack.pop_front();
        }
        while self.redo_stack.len() > limit {
            self.redo_stack.pop_front();
        }
    }

    pub fn limit(&self) -> usize {
        self.limit
    }

    pub fn is_grouping(&self) -> bool {
        self.group_level > 0
    }
}

impl Default for HistoryManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_push_and_undo() {
        let mut history = HistoryManager::new();
        history.push(TextOperation::insert(0, "Hello".to_string())).unwrap();
        assert!(history.can_undo());
        assert!(!history.can_redo());
    }

    #[test]
    fn test_undo_redo() {
        let mut history = HistoryManager::new();
        history.push(TextOperation::insert(0, "Hello".to_string())).unwrap();
        
        let undo_op = history.undo().unwrap();
        assert!(matches!(undo_op, TextOperation::Remove { .. }));
        assert!(!history.can_undo());
        assert!(history.can_redo());
        
        let redo_op = history.redo().unwrap();
        assert!(matches!(redo_op, TextOperation::Insert { .. }));
        assert!(history.can_undo());
        assert!(!history.can_redo());
    }

    #[test]
    fn test_operation_reverse() {
        let insert_op = TextOperation::insert(0, "Hello".to_string());
        let reversed = insert_op.reverse();
        assert!(matches!(reversed, TextOperation::Remove { .. }));
    }

    #[test]
    fn test_history_limit() {
        let mut history = HistoryManager::with_limit(5);
        for i in 0..10 {
            history.push(TextOperation::insert(i, format!("text{}", i))).unwrap();
        }
        assert_eq!(history.undo_count(), 5);
    }

    #[test]
    fn test_clear() {
        let mut history = HistoryManager::new();
        history.push(TextOperation::insert(0, "Hello".to_string())).unwrap();
        history.clear();
        assert!(!history.can_undo());
        assert!(!history.can_redo());
    }

    #[test]
    fn test_no_undo_history() {
        let mut history = HistoryManager::new();
        assert!(matches!(history.undo(), Err(HistoryError::NoUndoHistory)));
    }

    #[test]
    fn test_no_redo_history() {
        let mut history = HistoryManager::new();
        assert!(matches!(history.redo(), Err(HistoryError::NoRedoHistory)));
    }
}
