//! Multi-file edit types and structures

use serde::{Deserialize, Serialize};

/// A file edit operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEdit {
    /// File path
    pub path: String,
    /// Type of edit
    pub edit_type: EditType,
    /// Edit operations
    pub operations: Vec<EditOperation>,
    /// Whether this edit has been approved
    pub approved: bool,
    /// Edit status
    pub status: EditStatus,
}

/// Type of edit
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EditType {
    /// Insert new content
    Insert,
    /// Replace existing content
    Replace,
    /// Delete content
    Delete,
    /// Create new file
    Create,
    /// Delete file
    DeleteFile,
}

/// A single edit operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EditOperation {
    /// Line number where edit starts
    pub start_line: usize,
    /// Line number where edit ends
    pub end_line: usize,
    /// Content to insert/replace
    pub content: String,
    /// Operation description
    pub description: String,
}

/// Edit status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EditStatus {
    /// Edit is pending approval
    Pending,
    /// Edit is being applied
    Applying,
    /// Edit applied successfully
    Applied,
    /// Edit failed
    Failed,
}

/// A multi-file edit session
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EditSession {
    /// Unique session ID
    pub id: String,
    /// Session description
    pub description: String,
    /// File edits in this session
    pub edits: Vec<FileEdit>,
    /// Creation timestamp
    pub created_at: chrono::DateTime<chrono::Utc>,
    /// Session status
    pub status: SessionStatus,
}

/// Session status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SessionStatus {
    /// Session is being prepared
    Preparing,
    /// Session is ready for review
    Ready,
    /// Session is being applied
    Applying,
    /// Session completed successfully
    Completed,
    /// Session failed
    Failed,
}

impl EditSession {
    /// Create a new edit session
    pub fn new(id: String, description: String) -> Self {
        Self {
            id,
            description,
            edits: Vec::new(),
            created_at: chrono::Utc::now(),
            status: SessionStatus::Preparing,
        }
    }

    /// Add a file edit to the session
    pub fn add_edit(&mut self, edit: FileEdit) {
        self.edits.push(edit);
    }

    /// Check if all edits are approved
    pub fn all_edits_approved(&self) -> bool {
        self.edits.iter().all(|edit| edit.approved)
    }

    /// Approve a specific file edit
    pub fn approve_edit(&mut self, file_path: &str) {
        if let Some(edit) = self.edits.iter_mut().find(|e| e.path == file_path) {
            edit.approved = true;
        }
    }

    /// Approve all edits
    pub fn approve_all(&mut self) {
        for edit in &mut self.edits {
            edit.approved = true;
        }
    }

    /// Get all files that will be modified
    pub fn get_all_files(&self) -> Vec<&str> {
        self.edits.iter().map(|edit| edit.path.as_str()).collect()
    }
}
