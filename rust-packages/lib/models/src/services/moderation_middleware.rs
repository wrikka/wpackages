use crate::error::{AiModelsError, Result};
use crate::services::middleware::RequestMiddleware;
use crate::types::moderation::ModerationRequest;
use crate::types::traits::ModerationModel;
use crate::types::{ChatRequest, MessageContent, MessageRole};
use async_trait::async_trait;
use std::sync::Arc;

/// Middleware for content moderation.
pub struct ModerationMiddleware {
    provider: Arc<dyn ModerationModel>,
}

impl ModerationMiddleware {
    pub fn new(provider: Arc<dyn ModerationModel>) -> Self {
        Self { provider }
    }
}

#[async_trait]
impl RequestMiddleware for ModerationMiddleware {
    async fn pre_process(&self, request: ChatRequest) -> Result<ChatRequest> {
        if let Some(last_message) = request.messages.last() {
            if last_message.role == MessageRole::User {
                let content_to_moderate = match &last_message.content {
                    MessageContent::Text(text) => text.clone(),
                    MessageContent::Parts(parts) => parts
                        .iter()
                        .find_map(|part| {
                            if let crate::types::ContentPart::Text { text } = part {
                                Some(text.clone())
                            } else {
                                None
                            }
                        })
                        .unwrap_or_default(),
                };

                if !content_to_moderate.is_empty() {
                    let moderation_request = ModerationRequest {
                        input: content_to_moderate,
                        model: None, // Use provider's default
                    };

                    let response = self.provider.moderate(moderation_request).await?;
                    if let Some(result) = response.results.first() {
                        if result.flagged {
                            return Err(AiModelsError::ContentModerated);
                        }
                    }
                }
            }
        }
        Ok(request)
    }
}
