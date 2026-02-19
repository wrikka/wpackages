use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InlineBlameInfo {
    pub line_number: usize,
    pub author: String,
    pub author_email: String,
    pub commit_hash: String,
    pub commit_date: String,
    pub commit_message: String,
}

#[derive(Debug, Clone, Default)]
pub struct InlineBlameState {
    pub inline_blames: Vec<InlineBlameInfo>,
    pub show_inline_blame: bool,
    pub show_author: bool,
    pub show_date: bool,
    pub show_commit: bool,
    pub max_line_length: usize,
}

impl InlineBlameState {
    pub fn new() -> Self {
        Self {
            inline_blames: Vec::new(),
            show_inline_blame: true,
            show_author: true,
            show_date: false,
            show_commit: false,
            max_line_length: 50,
        }
    }

    pub fn add_blame(&mut self, blame: InlineBlameInfo) {
        self.inline_blames.push(blame);
    }

    pub fn get_blame_for_line(&self, line_number: usize) -> Option<&InlineBlameInfo> {
        self.inline_blames.iter().find(|b| b.line_number == line_number)
    }

    pub fn format_blame(&self, blame: &InlineBlameInfo) -> String {
        let mut parts = Vec::new();

        if self.show_author {
            parts.push(blame.author.clone());
        }

        if self.show_date {
            parts.push(blame.commit_date.clone());
        }

        if self.show_commit {
            parts.push(blame.commit_hash[..7].to_string());
        }

        let result = parts.join(" • ");
        if result.len() > self.max_line_length {
            format!("{}...", &result[..self.max_line_length - 3])
        } else {
            result
        }
    }

    pub fn clear_blames(&mut self) {
        self.inline_blames.clear();
    }
}
