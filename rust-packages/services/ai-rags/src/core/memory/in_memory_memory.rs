use super::ConversationMemory;
use crate::domain::Conversation;
use crate::error::RagResult;
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Default)]
pub struct InMemoryConversationMemory {
    conversations: Arc<RwLock<HashMap<String, Conversation>>>,
}

impl InMemoryConversationMemory {
    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait]
impl ConversationMemory for InMemoryConversationMemory {
    async fn get(&self, id: &str) -> RagResult<Option<Conversation>> {
        let conversations = self.conversations.read().await;
        Ok(conversations.get(id).cloned())
    }

    async fn set(&self, conversation: &Conversation) -> RagResult<()> {
        let mut conversations = self.conversations.write().await;
        conversations.insert(conversation.id.clone(), conversation.clone());
        Ok(())
    }
}
