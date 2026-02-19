//! Command types for command palette

use crate::types::{
    CommandDescription, CommandId, CommandName, MatchIndices, MatchScore, Shortcut,
};

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum CommandCategory {
    File,
    Edit,
    Search,
    Git,
    Run,
    View,
    Help,
    AI,
}

impl CommandCategory {
    pub fn display_name(&self) -> &str {
        match self {
            CommandCategory::File => "File",
            CommandCategory::Edit => "Edit",
            CommandCategory::Search => "Search",
            CommandCategory::Git => "Git",
            CommandCategory::Run => "Run",
            CommandCategory::View => "View",
            CommandCategory::Help => "Help",
            CommandCategory::AI => "AI",
        }
    }

    pub fn icon(&self) -> &str {
        match self {
            CommandCategory::File => "📁",
            CommandCategory::Edit => "✏️",
            CommandCategory::Search => "🔍",
            CommandCategory::Git => "🔀",
            CommandCategory::Run => "▶️",
            CommandCategory::View => "👁️",
            CommandCategory::Help => "❓",
            CommandCategory::AI => "🤖",
        }
    }
}

#[derive(Debug, Clone)]
pub struct Command {
    pub id: CommandId,
    pub name: CommandName,
    pub description: CommandDescription,
    pub category: CommandCategory,
    pub shortcut: Option<Shortcut>,
}

impl Command {
    pub fn new(
        id: impl Into<CommandId>,
        name: impl Into<CommandName>,
        description: impl Into<CommandDescription>,
        category: CommandCategory,
        shortcut: Option<impl Into<Shortcut>>,
    ) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            description: description.into(),
            category,
            shortcut: shortcut.map(|s| s.into()),
        }
    }
}

#[derive(Debug, Clone)]
pub struct FuzzyMatch {
    pub score: MatchScore,
    pub indices: MatchIndices,
}

impl FuzzyMatch {
    pub fn new(score: impl Into<MatchScore>, indices: impl Into<MatchIndices>) -> Self {
        Self {
            score: score.into(),
            indices: indices.into(),
        }
    }
}
