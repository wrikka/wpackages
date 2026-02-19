//! types/correction.rs

/// Represents the outcome of an executed action.
#[derive(Debug, Clone)]
pub enum Outcome {
    Success,
    Failure { error: String },
}
