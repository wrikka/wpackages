//! Core traits for AI model providers
//!
//! This module defines the unified interface for all AI model providers.

use crate::error::Result;
use crate::types::*;
use crate::types::fine_tuning::{CreateFineTuningJobRequest, FineTuningJob};
use crate::types::moderation::{ModerationRequest, ModerationResponse};
use crate::types::music::{MusicRequest, MusicResponse};
use crate::types::three_d::{ThreeDRequest, ThreeDResponse};
use async_trait::async_trait;
use futures::Stream;
use std::pin::Pin;

/// Base trait for all model providers
#[async_trait]
pub trait ModelProvider: Send + Sync {
    /// Get the provider's name
    fn name(&self) -> &str;

    /// Get the provider type
    fn provider_type(&self) -> ProviderType;

    /// Check if the provider is ready
    async fn is_ready(&self) -> Result<bool>;

    /// Get available models
    async fn list_models(&self) -> Result<Vec<ModelInfo>>;

    /// Get model information
    async fn get_model_info(&self, model_id: &str) -> Result<ModelInfo>;
}

/// Trait for chat completion models
#[async_trait]
pub trait ChatModel: ModelProvider {
    /// Generate a chat completion
    async fn chat(&self, request: ChatRequest) -> Result<ChatResponse>;

    /// Generate a streaming chat completion
    async fn chat_stream(
        &self,
        request: ChatRequest,
    ) -> Result<Pin<Box<dyn Stream<Item = Result<ChatChunk>> + Send>>>;
}

/// Trait for text completion models
#[async_trait]
pub trait CompletionModel: ModelProvider {
    /// Generate a text completion
    async fn complete(&self, request: CompletionRequest) -> Result<CompletionResponse>;

    /// Generate a streaming text completion
    async fn complete_stream(
        &self,
        request: CompletionRequest,
    ) -> Result<Pin<Box<dyn Stream<Item = Result<CompletionChunk>> + Send>>>;
}

/// Trait for embeddings models
#[async_trait]
pub trait EmbeddingsModel: ModelProvider {
    /// Generate embeddings for text
    async fn embed(&self, request: EmbeddingsRequest) -> Result<EmbeddingsResponse>;
}

/// Trait for image generation models
#[async_trait]
pub trait ImageModel: ModelProvider {
    /// Generate an image
    async fn generate_image(&self, request: ImageRequest) -> Result<ImageResponse>;
}

/// Trait for video generation models
#[async_trait]
pub trait VideoModel: ModelProvider {
    /// Generate a video
    async fn generate_video(&self, request: VideoRequest) -> Result<VideoResponse>;
}

/// Trait for audio generation models
#[async_trait]
pub trait AudioModel: ModelProvider {
    /// Generate audio
    async fn generate_audio(&self, request: AudioRequest) -> Result<AudioResponse>;
}

/// Trait for 3D model generation
#[async_trait]
pub trait ThreeDModel: ModelProvider {
    /// Generate a 3D model
    async fn generate_3d(&self, request: ThreeDRequest) -> Result<ThreeDResponse>;
}

/// Trait for music generation models
#[async_trait]
pub trait MusicModel: ModelProvider {
    /// Generate music
    async fn generate_music(&self, request: MusicRequest) -> Result<MusicResponse>;
}

/// Trait for providers that support all model types
#[async_trait]
pub trait UnifiedModelProvider: 
    ChatModel + CompletionModel + EmbeddingsModel + ImageModel + VideoModel + AudioModel + ThreeDModel + MusicModel
{
}

/// Trait for models that support fine-tuning
#[async_trait]
pub trait FineTuningModel: Send + Sync {
    /// Create a fine-tuning job
    async fn create_fine_tuning_job(
        &self,
        request: CreateFineTuningJobRequest,
    ) -> Result<FineTuningJob>;

    /// List fine-tuning jobs
    async fn list_fine_tuning_jobs(&self) -> Result<Vec<FineTuningJob>>;

    /// Retrieve a fine-tuning job
    async fn retrieve_fine_tuning_job(&self, job_id: &str) -> Result<FineTuningJob>;

    /// Cancel a fine-tuning job
    async fn cancel_fine_tuning_job(&self, job_id: &str) -> Result<FineTuningJob>;
}

/// Trait for models that support content moderation
#[async_trait]
pub trait ModerationModel: Send + Sync {
    /// Moderate content
    async fn moderate(&self, request: ModerationRequest) -> Result<ModerationResponse>;
}
