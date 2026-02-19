use crate::error::Result;
use crate::types::protocol::{Id, Response};
use serde_json::json;
use std::collections::HashMap;

#[derive(Debug, Clone, PartialEq)]
pub enum TaskStatus {
    Created,
    Processing,
    Completed,
    Failed,
    Cancelled,
}

#[derive(Debug, Clone)]
pub struct Task {
    pub id: String,
    pub status: TaskStatus,
    pub state: Option<serde_json::Value>,
    pub error: Option<String>,
}

pub struct TaskHandler {
    tasks: HashMap<String, Task>,
    next_id: u64,
}

impl TaskHandler {
    pub fn new() -> Self {
        Self {
            tasks: HashMap::new(),
            next_id: 0,
        }
    }

    pub fn create_task(&mut self, params: serde_json::Value, request_id: Id) -> Result<Response> {
        let task_id = format!("task_{}", self.next_id);
        self.next_id += 1;

        let task = Task {
            id: task_id.clone(),
            status: TaskStatus::Created,
            state: Some(params),
            error: None,
        };

        self.tasks.insert(task_id.clone(), task);

        Ok(Response::success(request_id, json!({ "id": task_id, "status": "created" })))
    }

    pub fn get_task(&self, task_id: &str, request_id: Id) -> Result<Response> {
        let task = self.tasks
            .get(task_id)
            .ok_or_else(|| crate::error::McpError::Protocol(format!("Task not found: {}", task_id)))?;

        Ok(Response::success(request_id, json!({
            "id": task.id,
            "status": format!("{:?}", task.status).to_lowercase(),
            "state": task.state,
            "error": task.error,
        })))
    }

    pub fn list_tasks(&self, request_id: Id) -> Result<Response> {
        let tasks: Vec<serde_json::Value> = self.tasks
            .values()
            .map(|t| {
                json!({
                    "id": t.id,
                    "status": format!("{:?}", t.status).to_lowercase(),
                })
            })
            .collect();

        Ok(Response::success(request_id, json!({ "tasks": tasks })))
    }

    pub fn cancel_task(&mut self, task_id: &str, request_id: Id) -> Result<Response> {
        let task = self.tasks
            .get_mut(task_id)
            .ok_or_else(|| crate::error::McpError::Protocol(format!("Task not found: {}", task_id)))?;

        task.status = TaskStatus::Cancelled;

        Ok(Response::success(request_id, json!({ "id": task_id, "status": "cancelled" })))
    }

    pub fn update_task_status(&mut self, task_id: &str, status: TaskStatus) -> Result<()> {
        let task = self.tasks
            .get_mut(task_id)
            .ok_or_else(|| crate::error::McpError::Protocol(format!("Task not found: {}", task_id)))?;

        task.status = status;
        Ok(())
    }
}

impl Default for TaskHandler {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_task() {
        let mut handler = TaskHandler::new();
        let response = handler.create_task(json!({}), Id::Num(1)).unwrap();
        assert!(response.result.is_some());
    }

    #[test]
    fn test_cancel_task() {
        let mut handler = TaskHandler::new();
        let create_response = handler.create_task(json!({}), Id::Num(1)).unwrap();
        let task_id = create_response.result.unwrap()["id"].as_str().unwrap();

        handler.cancel_task(task_id, Id::Num(2)).unwrap();
        let task = handler.tasks.get(task_id).unwrap();
        assert_eq!(task.status, TaskStatus::Cancelled);
    }
}
