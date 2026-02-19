use crate::error::Result;
use crate::components::McpServer;

pub struct ServerService {
    server: McpServer,
}

impl ServerService {
    pub fn new(server: McpServer) -> Self {
        Self { server }
    }

    pub async fn listen(&self) -> Result<()> {
        Ok(())
    }
}
