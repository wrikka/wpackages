use crate::types::CompletionRequest;

pub struct ContextWindowManager {
    max_tokens: usize,
}

impl ContextWindowManager {
    pub fn new(max_tokens: usize) -> Self {
        Self { max_tokens }
    }

    pub fn truncate_request(&self, request: CompletionRequest) -> CompletionRequest {
        let prompt_tokens = self.estimate_tokens(&request.prompt);
        if prompt_tokens <= self.max_tokens {
            return request;
        }

        let ratio = self.max_tokens as f64 / prompt_tokens as f64;
        let new_len = (request.prompt.len() as f64 * ratio).floor() as usize;
        let truncated_prompt = request.prompt.chars().take(new_len).collect();

        CompletionRequest {
            prompt: truncated_prompt,
            ..request
        }
    }

    fn estimate_tokens(&self, text: &str) -> usize {
        (text.len() + 3) / 4
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_truncate_request() {
        let request = CompletionRequest::new("a".repeat(1000), "rust");
        let manager = ContextWindowManager::new(100);
        let truncated = manager.truncate_request(request);
        assert!(truncated.prompt.len() < 1000);
    }
}
