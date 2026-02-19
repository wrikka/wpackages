//! Type-safe identifiers and values for items

use std::fmt;
use std::str::FromStr;

/// Type-safe item ID
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct ItemId(String);

impl ItemId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for ItemId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl FromStr for ItemId {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        if s.is_empty() {
            Err("Item ID cannot be empty".to_string())
        } else {
            Ok(ItemId(s.to_string()))
        }
    }
}

impl From<ItemId> for String {
    fn from(id: ItemId) -> Self {
        id.0
    }
}

/// Type-safe item name
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ItemName(String);

impl ItemName {
    pub fn new(name: impl Into<String>) -> Self {
        Self(name.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for ItemName {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl From<ItemName> for String {
    fn from(name: ItemName) -> Self {
        name.0
    }
}

/// Type-safe item description
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ItemDescription(String);

impl ItemDescription {
    pub fn new(desc: impl Into<String>) -> Self {
        Self(desc.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for ItemDescription {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl From<ItemDescription> for String {
    fn from(desc: ItemDescription) -> Self {
        desc.0
    }
}
