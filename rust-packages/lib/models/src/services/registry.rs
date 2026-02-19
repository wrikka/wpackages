//! Model Registry for centralized model management
//!
//! This module provides a registry for managing multiple AI model providers.

use crate::error::{AiModelsError, Result};
use crate::providers::*;
use crate::services::capabilities::{ModelCapability, Modality};
use crate::types::traits::{AudioModel, ChatModel, CompletionModel, EmbeddingsModel, ImageModel, ModerationModel, ModelProvider, MusicModel, ThreeDModel};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// A boxed provider that can be any of the supported types
pub type BoxedChatModel = Arc<dyn ChatModel>;
pub type BoxedCompletionModel = Arc<dyn CompletionModel>;
pub type BoxedEmbeddingsModel = Arc<dyn EmbeddingsModel>;
pub type BoxedModerationModel = Arc<dyn ModerationModel>;
pub type BoxedImageModel = Arc<dyn ImageModel>;
pub type BoxedThreeDModel = Arc<dyn ThreeDModel>;
pub type BoxedAudioModel = Arc<dyn AudioModel>;
pub type BoxedMusicModel = Arc<dyn MusicModel>;

/// Model registry for managing multiple providers
pub struct ModelRegistry {
    chat_providers: RwLock<HashMap<String, BoxedChatModel>>,
    completion_providers: RwLock<HashMap<String, BoxedCompletionModel>>,
    embeddings_providers: RwLock<HashMap<String, BoxedEmbeddingsModel>>,
    moderation_providers: RwLock<HashMap<String, BoxedModerationModel>>,
    image_providers: RwLock<HashMap<String, BoxedImageModel>>,
    three_d_providers: RwLock<HashMap<String, BoxedThreeDModel>>,
    audio_providers: RwLock<HashMap<String, BoxedAudioModel>>,
    music_providers: RwLock<HashMap<String, BoxedMusicModel>>,
    capabilities: RwLock<HashMap<String, ModelCapability>>,
    default_chat_provider: RwLock<Option<String>>,
    default_completion_provider: RwLock<Option<String>>,
    default_embeddings_provider: RwLock<Option<String>>,
    default_moderation_provider: RwLock<Option<String>>,
    default_image_provider: RwLock<Option<String>>,
    default_three_d_provider: RwLock<Option<String>>,
    default_audio_provider: RwLock<Option<String>>,
    default_music_provider: RwLock<Option<String>>,
}

impl ModelRegistry {
    /// Create a new empty registry
    pub fn new() -> Self {
        Self {
            chat_providers: RwLock::new(HashMap::new()),
            completion_providers: RwLock::new(HashMap::new()),
            embeddings_providers: RwLock::new(HashMap::new()),
            moderation_providers: RwLock::new(HashMap::new()),
            image_providers: RwLock::new(HashMap::new()),
            three_d_providers: RwLock::new(HashMap::new()),
            audio_providers: RwLock::new(HashMap::new()),
            music_providers: RwLock::new(HashMap::new()),
            capabilities: RwLock::new(HashMap::new()),
            default_chat_provider: RwLock::new(None),
            default_completion_provider: RwLock::new(None),
            default_embeddings_provider: RwLock::new(None),
            default_moderation_provider: RwLock::new(None),
            default_image_provider: RwLock::new(None),
            default_three_d_provider: RwLock::new(None),
            default_audio_provider: RwLock::new(None),
            default_music_provider: RwLock::new(None),
        }
    }

    /// Register a chat provider
    pub async fn register_chat_provider(&self, name: impl Into<String>, provider: BoxedChatModel) {
        let name = name.into();
        let mut providers = self.chat_providers.write().await;
        providers.insert(name.clone(), provider);

        // Set as default if it's the first one
        let mut default = self.default_chat_provider.write().await;
        if default.is_none() {
            *default = Some(name);
        }
    }

    /// Register a completion provider
    pub async fn register_completion_provider(
        &self,
        name: impl Into<String>,
        provider: BoxedCompletionModel,
    ) {
        let name = name.into();
        let mut providers = self.completion_providers.write().await;
        providers.insert(name.clone(), provider);

        let mut default = self.default_completion_provider.write().await;
        if default.is_none() {
            *default = Some(name);
        }
    }

