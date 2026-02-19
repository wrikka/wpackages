use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CompletionKind {
    Function,
    Variable,
    Class,
    Interface,
    Type,
    Property,
    Method,
    Keyword,
    Snippet,
    File,
    Directory,
    Module,
    Operator,
    Parameter,
    Field,
    Enum,
    EnumMember,
    Constant,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompletionContext {
    pub file_path: Option<String>,
    pub cursor_line: usize,
    pub cursor_column: usize,
    pub prefix: String,
    pub suffix: String,
    pub imports: Vec<String>,
    pub symbols: Vec<String>,
}

impl CompletionContext {
    pub fn new() -> Self {
        Self {
            file_path: None,
            cursor_line: 0,
            cursor_column: 0,
            prefix: String::new(),
            suffix: String::new(),
            imports: Vec::new(),
            symbols: Vec::new(),
        }
    }

    pub fn with_file_path(mut self, path: impl Into<String>) -> Self {
        self.file_path = Some(path.into());
        self
    }

    pub fn with_cursor_position(mut self, line: usize, column: usize) -> Self {
        self.cursor_line = line;
        self.cursor_column = column;
        self
    }

    pub fn with_prefix(mut self, prefix: impl Into<String>) -> Self {
        self.prefix = prefix.into();
        self
    }

    pub fn with_suffix(mut self, suffix: impl Into<String>) -> Self {
        self.suffix = suffix.into();
        self
    }

    pub fn with_imports(mut self, imports: Vec<String>) -> Self {
        self.imports = imports;
        self
    }

    pub fn with_symbols(mut self, symbols: Vec<String>) -> Self {
        self.symbols = symbols;
        self
    }
}

impl Default for CompletionContext {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompletionOptions {
    pub enable_fuzzy_match: bool,
    pub enable_snippet: bool,
    pub enable_code_completion: bool,
    pub enable_doc_completion: bool,
    pub max_suggestions: usize,
}

impl CompletionOptions {
    pub fn new() -> Self {
        Self {
            enable_fuzzy_match: true,
            enable_snippet: true,
            enable_code_completion: true,
            enable_doc_completion: true,
            max_suggestions: 10,
        }
    }

    pub fn with_fuzzy_match(mut self, enable: bool) -> Self {
        self.enable_fuzzy_match = enable;
        self
    }

    pub fn with_snippet(mut self, enable: bool) -> Self {
        self.enable_snippet = enable;
        self
    }

    pub fn with_code_completion(mut self, enable: bool) -> Self {
        self.enable_code_completion = enable;
        self
    }

    pub fn with_doc_completion(mut self, enable: bool) -> Self {
        self.enable_doc_completion = enable;
        self
    }

    pub fn with_max_suggestions(mut self, max: usize) -> Self {
        self.max_suggestions = max;
        self
    }
}

impl Default for CompletionOptions {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompletionSuggestion {
    pub text: String,
    pub display_text: String,
    pub kind: CompletionKind,
    pub detail: Option<String>,
    pub documentation: Option<String>,
    pub score: f64,
    pub is_snippet: bool,
}

impl CompletionSuggestion {
    pub fn new(text: impl Into<String>, kind: CompletionKind) -> Self {
        let text = text.into();
        Self {
            text: text.clone(),
            display_text: text,
            kind,
            detail: None,
            documentation: None,
            score: 0.0,
            is_snippet: false,
        }
    }

    pub fn with_display_text(mut self, display: impl Into<String>) -> Self {
        self.display_text = display.into();
        self
    }

    pub fn with_detail(mut self, detail: impl Into<String>) -> Self {
        self.detail = Some(detail.into());
        self
    }

    pub fn with_documentation(mut self, doc: impl Into<String>) -> Self {
        self.documentation = Some(doc.into());
        self
    }

    pub fn with_score(mut self, score: f64) -> Self {
        self.score = score;
        self
    }

    pub fn with_snippet(mut self, is_snippet: bool) -> Self {
        self.is_snippet = is_snippet;
        self
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct CompletionRequest {
    #[validate(length(min = 1, message = "Prompt cannot be empty"))]
    pub prompt: String,
    pub language: String,
    pub max_tokens: Option<usize>,
    pub temperature: Option<f32>,
    pub context: CompletionContext,
    pub options: CompletionOptions,
}

impl CompletionRequest {
    pub fn new(prompt: impl Into<String>, language: impl Into<String>) -> Self {
        Self {
            prompt: prompt.into(),
            language: language.into(),
            max_tokens: None,
            temperature: None,
            context: CompletionContext::new(),
            options: CompletionOptions::new(),
        }
    }

    pub fn with_max_tokens(mut self, max: usize) -> Self {
        self.max_tokens = Some(max);
        self
    }

    pub fn with_temperature(mut self, temp: f32) -> Self {
        self.temperature = Some(temp);
        self
    }

    pub fn with_context(mut self, context: CompletionContext) -> Self {
        self.context = context;
        self
    }

    pub fn with_options(mut self, options: CompletionOptions) -> Self {
        self.options = options;
        self
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompletionResponse {
    pub suggestions: Vec<CompletionSuggestion>,
    pub model: String,
    pub tokens_used: usize,
    pub duration_ms: u64,
}

impl CompletionResponse {
    pub fn new(suggestions: Vec<CompletionSuggestion>, model: String) -> Self {
        Self {
            suggestions,
            model,
            tokens_used: 0,
            duration_ms: 0,
        }
    }

    pub fn with_tokens_used(mut self, tokens: usize) -> Self {
        self.tokens_used = tokens;
        self
    }

    pub fn with_duration(mut self, duration: u64) -> Self {
        self.duration_ms = duration;
        self
    }

    pub fn suggestion_count(&self) -> usize {
        self.suggestions.len()
    }

    pub fn get_best_suggestion(&self) -> Option<&CompletionSuggestion> {
        self.suggestions.iter().max_by(|a, b| {
            a.score
                .partial_cmp(&b.score)
                .unwrap_or(std::cmp::Ordering::Equal)
        })
    }

    pub fn get_sorted_suggestions(&self) -> Vec<&CompletionSuggestion> {
        let mut sorted = self.suggestions.iter().collect::<Vec<_>>();
        sorted.sort_by(|a, b| {
            b.score
                .partial_cmp(&a.score)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        sorted
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_completion_request() {
        let request = CompletionRequest::new("fn main", "rust")
            .with_max_tokens(100)
            .with_temperature(0.5);

        assert_eq!(request.prompt, "fn main");
        assert_eq!(request.language, "rust");
        assert_eq!(request.max_tokens, Some(100));
    }

    #[test]
    fn test_completion_suggestion() {
        let suggestion = CompletionSuggestion::new("function", CompletionKind::Function)
            .with_score(0.9)
            .with_detail("A function")
            .with_snippet(true);

        assert_eq!(suggestion.text, "function");
        assert_eq!(suggestion.kind, CompletionKind::Function);
        assert_eq!(suggestion.score, 0.9);
        assert!(suggestion.is_snippet);
    }

    #[test]
    fn test_completion_response() {
        let suggestions = vec![
            CompletionSuggestion::new("func1", CompletionKind::Function).with_score(0.9),
            CompletionSuggestion::new("func2", CompletionKind::Function).with_score(0.8),
        ];

        let response = CompletionResponse::new(suggestions, "gpt-4".to_string())
            .with_tokens_used(50)
            .with_duration(100);

        assert_eq!(response.suggestion_count(), 2);
        assert_eq!(response.tokens_used, 50);
        assert!(response.get_best_suggestion().is_some());
    }
}
