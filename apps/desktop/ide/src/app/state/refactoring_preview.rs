use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RefactoringPreview {
    pub id: String,
    pub name: String,
    pub description: String,
    pub before: String,
    pub after: String,
    pub changes: Vec<CodeChange>,
    pub risk_level: RiskLevel,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeChange {
    pub file_path: String,
    pub line_range: (usize, usize),
    pub change_type: ChangeType,
    pub content: String,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ChangeType {
    Insert,
    Delete,
    Replace,
    Move,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum RiskLevel {
    Safe,
    Low,
    Medium,
    High,
}

#[derive(Debug, Clone, Default)]
pub struct RefactoringPreviewState {
    pub previews: Vec<RefactoringPreview>,
    pub current_preview: Option<usize>,
    pub show_diff: bool,
    pub auto_apply_safe: bool,
}

impl RefactoringPreviewState {
    pub fn new() -> Self {
        Self {
            previews: Vec::new(),
            current_preview: None,
            show_diff: true,
            auto_apply_safe: false,
        }
    }

    pub fn add_preview(&mut self, preview: RefactoringPreview) {
        self.previews.push(preview);
    }

    pub fn select_preview(&mut self, index: usize) {
        if index < self.previews.len() {
            self.current_preview = Some(index);
        }
    }

    pub fn get_current(&self) -> Option<&RefactoringPreview> {
        self.current_preview
            .and_then(|idx| self.previews.get(idx))
    }

    pub fn apply_preview(&mut self, index: usize) {
        if index < self.previews.len() {
            self.previews.remove(index);
        }
    }

    pub fn discard_preview(&mut self, index: usize) {
        if index < self.previews.len() {
            self.previews.remove(index);
        }
    }

    pub fn get_safe_previews(&self) -> Vec<&RefactoringPreview> {
        self.previews.iter()
            .filter(|p| p.risk_level == RiskLevel::Safe)
            .collect()
    }
}
