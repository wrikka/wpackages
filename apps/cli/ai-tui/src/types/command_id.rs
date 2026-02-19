//! Type-safe identifiers and values for command palette

use std::fmt;
use std::str::FromStr;

/// Type-safe command ID
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct CommandId(String);

impl CommandId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for CommandId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl FromStr for CommandId {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        if s.is_empty() {
            Err("Command ID cannot be empty".to_string())
        } else {
            Ok(CommandId(s.to_string()))
        }
    }
}

impl From<&str> for CommandId {
    fn from(s: &str) -> Self {
        CommandId(s.to_string())
    }
}

impl From<String> for CommandId {
    fn from(s: String) -> Self {
        CommandId(s)
    }
}

/// Type-safe command name
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CommandName(String);

impl CommandName {
    pub fn new(name: impl Into<String>) -> Self {
        Self(name.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for CommandName {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl From<&str> for CommandName {
    fn from(s: &str) -> Self {
        CommandName(s.to_string())
    }
}

impl From<String> for CommandName {
    fn from(s: String) -> Self {
        CommandName(s)
    }
}

/// Type-safe command description
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CommandDescription(String);

impl CommandDescription {
    pub fn new(desc: impl Into<String>) -> Self {
        Self(desc.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for CommandDescription {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl From<&str> for CommandDescription {
    fn from(s: &str) -> Self {
        CommandDescription(s.to_string())
    }
}

impl From<String> for CommandDescription {
    fn from(s: String) -> Self {
        CommandDescription(s)
    }
}

/// Type-safe keyboard shortcut
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Shortcut(String);

impl Shortcut {
    pub fn new(shortcut: impl Into<String>) -> Self {
        Self(shortcut.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for Shortcut {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl From<&str> for Shortcut {
    fn from(s: &str) -> Self {
        Shortcut(s.to_string())
    }
}

impl From<String> for Shortcut {
    fn from(s: String) -> Self {
        Shortcut(s)
    }
}

/// Type-safe match score for fuzzy matching
#[derive(Debug, Clone, Copy, PartialEq, PartialOrd)]
pub struct MatchScore(f64);

impl MatchScore {
    pub fn new(score: f64) -> Self {
        Self(score)
    }

    pub fn value(&self) -> f64 {
        self.0
    }
}

impl fmt::Display for MatchScore {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:.2}", self.0)
    }
}

impl From<f64> for MatchScore {
    fn from(score: f64) -> Self {
        Self(score)
    }
}

impl From<MatchScore> for f64 {
    fn from(score: MatchScore) -> Self {
        score.0
    }
}

/// Type-safe match indices for fuzzy matching
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MatchIndices(Vec<usize>);

impl MatchIndices {
    pub fn new(indices: Vec<usize>) -> Self {
        Self(indices)
    }

    pub fn as_slice(&self) -> &[usize] {
        &self.0
    }

    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn iter(&self) -> impl Iterator<Item = &usize> {
        self.0.iter()
    }
}

impl From<Vec<usize>> for MatchIndices {
    fn from(indices: Vec<usize>) -> Self {
        Self(indices)
    }
}

impl From<MatchIndices> for Vec<usize> {
    fn from(indices: MatchIndices) -> Self {
        indices.0
    }
}

impl IntoIterator for MatchIndices {
    type Item = usize;
    type IntoIter = std::vec::IntoIter<usize>;

    fn into_iter(self) -> Self::IntoIter {
        self.0.into_iter()
    }
}
