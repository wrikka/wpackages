use crate::{types::Task, Result};
use async_trait::async_trait;
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct WorkflowNode {
    pub task_id: Uuid,
    pub dependencies: Vec<Uuid>,
    pub status: WorkflowNodeStatus,
}

#[derive(Debug, Clone, PartialEq)]
pub enum WorkflowNodeStatus {
    Pending,
    Ready,
    Running,
    Completed,
    Failed,
    Skipped,
}

#[derive(Debug, Clone)]
pub struct Workflow {
    pub id: Uuid,
    pub name: String,
    pub nodes: HashMap<Uuid, WorkflowNode>,
    pub status: WorkflowStatus,
}

#[derive(Debug, Clone, PartialEq)]
pub enum WorkflowStatus {
    Pending,
    Running,
    Completed,
    Failed,
    Cancelled,
}

#[async_trait]
pub trait WorkflowService: Send + Sync {
    async fn create_workflow(&self, name: String, tasks: Vec<Task>) -> Result<Workflow>;
    async fn get_workflow(&self, id: Uuid) -> Result<Option<Workflow>>;
    async fn execute_workflow(&self, id: Uuid) -> Result<Workflow>;
    async fn cancel_workflow(&self, id: Uuid) -> Result<()>;
    async fn get_workflow_status(&self, id: Uuid) -> Result<Option<WorkflowStatus>>;
}

pub struct InMemoryWorkflowService {
    workflows: std::sync::Arc<tokio::sync::RwLock<HashMap<Uuid, Workflow>>>,
}

impl InMemoryWorkflowService {
    pub fn new() -> Self {
        Self {
            workflows: std::sync::Arc::new(tokio::sync::RwLock::new(HashMap::new())),
        }
    }

    fn build_dag(&self, tasks: Vec<Task>) -> HashMap<Uuid, WorkflowNode> {
        let mut nodes = HashMap::new();

        for task in tasks {
            let node = WorkflowNode {
                task_id: task.id,
                dependencies: vec![],
                status: WorkflowNodeStatus::Pending,
            };
            nodes.insert(task.id, node);
        }

        nodes
    }

    fn get_ready_nodes(&self, workflow: &Workflow) -> Vec<Uuid> {
        workflow
            .nodes
            .iter()
            .filter(|(_, node)| {
                node.status == WorkflowNodeStatus::Pending
                    && node.dependencies.iter().all(|dep_id| {
                        workflow
                            .nodes
                            .get(dep_id)
                            .map(|dep| dep.status == WorkflowNodeStatus::Completed)
                            .unwrap_or(false)
                    })
            })
            .map(|(id, _)| *id)
            .collect()
    }

    async fn execute_node(&self, workflow_id: Uuid, node_id: Uuid) -> Result<()> {
        let mut workflows = self.workflows.write().await;

        if let Some(workflow) = workflows.get_mut(&workflow_id) {
            if let Some(node) = workflow.nodes.get_mut(&node_id) {
                node.status = WorkflowNodeStatus::Running;
            }
        }

        drop(workflows);

        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

        let mut workflows = self.workflows.write().await;

        if let Some(workflow) = workflows.get_mut(&workflow_id) {
            if let Some(node) = workflow.nodes.get_mut(&node_id) {
                node.status = WorkflowNodeStatus::Completed;
            }
        }

        Ok(())
    }
}

#[async_trait]
impl WorkflowService for InMemoryWorkflowService {
    async fn create_workflow(&self, name: String, tasks: Vec<Task>) -> Result<Workflow> {
        let id = Uuid::new_v4();
        let nodes = self.build_dag(tasks);

        let workflow = Workflow {
            id,
            name,
            nodes,
            status: WorkflowStatus::Pending,
        };

        let mut workflows = self.workflows.write().await;
        workflows.insert(id, workflow.clone());

        Ok(workflow)
    }

    async fn get_workflow(&self, id: Uuid) -> Result<Option<Workflow>> {
        let workflows = self.workflows.read().await;
        Ok(workflows.get(&id).cloned())
    }

    async fn execute_workflow(&self, id: Uuid) -> Result<Workflow> {
        {
            let mut workflows = self.workflows.write().await;
            if let Some(workflow) = workflows.get_mut(&id) {
                workflow.status = WorkflowStatus::Running;
            }
        }

        loop {
            let ready_nodes = {
                let workflows = self.workflows.read().await;
                let workflow = workflows.get(&id);
                match workflow {
                    Some(w) => self.get_ready_nodes(w),
                    None => {
                        return Err(crate::error::AgentError::WorkflowNotFound {
                            workflow_id: id.to_string(),
                        })
                    }
                }
            };

            if ready_nodes.is_empty() {
                break;
            }

            for node_id in ready_nodes {
                self.execute_node(id, node_id).await?;
            }
        }

        {
            let mut workflows = self.workflows.write().await;
            if let Some(workflow) = workflows.get_mut(&id) {
                let all_completed = workflow
                    .nodes
                    .values()
                    .all(|n| n.status == WorkflowNodeStatus::Completed);
                let any_failed = workflow
                    .nodes
                    .values()
                    .any(|n| n.status == WorkflowNodeStatus::Failed);

                workflow.status = if any_failed {
                    WorkflowStatus::Failed
                } else if all_completed {
                    WorkflowStatus::Completed
                } else {
                    WorkflowStatus::Running
                };
            }
        }

        let workflows = self.workflows.read().await;
        Ok(workflows.get(&id).cloned().unwrap())
    }

    async fn cancel_workflow(&self, id: Uuid) -> Result<()> {
        let mut workflows = self.workflows.write().await;
        if let Some(workflow) = workflows.get_mut(&id) {
            workflow.status = WorkflowStatus::Cancelled;
        }
        Ok(())
    }

    async fn get_workflow_status(&self, id: Uuid) -> Result<Option<WorkflowStatus>> {
        let workflows = self.workflows.read().await;
        Ok(workflows.get(&id).map(|w| w.status.clone()))
    }
}

impl Default for InMemoryWorkflowService {
    fn default() -> Self {
        Self::new()
    }
}
