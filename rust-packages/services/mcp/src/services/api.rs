use crate::app::McpApp;
use crate::error::Result;
use crate::components::handlers::{ResourceHandler, ToolHandler, PromptHandler, TaskHandler, CompletionHandler, LoggingHandler, RootsHandler};
use crate::types::protocol::{Id, Request, Response};
use serde_json::json;

pub struct McpServer {
    app: McpApp,
    resources: ResourceHandler,
    tools: ToolHandler,
    prompts: PromptHandler,
    tasks: TaskHandler,
    completion: CompletionHandler,
    logging: LoggingHandler,
    roots: RootsHandler,
}

impl McpServer {
    pub fn new(app: McpApp) -> Self {
        Self {
            app,
            resources: ResourceHandler::new(),
            tools: ToolHandler::new(),
            prompts: PromptHandler::new(),
            tasks: TaskHandler::new(),
            completion: CompletionHandler::new(),
            logging: LoggingHandler::new(),
            roots: RootsHandler::new(),
        }
    }

    pub fn resources(&self) -> &ResourceHandler {
        &self.resources
    }

    pub fn resources_mut(&mut self) -> &mut ResourceHandler {
        &mut self.resources
    }

    pub fn tools(&self) -> &ToolHandler {
        &self.tools
    }

    pub fn tools_mut(&mut self) -> &mut ToolHandler {
        &mut self.tools
    }

    pub fn prompts(&self) -> &PromptHandler {
        &self.prompts
    }

    pub fn prompts_mut(&mut self) -> &mut PromptHandler {
        &mut self.prompts
    }

    pub fn tasks(&self) -> &TaskHandler {
        &self.tasks
    }

    pub fn tasks_mut(&mut self) -> &mut TaskHandler {
        &mut self.tasks
    }

    pub fn logging(&self) -> &LoggingHandler {
        &self.logging
    }

    pub fn logging_mut(&mut self) -> &mut LoggingHandler {
        &mut self.logging
    }

    pub fn roots(&self) -> &RootsHandler {
        &self.roots
    }

    pub fn roots_mut(&mut self) -> &mut RootsHandler {
        &mut self.roots
    }

    pub async fn handle_message(&mut self, json: &str) -> Result<String> {
        self.app.handle_message(json).await
    }

    pub async fn list_resources(&self) -> Result<Response> {
        self.resources.list_resources(Id::Num(0))
    }

    pub async fn read_resource(&self, uri: &str) -> Result<Response> {
        self.resources.read_resource(uri, Id::Num(0))
    }

    pub async fn subscribe_resource(&mut self, uri: &str) -> Result<Response> {
        self.resources.subscribe_resource(uri, Id::Num(0))
    }

    pub async fn unsubscribe_resource(&mut self, uri: &str) -> Result<Response> {
        self.resources.unsubscribe_resource(uri, Id::Num(0))
    }

    pub async fn list_tools(&self) -> Result<Response> {
        self.tools.list_tools(Id::Num(0))
    }

    pub async fn call_tool(&self, name: &str, args: serde_json::Value) -> Result<Response> {
        self.tools.call_tool(name, args, Id::Num(0))
    }

    pub async fn list_prompts(&self) -> Result<Response> {
        self.prompts.list_prompts(Id::Num(0))
    }

    pub async fn get_prompt(&self, name: &str, args: serde_json::Value) -> Result<Response> {
        self.prompts.get_prompt(name, args, Id::Num(0))
    }

    pub async fn create_task(&mut self, params: serde_json::Value) -> Result<Response> {
        self.tasks.create_task(params, Id::Num(0))
    }

    pub async fn get_task(&self, task_id: &str) -> Result<Response> {
        self.tasks.get_task(task_id, Id::Num(0))
    }

    pub async fn list_tasks(&self) -> Result<Response> {
        self.tasks.list_tasks(Id::Num(0))
    }

    pub async fn cancel_task(&mut self, task_id: &str) -> Result<Response> {
        self.tasks.cancel_task(task_id, Id::Num(0))
    }

    pub async fn list_roots(&self) -> Result<Response> {
        self.roots.list_roots(Id::Num(0))
    }

    pub fn shutdown(&mut self) {
        self.app.shutdown();
    }
}

impl Default for McpServer {
    fn default() -> Self {
        Self::new(McpApp::default())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_server_creation() {
        let server = McpServer::default();
        assert_eq!(server.app.config().server.host, "127.0.0.1");
    }
}
