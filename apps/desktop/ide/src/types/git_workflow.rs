#[derive(Debug, Clone, Default)]
pub struct GitWorkflowClient {
    pub workflows: Vec<String>,
    pub pull_requests: Vec<PullRequest>,
}

impl GitWorkflowClient {
    pub fn new() -> Self {
        Self {
            workflows: Vec::new(),
            pull_requests: Vec::new(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct PullRequest {
    pub id: u64,
    pub number: u64,
    pub title: String,
    pub head: String,
    pub base: String,
    pub state: PullRequestState,
    pub author: String,
}

impl PullRequest {
    pub fn new(number: u64, title: String, head: String, base: String) -> Self {
        Self {
            id: number,
            number,
            title,
            head,
            base,
            state: PullRequestState::Open,
            author: String::new(),
        }
    }

    pub fn is_open(&self) -> bool {
        matches!(self.state, PullRequestState::Open)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PullRequestState {
    Open,
    Closed,
    Merged,
}
