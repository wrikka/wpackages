use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewComment {
    pub id: String,
    pub line: usize,
    pub file_path: String,
    pub severity: ReviewSeverity,
    pub category: ReviewCategory,
    pub message: String,
    pub suggestion: Option<String>,
    pub code_snippet: String,
    pub confidence: f32,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ReviewSeverity {
    Info,
    Warning,
    Error,
    Critical,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ReviewCategory {
    Security,
    Performance,
    Style,
    Logic,
    Documentation,
    Testing,
    Maintainability,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PullRequestReview {
    pub pr_number: u32,
    pub title: String,
    pub author: String,
    pub files_changed: Vec<FileReview>,
    pub overall_score: ReviewScore,
    pub summary: String,
    pub recommendations: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileReview {
    pub path: String,
    pub additions: usize,
    pub deletions: usize,
    pub comments: Vec<ReviewComment>,
    pub complexity_score: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewScore {
    pub security: f32,
    pub performance: f32,
    pub maintainability: f32,
    pub overall: f32,
}

#[derive(Debug, Clone, Default)]
pub struct AiReviewState {
    pub current_pr: Option<PullRequestReview>,
    pub review_progress: ReviewProgress,
    pub auto_review_enabled: bool,
    pub review_templates: HashMap<String, ReviewTemplate>,
    pub custom_rules: Vec<ReviewRule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewProgress {
    pub status: ReviewStatus,
    pub files_reviewed: usize,
    pub total_files: usize,
    pub current_file: Option<String>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ReviewStatus {
    Idle,
    Analyzing,
    GeneratingComments,
    Complete,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewTemplate {
    pub name: String,
    pub categories: Vec<ReviewCategory>,
    pub severity_filter: Vec<ReviewSeverity>,
    pub custom_instructions: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewRule {
    pub id: String,
    pub name: String,
    pub pattern: String,
    pub category: ReviewCategory,
    pub severity: ReviewSeverity,
    pub enabled: bool,
}

impl AiReviewState {
    pub fn new() -> Self {
        Self {
            current_pr: None,
            review_progress: ReviewProgress {
                status: ReviewStatus::Idle,
                files_reviewed: 0,
                total_files: 0,
                current_file: None,
            },
            auto_review_enabled: false,
            review_templates: HashMap::new(),
            custom_rules: Vec::new(),
        }
    }

    pub fn add_rule(&mut self, rule: ReviewRule) {
        self.custom_rules.push(rule);
    }

    pub fn remove_rule(&mut self, id: &str) {
        self.custom_rules.retain(|r| r.id != id);
    }

    pub fn get_enabled_rules(&self) -> Vec<&ReviewRule> {
        self.custom_rules.iter().filter(|r| r.enabled).collect()
    }
}
