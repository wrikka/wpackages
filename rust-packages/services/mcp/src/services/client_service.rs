use crate::error::Result;
use crate::components::McpClient;

pub struct ClientService {
    client: McpClient,
}

impl ClientService {
    pub fn new(client: McpClient) -> Self {
        Self { client }
    }

    pub async fn connect(&self) -> Result<()> {
        Ok(())
    }
}
