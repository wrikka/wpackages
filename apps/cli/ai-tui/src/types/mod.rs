//! Data structures and types

pub mod codebase;
pub mod command_id;
pub mod edit;
pub mod events;
pub mod filesystem;
pub mod item_id;
pub mod models;
pub mod plan;

// Re-exports for convenience
pub use codebase::{
    AnalysisStatus, Class, CodeFile, CodebaseAnalysis, Dependency, DependencyType, Function, Module,
};
pub use command_id::{
    CommandDescription, CommandId, CommandName, MatchIndices, MatchScore, Shortcut,
};
pub use edit::{EditOperation, EditSession, EditStatus, EditType, FileEdit, SessionStatus};
pub use events::{KeyCode, KeyEvent, KeyModifiers, MouseButton, MouseEvent, TerminalEvent};
pub use filesystem::{FileEntry, FileMetadata};
pub use item_id::{ItemDescription, ItemId, ItemName};
pub use plan::{ChangeType, ExecutionMode, ExecutionPlan, FileChange, PlanStatus, PlanStep};
