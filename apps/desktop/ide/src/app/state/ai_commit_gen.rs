use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommitSuggestion {
    pub title: String,
    pub body: String,
    pub emoji: Option<String>,
    pub type_: CommitType,
    pub scope: Option<String>,
    pub confidence: f32,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum CommitType {
    Feat,
    Fix,
    Docs,
    Style,
    Refactor,
    Perf,
    Test,
    Chore,
    Ci,
    Revert,
    Build,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StagedDiff {
    pub file_path: String,
    pub additions: Vec<String>,
    pub deletions: Vec<String>,
}

#[derive(Debug, Clone, Default)]
pub struct AiCommitGenState {
    pub suggestions: Vec<CommitSuggestion>,
    pub selected_suggestion: Option<usize>,
    pub custom_template: Option<String>,
    pub auto_generate: bool,
    pub follow_conventional_commits: bool,
    pub include_emoji: bool,
}

impl AiCommitGenState {
    pub fn new() -> Self {
        Self {
            suggestions: Vec::new(),
            selected_suggestion: None,
            custom_template: None,
            auto_generate: false,
            follow_conventional_commits: true,
            include_emoji: false,
        }
    }

    pub fn generate_suggestions(&mut self, diff: Vec<StagedDiff>) {
        self.suggestions.clear();
    }

    pub fn add_suggestion(&mut self, suggestion: CommitSuggestion) {
        self.suggestions.push(suggestion);
    }

    pub fn select_suggestion(&mut self, index: usize) {
        if index < self.suggestions.len() {
            self.selected_suggestion = Some(index);
        }
    }

    pub fn get_selected(&self) -> Option<&CommitSuggestion> {
        self.selected_suggestion
            .and_then(|idx| self.suggestions.get(idx))
    }

    pub fn format_commit(&self, suggestion: &CommitSuggestion) -> String {
        let mut parts = Vec::new();

        if self.include_emoji {
            if let Some(emoji) = &suggestion.emoji {
                parts.push(format!("{} ", emoji));
            }
        }

        parts.push(format!("{:?}", suggestion.type_).to_lowercase());

        if let Some(scope) = &suggestion.scope {
            parts.push(format!("({})", scope));
        }

        parts.push(format!(": {}", suggestion.title));

        if !suggestion.body.is_empty() {
            parts.push(format!("\n\n{}", suggestion.body));
        }

        parts.join("")
    }
}
