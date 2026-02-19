//! Message builder utilities
//!
//! Pure functions for building messages and requests.

use crate::types::*;

/// Build a simple chat conversation
pub fn build_conversation(system_prompt: &str, user_message: &str) -> Vec<Message> {
    vec![Message::system(system_prompt), Message::user(user_message)]
}

/// Build a conversation with history
pub fn build_conversation_with_history(
    system_prompt: &str,
    history: &[(MessageRole, &str)],
    current_message: &str,
) -> Vec<Message> {
    let mut messages = vec![Message::system(system_prompt)];

    for (role, content) in history {
        match role {
            MessageRole::System => messages.push(Message::system(*content)),
            MessageRole::User => messages.push(Message::user(*content)),
            MessageRole::Assistant => messages.push(Message::assistant(*content)),
            MessageRole::Tool => messages.push(Message::tool(*content, "")),
        }
    }

    messages.push(Message::user(current_message));
    messages
}

/// Create a chat request with default settings
pub fn create_chat_request(model: &str, messages: Vec<Message>) -> ChatRequest {
    ChatRequest::new(model, messages)
        .with_temperature(0.7)
        .with_max_tokens(1024)
}

/// Create a completion request with default settings
pub fn create_completion_request(model: &str, prompt: &str) -> CompletionRequest {
    CompletionRequest::new(model, prompt)
        .with_temperature(0.3)
        .with_max_tokens(256)
}

/// Estimate token count (rough approximation)
pub fn estimate_tokens(text: &str) -> usize {
    // Rough approximation: ~4 characters per token for English
    (text.len() + 3) / 4
}

/// Check if text exceeds context length
pub fn exceeds_context_length(text: &str, max_tokens: u32) -> bool {
    estimate_tokens(text) > max_tokens as usize
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_conversation() {
        let messages = build_conversation("You are helpful", "Hello");
        assert_eq!(messages.len(), 2);
        assert_eq!(messages[0].role, MessageRole::System);
        assert_eq!(messages[1].role, MessageRole::User);
    }

    #[test]
    fn test_estimate_tokens() {
        let tokens = estimate_tokens("Hello world");
        assert!(tokens > 0);
    }
}
