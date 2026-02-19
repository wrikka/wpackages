//! ID types for the task system
//!
//! Provides type-safe unique identifier handling with phantom types.

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Type-safe unique identifier wrapper
///
/// The phantom type parameter `T` ensures type safety at compile time,
/// preventing accidental mixing of different ID types (e.g., TaskId vs UserId).
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Id<T> {
    pub value: Uuid,
    _marker: std::marker::PhantomData<T>,
}

impl<T> Id<T> {
    /// Generate a new random UUID v4
    pub fn new() -> Self {
        Self {
            value: Uuid::new_v4(),
            _marker: std::marker::PhantomData,
        }
    }

    /// Create an ID from an existing UUID
    pub fn from_uuid(uuid: Uuid) -> Self {
        Self {
            value: uuid,
            _marker: std::marker::PhantomData,
        }
    }

    /// Parse an ID from a string representation
    pub fn parse_str(s: &str) -> Result<Self, uuid::Error> {
        Ok(Self::from_uuid(Uuid::parse_str(s)?))
    }
}

impl<T> Default for Id<T> {
    fn default() -> Self {
        Self::new()
    }
}

impl<T> std::fmt::Display for Id<T> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.value)
    }
}

impl<T> From<Uuid> for Id<T> {
    fn from(uuid: Uuid) -> Self {
        Self::from_uuid(uuid)
    }
}

impl<T> From<Id<T>> for Uuid {
    fn from(id: Id<T>) -> Self {
        id.value
    }
}

/// Marker type for task identifiers
#[derive(Debug, Clone, Copy)]
pub struct TaskMarker;

/// Marker type for job identifiers
#[derive(Debug, Clone, Copy)]
pub struct JobMarker;

/// Marker type for queue identifiers
#[derive(Debug, Clone, Copy)]
pub struct QueueMarker;

/// Type alias for task-specific IDs
pub type TypedTaskId = Id<TaskMarker>;

/// Type alias for job-specific IDs
pub type TypedJobId = Id<JobMarker>;

/// Type alias for queue-specific IDs
pub type TypedQueueId = Id<QueueMarker>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_id_new() {
        let id1: Id<TaskMarker> = Id::new();
        let id2: Id<TaskMarker> = Id::new();
        assert_ne!(id1.value, id2.value);
    }

    #[test]
    fn test_id_parse() {
        let uuid_str = "550e8400-e29b-41d4-a716-446655440000";
        let id: Id<TaskMarker> = Id::parse_str(uuid_str).unwrap();
        assert_eq!(id.value.to_string(), uuid_str);
    }

    #[test]
    fn test_id_display() {
        let id: Id<TaskMarker> = Id::new();
        let display = format!("{}", id);
        assert_eq!(display, id.value.to_string());
    }
}
