use crate::types::git_workflow::{GitWorkflowClient, PullRequest, PullRequestState};

#[derive(Debug, Clone, Default)]
pub struct GitWorkflowState {
    pub client: GitWorkflowClient,
    pub active_workflow: Option<String>,
    pub workflows: Vec<String>,
    pub pull_requests: Vec<PullRequest>,
    pub current_pr: Option<PullRequest>,
}

impl GitWorkflowState {
    pub fn new() -> Self {
        Self {
            client: GitWorkflowClient::new(),
            active_workflow: None,
            workflows: Vec::new(),
            pull_requests: Vec::new(),
            current_pr: None,
        }
    }

    pub fn with_client(mut self, client: GitWorkflowClient) -> Self {
        self.client = client;
        self
    }

    pub fn with_active_workflow(mut self, workflow: String) -> Self {
        self.active_workflow = Some(workflow);
        self
    }

    pub fn with_workflows(mut self, workflows: Vec<String>) -> Self {
        self.workflows = workflows;
        self
    }

    pub fn with_pull_requests(mut self, prs: Vec<PullRequest>) -> Self {
        self.pull_requests = prs;
        self
    }

    pub fn with_current_pr(mut self, pr: PullRequest) -> Self {
        self.current_pr = Some(pr);
        self
    }

    pub fn set_active_workflow(&mut self, workflow: String) {
        self.active_workflow = Some(workflow);
    }

    pub fn add_workflow(&mut self, workflow: String) {
        self.workflows.push(workflow);
    }

    pub fn add_pull_request(&mut self, pr: PullRequest) {
        self.pull_requests.push(pr);
    }

    pub fn set_current_pr(&mut self, pr: PullRequest) {
        self.current_pr = Some(pr);
    }

    pub fn get_workflow_names(&self) -> Vec<String> {
        self.workflows.clone()
    }

    pub fn get_open_prs(&self) -> Vec<&PullRequest> {
        self.pull_requests
            .iter()
            .filter(|pr| pr.is_open())
            .collect()
    }

    pub fn get_pr_by_number(&self, number: u64) -> Option<&PullRequest> {
        self.pull_requests.iter().find(|pr| pr.number == number)
    }

    pub fn workflow_count(&self) -> usize {
        self.workflows.len()
    }

    pub fn pr_count(&self) -> usize {
        self.pull_requests.len()
    }
}