    /// Register an embeddings provider
    pub async fn register_embeddings_provider(
        &self,
        name: impl Into<String>,
        provider: BoxedEmbeddingsModel,
    ) {
        let name = name.into();
        let mut providers = self.embeddings_providers.write().await;
        providers.insert(name.clone(), provider);

        let mut default = self.default_embeddings_provider.write().await;
        if default.is_none() {
            *default = Some(name);
        }
    }

    /// Register a moderation provider
    pub async fn register_moderation_provider(
        &self,
        name: impl Into<String>,
        provider: BoxedModerationModel,
    ) {
        let name = name.into();
        let mut providers = self.moderation_providers.write().await;
        providers.insert(name.clone(), provider);

        let mut default = self.default_moderation_provider.write().await;
        if default.is_none() {
            *default = Some(name);
        }
    }

    /// Register an image provider
    pub async fn register_image_provider(
        &self,
        name: impl Into<String>,
        provider: BoxedImageModel,
    ) {
        let name = name.into();
        let mut providers = self.image_providers.write().await;
        providers.insert(name.clone(), provider);

        let mut default = self.default_image_provider.write().await;
        if default.is_none() {
            *default = Some(name);
        }
    }

    /// Register a 3D provider
    pub async fn register_three_d_provider(
        &self,
        name: impl Into<String>,
        provider: BoxedThreeDModel,
    ) {
        let name = name.into();
        let mut providers = self.three_d_providers.write().await;
        providers.insert(name.clone(), provider);

        let mut default = self.default_three_d_provider.write().await;
        if default.is_none() {
            *default = Some(name);
        }
    }

    /// Register an audio provider
    pub async fn register_audio_provider(
        &self,
        name: impl Into<String>,
        provider: BoxedAudioModel,
    ) {
        let name = name.into();
        let mut providers = self.audio_providers.write().await;
        providers.insert(name.clone(), provider);

        let mut default = self.default_audio_provider.write().await;
        if default.is_none() {
            *default = Some(name);
        }
    }

    /// Register a music provider
    pub async fn register_music_provider(
        &self,
        name: impl Into<String>,
        provider: BoxedMusicModel,
    ) {
        let name = name.into();
        let mut providers = self.music_providers.write().await;
        providers.insert(name.clone(), provider);

        let mut default = self.default_music_provider.write().await;
        if default.is_none() {
            *default = Some(name);
        }
    }

    /// Set default chat provider
    pub async fn set_default_chat_provider(&self, name: impl Into<String>) -> Result<()> {
        let name = name.into();
        let providers = self.chat_providers.read().await;
        if providers.contains_key(&name) {
            *self.default_chat_provider.write().await = Some(name);
            Ok(())
        } else {
            Err(AiModelsError::ModelNotFound { model_name: name })
        }
    }

    /// Set default completion provider
    pub async fn set_default_completion_provider(&self, name: impl Into<String>) -> Result<()> {
        let name = name.into();
        let providers = self.completion_providers.read().await;
        if providers.contains_key(&name) {
            *self.default_completion_provider.write().await = Some(name);
            Ok(())
        } else {
            Err(AiModelsError::ModelNotFound { model_name: name })
        }
    }

    /// Set default embeddings provider
    pub async fn set_default_embeddings_provider(&self, name: impl Into<String>) -> Result<()> {
        let name = name.into();
        let providers = self.embeddings_providers.read().await;
        if providers.contains_key(&name) {
            *self.default_embeddings_provider.write().await = Some(name);
            Ok(())
        } else {
            Err(AiModelsError::ModelNotFound { model_name: name })
        }
    }

    /// Set default moderation provider
    pub async fn set_default_moderation_provider(&self, name: impl Into<String>) -> Result<()> {
        let name = name.into();
        let providers = self.moderation_providers.read().await;
        if providers.contains_key(&name) {
            *self.default_moderation_provider.write().await = Some(name);
            Ok(())
        } else {
            Err(AiModelsError::ModelNotFound { model_name: name })
        }
    }

