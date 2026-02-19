use crate::{config::ModelsConfig, types::MessageRole, Result};
use async_openai::types::{
    ChatCompletionRequestMessage,
    CreateChatCompletionRequestArgs,
    CreateCompletionRequestArgs,
    Role,
};
use async_trait::async_trait;
use async_openai::Client;

#[async_trait]
pub trait ModelService: Send + Sync {
    async fn generate_completion(&self, prompt: &str) -> Result<String>;
    async fn generate_chat_completion(&self, messages: &[crate::types::Message]) -> Result<String>;
}

pub struct OpenAIModelService {
    config: ModelsConfig,
    client: Client,
}

impl OpenAIModelService {
    pub fn new(config: ModelsConfig) -> Self {
        let client = match config.api_key.as_ref() {
            Some(api_key) => Client::new().with_api_key(api_key),
            None => Client::new(),
        };
        Self {
            config,
            client,
        }
    }
}

#[async_trait]
impl ModelService for OpenAIModelService {
    async fn generate_completion(&self, prompt: &str) -> Result<String> {
        let request = CreateCompletionRequestArgs::default()
            .model(&self.config.default_model)
            .prompt(prompt)
            .max_tokens(self.config.max_tokens as u16)
            .temperature(self.config.temperature)
            .build()?;

        let response = self.client.completions().create(request).await?;
        Ok(response.choices.first().unwrap().text.clone())
    }

    async fn generate_chat_completion(&self, messages: &[crate::types::Message]) -> Result<String> {
        let request_messages: Vec<ChatCompletionRequestMessage> = messages
            .iter()
            .map(|m| ChatCompletionRequestMessage {
                role: match m.role {
                    MessageRole::User => Role::User,
                    MessageRole::Assistant => Role::Assistant,
                    MessageRole::System => Role::System,
                },
                content: m.content.clone(),
                name: None,
            })
            .collect();

        let request = CreateChatCompletionRequestArgs::default()
            .model(&self.config.default_model)
            .messages(request_messages)
            .max_tokens(self.config.max_tokens as u16)
            .temperature(self.config.temperature)
            .build()?;

        let response = self.client.chat().create(request).await?;
        Ok(response.choices.first().unwrap().message.content.clone())
    }
}
