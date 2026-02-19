use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StackedPullRequest {
    pub id: u32,
    pub number: u32,
    pub title: String,
    pub branch: String,
    pub base_branch: String,
    pub depends_on: Option<u32>,
    pub status: PrStatus,
    pub review_status: ReviewStatus,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum PrStatus {
    Open,
    Merged,
    Closed,
    Draft,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ReviewStatus {
    Pending,
    Approved,
    ChangesRequested,
    Reviewed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrStack {
    pub name: String,
    pub prs: Vec<StackedPullRequest>,
    pub base_branch: String,
}

#[derive(Debug, Clone, Default)]
pub struct StackedPrsState {
    pub stacks: Vec<PrStack>,
    pub current_stack: Option<String>,
    pub auto_rebase_enabled: bool,
    pub auto_merge_enabled: bool,
    pub ghstack_enabled: bool,
}

impl StackedPrsState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn create_stack(&mut self, name: String, base_branch: String) {
        self.stacks.push(PrStack {
            name,
            prs: Vec::new(),
            base_branch,
        });
    }

    pub fn add_pr_to_stack(&mut self, stack_name: &str, pr: StackedPullRequest) {
        if let Some(stack) = self.stacks.iter_mut().find(|s| s.name == stack_name) {
            stack.prs.push(pr);
        }
    }

    pub fn get_stack(&self, name: &str) -> Option<&PrStack> {
        self.stacks.iter().find(|s| s.name == name)
    }

    pub fn remove_stack(&mut self, name: &str) {
        self.stacks.retain(|s| s.name != name);
    }

    pub fn reorder_prs(&mut self, stack_name: &str, new_order: Vec<u32>) {
        if let Some(stack) = self.stacks.iter_mut().find(|s| s.name == stack_name) {
            let pr_map: HashMap<u32, StackedPullRequest> = stack.prs
                .drain(..)
                .map(|pr| (pr.number, pr))
                .collect();
            stack.prs = new_order.iter()
                .filter_map(|num| pr_map.get(num).cloned())
                .collect();
        }
    }

    pub fn rebase_stack(&mut self, stack_name: &str) {
        if let Some(stack) = self.stacks.iter_mut().find(|s| s.name == stack_name) {
            for pr in &mut stack.prs {
                if pr.status == PrStatus::Open {
                    pr.base_branch = stack.base_branch.clone();
                }
            }
        }
    }
}
