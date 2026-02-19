//! Common types for tui-components

use serde::{Deserialize, Serialize};
use std::fmt;

/// Application mode
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum AppMode {
    Normal,
    Insert,
    Command,
    Search,
    Plan,
}

impl fmt::Display for AppMode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.name())
    }
}

impl AppMode {
    pub fn name(&self) -> &str {
        match self {
            AppMode::Normal => "NORMAL",
            AppMode::Insert => "INSERT",
            AppMode::Command => "COMMAND",
            AppMode::Search => "SEARCH",
            AppMode::Plan => "PLAN",
        }
    }
}

/// Focus panel
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum FocusPanel {
    CommandPalette,
    FileExplorer,
    ChatPanel,
    OutputDisplay,
    InputField,
    PlanPanel,
}

impl FocusPanel {
    pub fn name(&self) -> &str {
        match self {
            FocusPanel::CommandPalette => "Command Palette",
            FocusPanel::FileExplorer => "File Explorer",
            FocusPanel::ChatPanel => "Chat Panel",
            FocusPanel::OutputDisplay => "Output Display",
            FocusPanel::InputField => "Input Field",
            FocusPanel::PlanPanel => "Plan Panel",
        }
    }
}

/// Execution mode
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ExecutionMode {
    Plan,
    Build,
}

/// Plan status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum PlanStatus {
    Generating,
    Ready,
    Executing,
    Completed,
    Failed,
}

/// Execution plan step (stub)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlanStep {
    pub step_number: usize,
    pub description: String,
    pub approved: bool,
}

/// Execution plan (stub)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionPlan {
    pub id: String,
    pub description: String,
    pub status: PlanStatus,
    pub steps: Vec<PlanStep>,
}

/// Command ID (stub)
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct CommandId(pub String);

impl CommandId {
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for CommandId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl From<&str> for CommandId {
    fn from(s: &str) -> Self {
        Self(s.to_string())
    }
}

impl From<String> for CommandId {
    fn from(s: String) -> Self {
        Self(s)
    }
}

/// Command name (stub)
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct CommandName(pub String);

impl CommandName {
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for CommandName {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl<S> From<S> for CommandName
where
    S: Into<String>,
{
    fn from(s: S) -> Self {
        Self(s.into())
    }
}

/// Command description (stub)
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct CommandDescription(pub String);

impl CommandDescription {
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for CommandDescription {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl<S> From<S> for CommandDescription
where
    S: Into<String>,
{
    fn from(s: S) -> Self {
        Self(s.into())
    }
}

/// Shortcut (stub)
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Shortcut(pub String);

impl Shortcut {
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl<S> From<S> for Shortcut
where
    S: Into<String>,
{
    fn from(s: S) -> Self {
        Self(s.into())
    }
}

/// Match score (stub)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchScore(pub f64);

impl MatchScore {
    pub fn value(&self) -> f64 {
        self.0
    }
}

impl<S> From<S> for MatchScore
where
    S: Into<f64>,
{
    fn from(s: S) -> Self {
        Self(s.into())
    }
}

/// Match indices (stub)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchIndices(pub Vec<usize>);

impl MatchIndices {
    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }

    pub fn iter(&self) -> std::slice::Iter<'_, usize> {
        self.0.iter()
    }
}

impl<S> From<S> for MatchIndices
where
    S: Into<Vec<usize>>,
{
    fn from(s: S) -> Self {
        Self(s.into())
    }
}