    /// Set default image provider
    pub async fn set_default_image_provider(&self, name: impl Into<String>) -> Result<()> {
        let name = name.into();
        let providers = self.image_providers.read().await;
        if providers.contains_key(&name) {
            *self.default_image_provider.write().await = Some(name);
            Ok(())
        } else {
            Err(AiModelsError::ModelNotFound { model_name: name })
        }
    }

    /// Set default 3D provider
    pub async fn set_default_three_d_provider(&self, name: impl Into<String>) -> Result<()> {
        let name = name.into();
        let providers = self.three_d_providers.read().await;
        if providers.contains_key(&name) {
            *self.default_three_d_provider.write().await = Some(name);
            Ok(())
        } else {
            Err(AiModelsError::ModelNotFound { model_name: name })
        }
    }

    /// Set default audio provider
    pub async fn set_default_audio_provider(&self, name: impl Into<String>) -> Result<()> {
        let name = name.into();
        let providers = self.audio_providers.read().await;
        if providers.contains_key(&name) {
            *self.default_audio_provider.write().await = Some(name);
            Ok(())
        } else {
            Err(AiModelsError::ModelNotFound { model_name: name })
        }
    }

    /// Set default music provider
    pub async fn set_default_music_provider(&self, name: impl Into<String>) -> Result<()> {
        let name = name.into();
        let providers = self.music_providers.read().await;
        if providers.contains_key(&name) {
            *self.default_music_provider.write().await = Some(name);
            Ok(())
        } else {
            Err(AiModelsError::ModelNotFound { model_name: name })
        }
    }

    /// Get a chat provider by name
    pub async fn get_chat_provider(&self, name: &str) -> Option<BoxedChatModel> {
        self.chat_providers.read().await.get(name).cloned()
    }

    /// Get a completion provider by name
    pub async fn get_completion_provider(&self, name: &str) -> Option<BoxedCompletionModel> {
        self.completion_providers.read().await.get(name).cloned()
    }

    /// Get an embeddings provider by name
    pub async fn get_embeddings_provider(&self, name: &str) -> Option<BoxedEmbeddingsModel> {
        self.embeddings_providers.read().await.get(name).cloned()
    }

    /// Get a moderation provider by name
    pub async fn get_moderation_provider(&self, name: &str) -> Option<BoxedModerationModel> {
        self.moderation_providers.read().await.get(name).cloned()
    }

    /// Get an image provider by name
    pub async fn get_image_provider(&self, name: &str) -> Option<BoxedImageModel> {
        self.image_providers.read().await.get(name).cloned()
    }

    /// Get a 3D provider by name
    pub async fn get_three_d_provider(&self, name: &str) -> Option<BoxedThreeDModel> {
        self.three_d_providers.read().await.get(name).cloned()
    }

    /// Get an audio provider by name
    pub async fn get_audio_provider(&self, name: &str) -> Option<BoxedAudioModel> {
        self.audio_providers.read().await.get(name).cloned()
    }

    /// Get a music provider by name
    pub async fn get_music_provider(&self, name: &str) -> Option<BoxedMusicModel> {
        self.music_providers.read().await.get(name).cloned()
    }

    /// Get default chat provider
    pub async fn get_default_chat_provider(&self) -> Result<BoxedChatModel> {
        let default = self.default_chat_provider.read().await;
        match default.as_ref() {
            Some(name) => {
                let provider = self.get_chat_provider(name).await;
                provider.ok_or_else(|| AiModelsError::ModelNotFound {
                    model_name: name.clone(),
                })
            }
            None => Err(AiModelsError::InvalidInput(
                "No default chat provider set".to_string(),
            )),
        }
    }

    /// Get default completion provider
    pub async fn get_default_completion_provider(&self) -> Result<BoxedCompletionModel> {
        let default = self.default_completion_provider.read().await;
        match default.as_ref() {
            Some(name) => {
                let provider = self.get_completion_provider(name).await;
                provider.ok_or_else(|| AiModelsError::ModelNotFound {
                    model_name: name.clone(),
                })
            }
            None => Err(AiModelsError::InvalidInput(
                "No default completion provider set".to_string(),
            )),
        }
    }

