//! # Hierarchy Direction
//!
//! Hierarchy direction enum.

use serde::{Deserialize, Serialize};

/// Hierarchy direction
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum HierarchyDirection {
    Supertypes,
    Subtypes,
    Both,
}
