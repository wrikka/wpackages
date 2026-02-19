use crate::application::services::rag_service::RagService;
use crate::config::RagConfig;
use crate::core::memory::{ConversationMemory, InMemoryConversationMemory};
use crate::domain::{Citation, Conversation, Message, MetadataFilter, RagResponse, Role, TextChunk};
use crate::error::RagResult;
use std::sync::Arc;

pub struct QnAService {
    rag_service: Arc<RagService>,
    memory: Arc<dyn ConversationMemory>,
}

impl QnAService {
    pub async fn new(config: RagConfig) -> RagResult<Self> {
        let rag_service = Arc::new(RagService::new(config).await?);
        let memory = Arc::new(InMemoryConversationMemory::new());
        Ok(Self { rag_service, memory })
    }

    pub async fn ask_with_conversation(
        &self,
        query: &str,
        paths: &[&str],
        filter: Option<&MetadataFilter>,
        conversation_id: &str,
    ) -> RagResult<RagResponse> {
        let mut conversation = self
            .memory
            .get(conversation_id)
            .await?
            .unwrap_or_else(|| Conversation { id: conversation_id.to_string(), messages: vec![] });

        let context_query = format!("{}\n\n{}", conversation.messages.iter().map(|m| m.content.as_str()).collect::<Vec<_>>().join("\n"), query);

        let retrieval_result = self.rag_service.retrieve(&context_query, paths, filter).await?;
        let answer = self.rag_service.generate(query, &retrieval_result.chunks).await?;

        conversation.messages.push(Message { role: Role::User, content: query.to_string() });
        conversation.messages.push(Message { role: Role::Assistant, content: answer.clone() });

        self.memory.set(&conversation).await?;

        let sources = retrieval_result
            .chunks
            .iter()
            .map(|c| c.document_id.clone())
            .collect::<std::collections::HashSet<_>>()
            .into_iter()
            .collect();

        let citations = retrieval_result
            .chunks
            .iter()
            .map(|c| Citation { document_id: c.document_id.clone(), chunk_id: c.id.clone() })
            .collect();

        Ok(RagResponse::new(answer, "qna-model".to_string())
            .with_context(retrieval_result.chunks)
            .with_sources(sources)
            .with_citations(citations))
    }

    pub async fn ask(&self, query: &str, paths: &[&str], filter: Option<&MetadataFilter>) -> RagResult<RagResponse> {
        let retrieval_result = self.rag_service.retrieve(query, paths, filter).await?;
        let answer = self.rag_service.generate(query, &retrieval_result.chunks).await?;
        
        let sources = retrieval_result
            .chunks
            .iter()
            .map(|c| c.document_id.clone())
            .collect::<std::collections::HashSet<_>>()
            .into_iter()
            .collect();

                let citations = retrieval_result
            .chunks
            .iter()
            .map(|c| Citation { document_id: c.document_id.clone(), chunk_id: c.id.clone() })
            .collect();

        Ok(RagResponse::new(answer, "qna-model".to_string())
            .with_context(retrieval_result.chunks)
            .with_sources(sources)
            .with_citations(citations))
    }

        pub async fn batch_ask(&self, queries: &[String], paths: &[&str], filter: Option<&MetadataFilter>) -> RagResult<Vec<RagResponse>> {
        let mut responses = Vec::new();
        for query in queries {
            let response = self.ask(query, paths, filter).await?;
            responses.push(response);
        }
        Ok(responses)
    }

    pub async fn summarize(&self, response: &RagResponse) -> RagResult<String> {
        let text_to_summarize = response.answer.clone();
        self.rag_service.summarize(&text_to_summarize).await
    }
}
