use crate::error::Result;
use crate::types::{Workflow, WorkflowStep};
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::RwLock;

#[async_trait]
pub trait WorkflowService: Send + Sync {
    async fn create(&self, name: &str) -> Result<Workflow>;
    async fn get(&self, id: &str) -> Result<Option<Workflow>>;
    async fn list(&self) -> Result<Vec<Workflow>>;
    async fn delete(&self, id: &str) -> Result<()>;
    async fn add_step(&self, workflow_id: &str, step: WorkflowStep) -> Result<()>;
    async fn execute(&self, workflow_id: &str, session_id: &str) -> Result<()>;
    async fn record(
        &self,
        session_id: &str,
        action: &str,
        selector: Option<&str>,
        value: Option<&str>,
    ) -> Result<WorkflowStep>;
}

pub struct InMemoryWorkflowService {
    workflows: RwLock<HashMap<String, Workflow>>,
    recording_sessions: RwLock<HashMap<String, Vec<WorkflowStep>>>,
}

impl InMemoryWorkflowService {
    pub fn new() -> Self {
        Self {
            workflows: RwLock::new(HashMap::new()),
            recording_sessions: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryWorkflowService {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl WorkflowService for InMemoryWorkflowService {
    async fn create(&self, name: &str) -> Result<Workflow> {
        let id = uuid::Uuid::new_v4().to_string();
        let workflow = Workflow::new(&id, name);
        Ok(workflow)
    }

    async fn get(&self, id: &str) -> Result<Option<Workflow>> {
        Ok(self.workflows.read().unwrap().get(id).cloned())
    }

    async fn list(&self) -> Result<Vec<Workflow>> {
        Ok(self.workflows.read().unwrap().values().cloned().collect())
    }

    async fn delete(&self, id: &str) -> Result<()> {
        self.workflows.write().unwrap().remove(id);
        Ok(())
    }

    async fn add_step(&self, workflow_id: &str, step: WorkflowStep) -> Result<()> {
        if let Some(workflow) = self.workflows.write().unwrap().get_mut(workflow_id) {
            workflow.add_step(step);
        }
        Ok(())
    }

    async fn execute(&self, _workflow_id: &str, _session_id: &str) -> Result<()> {
        Ok(())
    }

    async fn record(
        &self,
        session_id: &str,
        action: &str,
        selector: Option<&str>,
        value: Option<&str>,
    ) -> Result<WorkflowStep> {
        let id = uuid::Uuid::new_v4().to_string();
        let mut step = WorkflowStep::new(&id, action);
        step.selector = selector.map(|s| s.to_string());
        step.value = value.map(|v| v.to_string());
        self.recording_sessions
            .write()
            .unwrap()
            .entry(session_id.to_string())
            .or_default()
            .push(step.clone());
        Ok(step)
    }
}
