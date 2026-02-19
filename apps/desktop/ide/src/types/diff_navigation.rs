use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiffNavigationState {
    pub current_change_index: Option<usize>,
    pub total_changes: usize,
    pub changes: Vec<DiffChange>,
    pub wrap_around: bool,
    pub highlight_current: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiffChange {
    pub file_path: String,
    pub line_start: usize,
    pub line_end: usize,
    pub change_type: ChangeType,
    pub context_lines: Vec<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ChangeType {
    Addition,
    Deletion,
    Modification,
}

impl Default for DiffNavigationState {
    fn default() -> Self {
        Self {
            current_change_index: None,
            total_changes: 0,
            changes: Vec::new(),
            wrap_around: true,
            highlight_current: true,
        }
    }
}

impl DiffNavigationState {
    pub fn next_change(&mut self) -> Option<&DiffChange> {
        if self.changes.is_empty() {
            return None;
        }

        let next_index = match self.current_change_index {
            Some(idx) => {
                if idx + 1 < self.changes.len() {
                    idx + 1
                } else if self.wrap_around {
                    0
                } else {
                    return self.changes.get(idx);
                }
            }
            None => 0,
        };

        self.current_change_index = Some(next_index);
        self.changes.get(next_index)
    }

    pub fn previous_change(&mut self) -> Option<&DiffChange> {
        if self.changes.is_empty() {
            return None;
        }

        let prev_index = match self.current_change_index {
            Some(idx) => {
                if idx > 0 {
                    idx - 1
                } else if self.wrap_around {
                    self.changes.len() - 1
                } else {
                    return self.changes.get(idx);
                }
            }
            None => self.changes.len() - 1,
        };

        self.current_change_index = Some(prev_index);
        self.changes.get(prev_index)
    }

    pub fn go_to_change(&mut self, index: usize) -> Option<&DiffChange> {
        if index < self.changes.len() {
            self.current_change_index = Some(index);
            self.changes.get(index)
        } else {
            None
        }
    }

    pub fn current_change(&self) -> Option<&DiffChange> {
        self.current_change_index.and_then(|idx| self.changes.get(idx))
    }
}
