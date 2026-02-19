use crate::{services::LlmBatcher, types::llm::LlmRequest,
    types::{Agent, Message, MessageRole, Task, TaskStatus},
    Result,
};
use async_trait::async_trait;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct Plan {
    pub id: Uuid,
    pub agent_id: Uuid,
    pub goal: String,
    pub steps: Vec<PlanStep>,
    pub status: PlanStatus,
}

#[derive(Debug, Clone)]
pub struct PlanStep {
    pub id: Uuid,
    pub description: String,
    pub tool: Option<String>,
    pub dependencies: Vec<Uuid>,
    pub status: PlanStepStatus,
}

#[derive(Debug, Clone, PartialEq)]
pub enum PlanStepStatus {
    Pending,
    InProgress,
    Completed,
    Failed,
    Skipped,
}

#[derive(Debug, Clone, PartialEq)]
pub enum PlanStatus {
    Pending,
    InProgress,
    Completed,
    Failed,
    Cancelled,
}

#[async_trait]
pub trait PlanningService: Send + Sync {
    async fn create_plan(
        &self,
        agent_id: Uuid,
        goal: String,
        context: Vec<Message>,
    ) -> Result<Plan>;
    async fn get_plan(&self, id: Uuid) -> Result<Option<Plan>>;
    async fn execute_plan(&self, id: Uuid) -> Result<Plan>;
    async fn update_plan_status(&self, id: Uuid, status: PlanStatus) -> Result<()>;
    async fn get_plan_status(&self, id: Uuid) -> Result<Option<PlanStatus>>;
}

pub struct InMemoryPlanningService {
    plans: std::sync::Arc<tokio::sync::RwLock<std::collections::HashMap<Uuid, Plan>>>,
    llm_batcher: LlmBatcher,
}

impl InMemoryPlanningService {
    pub fn new() -> Self {
        Self {
            plans: std::sync::Arc::new(tokio::sync::RwLock::new(std::collections::HashMap::new())),
            llm_batcher: LlmBatcher::new(),
        }
    }

    async fn decompose_goal(&self, goal: &str, _context: &[Message]) -> Result<Vec<PlanStep>> {
        let prompt = format!(
            "Based on the goal '{}', generate a detailed plan. Respond with a JSON object containing a 'steps' array. Each step should have a 'description', 'tool', and 'dependencies'.",
            goal
        );

        let request = LlmRequest {
            id: Uuid::new_v4().to_string(),
            prompt,
        };

        let response = self.llm_batcher.request(request).await;
        let steps: Vec<PlanStep> = serde_json::from_str(&response.content)
            .map_err(|e| crate::error::AgentError::PlanNotFound { plan_id: e.to_string() })?;

        Ok(steps)
    }

    async fn execute_step(&self, plan_id: Uuid, step_id: Uuid) -> Result<()> {
        let mut plans = self.plans.write().await;

        if let Some(plan) = plans.get_mut(&plan_id) {
            if let Some(step) = plan.steps.iter_mut().find(|s| s.id == step_id) {
                step.status = PlanStepStatus::InProgress;
            }
        }

        drop(plans);

        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

        let mut plans = self.plans.write().await;

        if let Some(plan) = plans.get_mut(&plan_id) {
            if let Some(step) = plan.steps.iter_mut().find(|s| s.id == step_id) {
                step.status = PlanStepStatus::Completed;
            }
        }

        Ok(())
    }

    fn get_ready_steps(&self, plan: &Plan) -> Vec<Uuid> {
        plan.steps
            .iter()
            .filter(|step| {
                step.status == PlanStepStatus::Pending
                    && step.dependencies.iter().all(|dep_id| {
                        plan.steps
                            .iter()
                            .any(|s| s.id == *dep_id && s.status == PlanStepStatus::Completed)
                    })
            })
            .map(|step| step.id)
            .collect()
    }
}

#[async_trait]
impl PlanningService for InMemoryPlanningService {
    async fn create_plan(
        &self,
        agent_id: Uuid,
        goal: String,
        context: Vec<Message>,
    ) -> Result<Plan> {
        let id = Uuid::new_v4();
        let steps = self.decompose_goal(&goal, &context).await?;

        let plan = Plan {
            id,
            agent_id,
            goal,
            steps,
            status: PlanStatus::Pending,
        };

        let mut plans = self.plans.write().await;
        plans.insert(id, plan.clone());

        Ok(plan)
    }

    async fn get_plan(&self, id: Uuid) -> Result<Option<Plan>> {
        let plans = self.plans.read().await;
        Ok(plans.get(&id).cloned())
    }

    async fn execute_plan(&self, id: Uuid) -> Result<Plan> {
        {
            let mut plans = self.plans.write().await;
            if let Some(plan) = plans.get_mut(&id) {
                plan.status = PlanStatus::InProgress;
            }
        }

        loop {
            let ready_steps = {
                let plans = self.plans.read().await;
                let plan = plans.get(&id);
                match plan {
                    Some(p) => self.get_ready_steps(p),
                    None => {
                        return Err(crate::error::AgentError::PlanNotFound {
                            plan_id: id.to_string(),
                        })
                    }
                }
            };

            if ready_steps.is_empty() {
                break;
            }

            for step_id in ready_steps {
                self.execute_step(id, step_id).await?;
            }
        }

        {
            let mut plans = self.plans.write().await;
            if let Some(plan) = plans.get_mut(&id) {
                let all_completed = plan
                    .steps
                    .iter()
                    .all(|s| s.status == PlanStepStatus::Completed);
                let any_failed = plan
                    .steps
                    .iter()
                    .any(|s| s.status == PlanStepStatus::Failed);

                plan.status = if any_failed {
                    PlanStatus::Failed
                } else if all_completed {
                    PlanStatus::Completed
                } else {
                    PlanStatus::InProgress
                };
            }
        }

        let plans = self.plans.read().await;
        Ok(plans.get(&id).cloned().unwrap())
    }

    async fn update_plan_status(&self, id: Uuid, status: PlanStatus) -> Result<()> {
        let mut plans = self.plans.write().await;
        if let Some(plan) = plans.get_mut(&id) {
            plan.status = status;
        }
        Ok(())
    }

    async fn get_plan_status(&self, id: Uuid) -> Result<Option<PlanStatus>> {
        let plans = self.plans.read().await;
        Ok(plans.get(&id).map(|p| p.status.clone()))
    }
}

impl Default for InMemoryPlanningService {
    fn default() -> Self {
        Self::new()
    }
}
