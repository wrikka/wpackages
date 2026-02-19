//! types/multimodal.rs

/// Represents a piece of content, which can be of various types.
#[derive(Debug, Clone)]
pub enum Content {
    Text(String),
    ImageUrl(String),
    // Other content types like audio, video, etc., can be added here.
}
