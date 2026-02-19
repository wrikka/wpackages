//! services/feedback_handler.rs

use crate::types::feedback::{FeedbackRequest, FeedbackResponse};
use std::io::{self, Write};

/// A simple, command-line based handler for human-in-the-loop feedback.
#[derive(Clone, Default)]
pub struct FeedbackHandler;

impl FeedbackHandler {
    /// Creates a new `FeedbackHandler`.
    pub fn new() -> Self {
        Self::default()
    }

    /// Requests feedback from the user via the command line.
    pub async fn request_feedback(&self, request: FeedbackRequest) -> FeedbackResponse {
        println!("--- Human Feedback Required ---");
        println!("{}", request.prompt);
        loop {
            print!("Approve or Deny? (approve/deny): ");
            io::stdout().flush().unwrap();

            let mut input = String::new();
            if io::stdin().read_line(&mut input).is_ok() {
                match input.trim().to_lowercase().as_str() {
                    "approve" => return FeedbackResponse::Approve,
                    "deny" => return FeedbackResponse::Deny,
                    _ => println!("Invalid input. Please enter 'approve' or 'deny'."),
                }
            }
        }
    }
}