    /// Get default embeddings provider
    pub async fn get_default_embeddings_provider(&self) -> Result<BoxedEmbeddingsModel> {
        let default = self.default_embeddings_provider.read().await;
        match default.as_ref() {
            Some(name) => {
                let provider = self.get_embeddings_provider(name).await;
                provider.ok_or_else(|| AiModelsError::ModelNotFound {
                    model_name: name.clone(),
                })
            }
            None => Err(AiModelsError::InvalidInput(
                "No default embeddings provider set".to_string(),
            )),
        }
    }

    /// Get default moderation provider
    pub async fn get_default_moderation_provider(&self) -> Result<BoxedModerationModel> {
        let default = self.default_moderation_provider.read().await;
        match default.as_ref() {
            Some(name) => {
                let provider = self.get_moderation_provider(name).await;
                provider.ok_or_else(|| AiModelsError::ModelNotFound {
                    model_name: name.clone(),
                })
            }
            None => Err(AiModelsError::InvalidInput(
                "No default moderation provider set".to_string(),
            )),
        }
    }

    /// Get default image provider
    pub async fn get_default_image_provider(&self) -> Result<BoxedImageModel> {
        let default = self.default_image_provider.read().await;
        match default.as_ref() {
            Some(name) => {
                let provider = self.get_image_provider(name).await;
                provider.ok_or_else(|| AiModelsError::ModelNotFound {
                    model_name: name.clone(),
                })
            }
            None => Err(AiModelsError::InvalidInput(
                "No default image provider set".to_string(),
            )),
        }
    }

    /// Get default 3D provider
    pub async fn get_default_three_d_provider(&self) -> Result<BoxedThreeDModel> {
        let default = self.default_three_d_provider.read().await;
        match default.as_ref() {
            Some(name) => {
                let provider = self.get_three_d_provider(name).await;
                provider.ok_or_else(|| AiModelsError::ModelNotFound {
                    model_name: name.clone(),
                })
            }
            None => Err(AiModelsError::InvalidInput(
                "No default 3D provider set".to_string(),
            )),
        }
    }

    /// Get default audio provider
    pub async fn get_default_audio_provider(&self) -> Result<BoxedAudioModel> {
        let default = self.default_audio_provider.read().await;
        match default.as_ref() {
            Some(name) => {
                let provider = self.get_audio_provider(name).await;
                provider.ok_or_else(|| AiModelsError::ModelNotFound {
                    model_name: name.clone(),
                })
            }
            None => Err(AiModelsError::InvalidInput(
                "No default audio provider set".to_string(),
            )),
        }
    }

    /// Get default music provider
    pub async fn get_default_music_provider(&self) -> Result<BoxedMusicModel> {
        let default = self.default_music_provider.read().await;
        match default.as_ref() {
            Some(name) => {
                let provider = self.get_music_provider(name).await;
                provider.ok_or_else(|| AiModelsError::ModelNotFound {
                    model_name: name.clone(),
                })
            }
            None => Err(AiModelsError::InvalidInput(
                "No default music provider set".to_string(),
            )),
        }
    }

    /// List all registered chat providers
    pub async fn list_chat_providers(&self) -> Vec<String> {
        self.chat_providers.read().await.keys().cloned().collect()
    }

    /// List all registered completion providers
    pub async fn list_completion_providers(&self) -> Vec<String> {
        self.completion_providers
            .read()
            .await
            .keys()
            .cloned()
            .collect()
    }

    /// List all registered embeddings providers
    pub async fn list_embeddings_providers(&self) -> Vec<String> {
        self.embeddings_providers
            .read()
            .await
            .keys()
            .cloned()
            .collect()
    }

    /// Remove a provider
    pub async fn remove_provider(&self, name: &str) {
        self.chat_providers.write().await.remove(name);
        self.completion_providers.write().await.remove(name);
        self.embeddings_providers.write().await.remove(name);
        self.moderation_providers.write().await.remove(name);
        self.image_providers.write().await.remove(name);
        self.three_d_providers.write().await.remove(name);
        self.audio_providers.write().await.remove(name);
        self.music_providers.write().await.remove(name);
    }

    /// Register a model's capabilities
    pub async fn register_capability(&self, capability: ModelCapability) {
        let mut capabilities = self.capabilities.write().await;
        capabilities.insert(capability.model_name.clone(), capability);
    }

    /// Get a model's capabilities by name
    pub async fn get_capability(&self, model_name: &str) -> Option<ModelCapability> {
        self.capabilities.read().await.get(model_name).cloned()
    }

