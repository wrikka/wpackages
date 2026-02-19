//! types/improvement.rs

/// Represents a suggested code change to improve performance.
#[derive(Debug, Clone)]
pub struct CodeChangeSuggestion {
    pub file_path: String,
    pub suggestion: String, // e.g., a git diff or a natural language description.
}
