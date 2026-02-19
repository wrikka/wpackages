use crate::types::{Agent, Task};
use uuid::Uuid;

pub struct AgentComponent;

impl AgentComponent {
    pub fn create(name: String, description: Option<String>) -> Agent {
        let now = chrono::Utc::now();
        Agent {
            id: Uuid::new_v4(),
            name,
            description,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn update_name(agent: &mut Agent, name: String) {
        agent.name = name;
        agent.updated_at = chrono::Utc::now();
    }

    pub fn add_task(agent: &Agent, task: Task) -> bool {
        agent.id == task.agent_id
    }
}