    /// List all registered capabilities
    pub async fn list_capabilities(&self) -> Vec<ModelCapability> {
        self.capabilities.read().await.values().cloned().collect()
    }

    /// Find models that support a specific modality
    pub async fn find_models_with_modality(&self, modality: Modality) -> Vec<ModelCapability> {
        let capabilities = self.capabilities.read().await;
        capabilities
            .values()
            .filter(|cap| cap.modalities.contains(&modality))
            .cloned()
            .collect()
    }
}

impl Default for ModelRegistry {
    fn default() -> Self {
        Self::new()
    }
}

/// Convenience function to create a registry with common providers
pub async fn create_default_registry() -> Result<ModelRegistry> {
    let registry = ModelRegistry::new();

    // Register OpenAI if API key is available
    if let Ok(api_key) = std::env::var("OPENAI_API_KEY") {
        if !api_key.is_empty() {
            let openai = Arc::new(OpenAIProvider::new(OpenAIConfig::new(api_key)));
            registry
                .register_chat_provider("openai", openai.clone())
                .await;
            registry
                .register_completion_provider("openai", openai.clone())
                .await;
            registry
                .register_embeddings_provider("openai", openai.clone())
                .await;
            registry
                .register_moderation_provider("openai", openai.clone())
                .await;
            registry
                .register_image_provider("openai", openai)
                .await;

            // Register capabilities
            registry.register_capability(ModelCapability {
                model_name: "gpt-4o".to_string(),
                context_window: 128_000,
                modalities: vec![Modality::Text, Modality::Vision],
                cost_per_million_input_tokens: 500, // $5
                cost_per_million_output_tokens: 1500, // $15
                provider: "OpenAI".to_string(),
            }).await;

            registry.register_capability(ModelCapability {
                model_name: "gpt-4-turbo".to_string(),
                context_window: 128_000,
                modalities: vec![Modality::Text, Modality::Vision],
                cost_per_million_input_tokens: 1000, // $10
                cost_per_million_output_tokens: 3000, // $30
                provider: "OpenAI".to_string(),
            }).await;
        }
    }

    // Register Anthropic if API key is available
    if let Ok(api_key) = std::env::var("ANTHROPIC_API_KEY") {
        if !api_key.is_empty() {
            let anthropic = Arc::new(AnthropicProvider::new(AnthropicConfig::new(api_key)));
            registry
                .register_chat_provider("anthropic", anthropic)
                .await;

            // Register capabilities
            registry.register_capability(ModelCapability {
                model_name: "claude-3-opus-20240229".to_string(),
                context_window: 200_000,
                modalities: vec![Modality::Text, Modality::Vision],
                cost_per_million_input_tokens: 1500, // $15
                cost_per_million_output_tokens: 7500, // $75
                provider: "Anthropic".to_string(),
            }).await;

            registry.register_capability(ModelCapability {
                model_name: "claude-3-sonnet-20240229".to_string(),
                context_window: 200_000,
                modalities: vec![Modality::Text, Modality::Vision],
                cost_per_million_input_tokens: 300, // $3
                cost_per_million_output_tokens: 1500, // $15
                provider: "Anthropic".to_string(),
            }).await;
        }
    }

    // Register Ollama if available
    let ollama = Arc::new(OllamaProvider::new(OllamaConfig::default()));
    if ollama.is_ready().await.unwrap_or(false) {
        registry
            .register_chat_provider("ollama", ollama.clone())
            .await;
        registry
            .register_completion_provider("ollama", ollama.clone())
            .await;

        // Register a generic capability for local Ollama models
        registry.register_capability(ModelCapability {
            model_name: "ollama-local".to_string(),
            context_window: 8_000, // A reasonable default
            modalities: vec![Modality::Text],
            cost_per_million_input_tokens: 0,
            cost_per_million_output_tokens: 0,
            provider: "Ollama".to_string(),
        }).await;
    }

    // Register Groq if API key is available
    if let Ok(api_key) = std::env::var("GROQ_API_KEY") {
        if !api_key.is_empty() {
            let groq = Arc::new(GroqProvider::new(GroqConfig::new(api_key)));
            registry.register_chat_provider("groq", groq).await;

            // Register capabilities
            registry.register_capability(ModelCapability {
                model_name: "llama3-8b-8192".to_string(),
                context_window: 8192,
                modalities: vec![Modality::Text],
                cost_per_million_input_tokens: 5, // $0.05
                cost_per_million_output_tokens: 8, // $0.08
                provider: "Groq".to_string(),
            }).await;
        }
    }

    // Register Mistral if API key is available
    if let Ok(api_key) = std::env::var("MISTRAL_API_KEY") {
        if !api_key.is_empty() {
            let mistral = Arc::new(MistralProvider::new(MistralConfig::new(api_key)));
            registry
                .register_chat_provider("mistral", mistral.clone())
                .await;
            registry
                .register_completion_provider("mistral", mistral.clone())
                .await;
            registry
                .register_embeddings_provider("mistral", mistral)
                .await;

            // Register capabilities
            registry.register_capability(ModelCapability {
                model_name: "mistral-large-latest".to_string(),
                context_window: 32_000,
                modalities: vec![Modality::Text, Modality::Vision],
                cost_per_million_input_tokens: 400, // $4
                cost_per_million_output_tokens: 1200, // $12
                provider: "Mistral".to_string(),
            }).await;
        }
    }

    // Register Azure OpenAI if environment variables are available
    if let (Ok(api_key), Ok(endpoint), Ok(deployment_name)) = (
        std::env::var("AZURE_OPENAI_API_KEY"),
        std::env::var("AZURE_OPENAI_ENDPOINT"),
        std::env::var("AZURE_OPENAI_DEPLOYMENT_NAME"),
    ) {
        if !api_key.is_empty() {
            let azure_openai = Arc::new(AzureOpenAIProvider::new(AzureOpenAIConfig::new(
                api_key,
                endpoint,
                deployment_name,
            )));
            registry
                .register_chat_provider("azure_openai", azure_openai)
                .await;
        }
    }

    // Register Google Gemini if environment variables are available
    if let (Ok(api_key), Ok(model)) = (
        std::env::var("GOOGLE_GEMINI_API_KEY"),
        std::env::var("GOOGLE_GEMINI_MODEL"),
    ) {
        if !api_key.is_empty() {
            let google_gemini = Arc::new(GoogleGeminiProvider::new(GoogleGeminiConfig::new(
                api_key,
                model,
            )));
            registry
                .register_chat_provider("google_gemini", google_gemini)
                .await;
        }
    }

    // Register Luma AI if API key is available
    if let Ok(api_key) = std::env::var("LUMA_API_KEY") {
        if !api_key.is_empty() {
            let luma_ai = Arc::new(LumaAIProvider::new(LumaAIConfig {
                api_key,
                ..Default::default()
            }).unwrap());
            registry
                .register_three_d_provider("luma_ai", luma_ai)
                .await;
        }
    }

    // Register Stability AI if API key is available
    if let Ok(api_key) = std::env::var("STABILITY_API_KEY") {
        if !api_key.is_empty() {
            let stability_ai = Arc::new(StabilityAIProvider::new(StabilityAIConfig {
                api_key,
                ..Default::default()
            }).unwrap());
            registry
                .register_image_provider("stability_ai", stability_ai.clone())
                .await;
            registry
                .register_chat_provider("stability_ai", stability_ai)
                .await;
        }
    }

    // Register ElevenLabs if API key is available
    if let Ok(api_key) = std::env::var("ELEVENLABS_API_KEY") {
        if !api_key.is_empty() {
            let eleven_labs = Arc::new(ElevenLabsProvider::new(ElevenLabsConfig {
                api_key,
                ..Default::default()
            }).unwrap());
            registry
                .register_audio_provider("eleven_labs", eleven_labs)
                .await;
        }
    }

    // Register Suno AI if API key is available
    if let Ok(api_key) = std::env::var("SUNO_API_KEY") {
        if !api_key.is_empty() {
            let suno_ai = Arc::new(SunoAIProvider::new(SunoAIConfig {
                api_key,
                ..Default::default()
            }).unwrap());
            registry
                .register_music_provider("suno_ai", suno_ai)
                .await;
        }
    }

    Ok(registry)
}
