//! types/feedback.rs

/// Represents a request for feedback from a human user.
#[derive(Debug, Clone)]
pub struct FeedbackRequest {
    pub prompt: String,
    // Additional context for the decision can be added here.
}

/// Represents the response from a human user.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum FeedbackResponse {
    Approve,
    Deny,
}
