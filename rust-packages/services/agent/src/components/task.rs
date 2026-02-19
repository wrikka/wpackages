use crate::types::{Task, TaskStatus};
use uuid::Uuid;

pub struct TaskComponent;

impl TaskComponent {
    pub fn create(agent_id: Uuid, description: String) -> Task {
        let now = chrono::Utc::now();
        Task {
            id: Uuid::new_v4(),
            agent_id,
            description,
            status: TaskStatus::Pending,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn update_status(task: &mut Task, status: TaskStatus) {
        task.status = status;
        task.updated_at = chrono::Utc::now();
    }

    pub fn is_completed(&self, task: &Task) -> bool {
        matches!(task.status, TaskStatus::Completed)
    }

    pub fn is_failed(&self, task: &Task) -> bool {
        matches!(task.status, TaskStatus::Failed)
    }
}
