use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::time::SystemTime;

/// Represents a single filesystem event, providing details about the change.
#[doc = "An `Event` is the core data structure that the watcher emits. It contains the kind of event, the affected paths, and other metadata."]
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Event {
    pub kind: EventKind,
    pub paths: Vec<PathBuf>,
    pub time: SystemTime,
    pub metadata: Option<EventMetadata>,
}

/// Describes the kind of filesystem event that occurred.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum EventKind {
    /// A file or directory was created.
    Create,
    /// A file or directory was removed.
    Remove,
    /// A file's content or a directory's entries were modified.
    Modify(ModifyKind),
    /// A file or directory was renamed.
    Rename(RenameKind),
    /// Metadata of a file or directory was changed.
    Metadata(MetadataKind),
    /// An event that doesn't fit into the other categories, often backend-specific.
    Other,
}

/// Describes the specific nature of a modification event.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ModifyKind {
    /// Content of a file was changed.
    Content,
    /// A directory's entries were changed (e.g., file added/removed).
    Entries,
    /// The exact nature of the modification is unknown.
    Any,
}

/// Describes the specific nature of a rename event.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum RenameKind {
    /// A file/directory was renamed from the path.
    From(PathBuf),
    /// A file/directory was renamed to the path.
    To(PathBuf),
    /// A file/directory was moved from one path to another.
    Both { from: PathBuf, to: PathBuf },
    /// The exact nature of the rename is unknown.
    Any,
}

/// Describes the specific nature of a metadata change event.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum MetadataKind {
    /// Permissions were changed.
    Permissions,
    /// Ownership was changed.
    Ownership,
    /// Extended attributes were changed.
    Extended,
    /// The exact nature of the metadata change is unknown.
    Any,
}

/// Optional, detailed metadata about an event.
#[doc = "This provides deeper insight into the event, such as the process that caused it."]
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EventMetadata {
    /// The process ID that triggered the event, if available.
    pub process_id: Option<u32>,
    /// The user ID that triggered the event, if available.
    pub user_id: Option<u32>,
    /// A content hash of the file after the event.
    pub content_hash: Option<String>,
}
