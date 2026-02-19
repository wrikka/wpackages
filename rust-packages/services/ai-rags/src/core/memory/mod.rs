use crate::domain::Conversation;
use crate::error::RagResult;
use async_trait::async_trait;

#[async_trait]
pub trait ConversationMemory: Send + Sync {
    async fn get(&self, id: &str) -> RagResult<Option<Conversation>>;
    async fn set(&self, conversation: &Conversation) -> RagResult<()>;
}

pub mod in_memory_memory;

pub use in_memory_memory::InMemoryConversationMemory;
