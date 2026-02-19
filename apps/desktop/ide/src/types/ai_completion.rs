#[derive(Debug, Clone, Default)]
pub struct AiCompletionClient {
    pub config: ModelConfig,
}

impl AiCompletionClient {
    pub fn new(config: ModelConfig) -> Self {
        Self { config }
    }
}

#[derive(Debug, Clone)]
pub struct ModelConfig {
    pub api_key: String,
    pub model: String,
    pub base_url: Option<String>,
    pub max_tokens: usize,
    pub temperature: f32,
}

impl ModelConfig {
    pub fn new(api_key: String, model: String) -> Self {
        Self {
            api_key,
            model,
            base_url: None,
            max_tokens: 2048,
            temperature: 0.7,
        }
    }
}

#[derive(Debug, Clone)]
pub struct CompletionRequest {
    pub prompt: String,
    pub language: String,
    pub context: CompletionContext,
    pub options: CompletionOptions,
}

#[derive(Debug, Clone, Default)]
pub struct CompletionContext {
    pub file_path: Option<String>,
    pub cursor_line: usize,
    pub cursor_column: usize,
    pub prefix: String,
    pub suffix: String,
}

#[derive(Debug, Clone, Default)]
pub struct CompletionOptions {
    pub max_suggestions: usize,
    pub enable_snippet: bool,
}
