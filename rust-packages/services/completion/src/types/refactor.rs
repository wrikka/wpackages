use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum RefactoringType {
    ExtractFunction,
    ExtractVariable,
    InlineVariable,
    Rename,
    Simplify,
    Optimize,
    Document,
    TypeInference,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RefactorContext {
    pub file_path: Option<String>,
    pub selection_range: Option<(usize, usize, usize, usize)>,
    pub surrounding_code: String,
}

impl RefactorContext {
    pub fn new() -> Self {
        Self {
            file_path: None,
            selection_range: None,
            surrounding_code: String::new(),
        }
    }

    pub fn with_file_path(mut self, path: impl Into<String>) -> Self {
        self.file_path = Some(path.into());
        self
    }

    pub fn with_selection_range(
        mut self,
        start_line: usize,
        start_col: usize,
        end_line: usize,
        end_col: usize,
    ) -> Self {
        self.selection_range = Some((start_line, start_col, end_line, end_col));
        self
    }

    pub fn with_surrounding_code(mut self, code: impl Into<String>) -> Self {
        self.surrounding_code = code.into();
        self
    }
}

impl Default for RefactorContext {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct RefactorRequest {
    #[validate(length(min = 1, message = "Code cannot be empty"))]
    pub code: String,
    pub refactoring_type: RefactoringType,
    pub language: String,
    pub context: RefactorContext,
}

impl RefactorRequest {
    pub fn new(
        code: impl Into<String>,
        refactoring_type: RefactoringType,
        language: impl Into<String>,
    ) -> Self {
        Self {
            code: code.into(),
            refactoring_type,
            language: language.into(),
            context: RefactorContext::new(),
        }
    }

    pub fn with_context(mut self, context: RefactorContext) -> Self {
        self.context = context;
        self
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeChange {
    pub range: (usize, usize, usize, usize),
    pub old_text: String,
    pub new_text: String,
    pub change_type: ChangeType,
}

impl CodeChange {
    pub fn new(
        range: (usize, usize, usize, usize),
        old: impl Into<String>,
        new: impl Into<String>,
        change_type: ChangeType,
    ) -> Self {
        Self {
            range,
            old_text: old.into(),
            new_text: new.into(),
            change_type,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ChangeType {
    Insert,
    Delete,
    Replace,
    Move,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RefactorResponse {
    pub refactored_code: String,
    pub explanation: String,
    pub changes: Vec<CodeChange>,
    pub model: String,
}

impl RefactorResponse {
    pub fn new(
        refactored_code: impl Into<String>,
        explanation: impl Into<String>,
        model: String,
    ) -> Self {
        Self {
            refactored_code: refactored_code.into(),
            explanation: explanation.into(),
            changes: Vec::new(),
            model,
        }
    }

    pub fn with_changes(mut self, changes: Vec<CodeChange>) -> Self {
        self.changes = changes;
        self
    }

    pub fn change_count(&self) -> usize {
        self.changes.len()
    }
}
