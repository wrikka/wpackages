//! Core types for AI models abstraction
//!
//! This module defines all shared types used across the ai-models library.

use std::collections::HashMap;

// Re-export all type modules
pub mod analytics;
pub mod audio;
pub mod chat;
pub mod completion;
pub mod content;
pub mod embeddings;
pub mod fine_tuning;
pub mod image;
pub mod message;
pub mod model;
pub mod moderation;
pub mod music;
pub mod response_format;
pub mod three_d;
pub mod traits;
pub mod tools;
pub mod usage;
pub mod video;

// Re-export commonly used types
pub use analytics::{LogEntry, Metrics};
pub use audio::{Audio, AudioRequest, AudioResponse};
pub use chat::{ChatChoice, ChatChoiceChunk, ChatChunk, ChatDelta, ChatRequest, ChatResponse};
pub use music::{MusicData, MusicRequest, MusicResponse};
pub use completion::{
    CompletionChoice, CompletionChoiceChunk, CompletionChunk, CompletionRequest, CompletionResponse,
};
pub use content::{ContentPart, ImageDetail, ImageUrl};
pub use embeddings::{EmbeddingData, EmbeddingsInput, EmbeddingsRequest, EmbeddingsResponse};
pub use fine_tuning::{CreateFineTuningJobRequest, FineTuningJob};
pub use image::{Image, ImageRequest, ImageResponse};
pub use message::{FunctionCall, Message, MessageContent, MessageRole, ToolCall};
pub use moderation::{ModerationCategories, ModerationCategoryScores, ModerationRequest, ModerationResponse, ModerationResult};
pub use model::{ModelInfo, ModelPricing, ModelType, ProviderType};
pub use response_format::{ResponseFormat, ResponseFormatType};
pub use traits::{
    AudioModel, ChatModel, CompletionModel, EmbeddingsModel, ImageModel, ModelProvider,
    UnifiedModelProvider, VideoModel,
};
pub use tools::{Tool, ToolResult};
pub use usage::Usage;
pub use video::{Video, VideoRequest, VideoResponse};

/// Additional parameters for requests
pub type AdditionalParams = HashMap<String, serde_json::Value>;
