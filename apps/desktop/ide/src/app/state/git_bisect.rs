use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BisectStep {
    pub commit_hash: String,
    pub message: String,
    pub author: String,
    pub date: String,
    pub result: BisectResult,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum BisectResult {
    Good,
    Bad,
    Skip,
    Pending,
}

#[derive(Debug, Clone, Default)]
pub struct GitBisectState {
    pub is_active: bool,
    pub start_commit: Option<String>,
    pub end_commit: Option<String>,
    pub current_commit: Option<String>,
    pub steps: Vec<BisectStep>,
    pub status: BisectStatus,
    pub file_to_test: Option<String>,
    pub test_command: Option<String>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum BisectStatus {
    Idle,
    Running,
    Found,
    Aborted,
}

impl GitBisectState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn start(&mut self, start: String, end: String) {
        self.is_active = true;
        self.start_commit = Some(start);
        self.end_commit = Some(end);
        self.status = BisectStatus::Running;
        self.steps.clear();
    }

    pub fn record_result(&mut self, commit: String, result: BisectResult) {
        self.steps.push(BisectStep {
            commit_hash: commit.clone(),
            message: String::new(),
            author: String::new(),
            date: String::new(),
            result,
        });
        self.current_commit = Some(commit);
    }

    pub fn mark_found(&mut self) {
        self.status = BisectStatus::Found;
    }

    pub fn abort(&mut self) {
        self.is_active = false;
        self.status = BisectStatus::Aborted;
        self.steps.clear();
    }

    pub fn reset(&mut self) {
        self.is_active = false;
        self.start_commit = None;
        self.end_commit = None;
        self.current_commit = None;
        self.steps.clear();
        self.status = BisectStatus::Idle;
    }
}
