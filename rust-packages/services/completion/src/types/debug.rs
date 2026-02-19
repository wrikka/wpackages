use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DebugContext {
    pub file_path: Option<String>,
    pub line_number: Option<usize>,
    pub stack_trace: Option<String>,
    pub variables: std::collections::HashMap<String, String>,
}

impl DebugContext {
    pub fn new() -> Self {
        Self {
            file_path: None,
            line_number: None,
            stack_trace: None,
            variables: std::collections::HashMap::new(),
        }
    }

    pub fn with_file_path(mut self, path: impl Into<String>) -> Self {
        self.file_path = Some(path.into());
        self
    }

    pub fn with_line_number(mut self, line: usize) -> Self {
        self.line_number = Some(line);
        self
    }

    pub fn with_stack_trace(mut self, trace: impl Into<String>) -> Self {
        self.stack_trace = Some(trace.into());
        self
    }

    pub fn with_variable(mut self, name: impl Into<String>, value: impl Into<String>) -> Self {
        self.variables.insert(name.into(), value.into());
        self
    }
}

impl Default for DebugContext {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DebugSuggestion {
    pub suggestion: String,
    pub explanation: String,
    pub code_fix: Option<String>,
    pub confidence: f64,
}

impl DebugSuggestion {
    pub fn new(suggestion: impl Into<String>, explanation: impl Into<String>) -> Self {
        Self {
            suggestion: suggestion.into(),
            explanation: explanation.into(),
            code_fix: None,
            confidence: 0.0,
        }
    }

    pub fn with_code_fix(mut self, fix: impl Into<String>) -> Self {
        self.code_fix = Some(fix.into());
        self
    }

    pub fn with_confidence(mut self, confidence: f64) -> Self {
        self.confidence = confidence;
        self
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct DebugRequest {
    #[validate(length(min = 1, message = "Code cannot be empty"))]
    pub code: String,
    pub error_message: Option<String>,
    pub language: String,
    pub context: DebugContext,
}

impl DebugRequest {
    pub fn new(code: impl Into<String>, language: impl Into<String>) -> Self {
        Self {
            code: code.into(),
            error_message: None,
            language: language.into(),
            context: DebugContext::new(),
        }
    }

    pub fn with_error_message(mut self, error: impl Into<String>) -> Self {
        self.error_message = Some(error.into());
        self
    }

    pub fn with_context(mut self, context: DebugContext) -> Self {
        self.context = context;
        self
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DebugResponse {
    pub suggestions: Vec<DebugSuggestion>,
    pub analysis: String,
    pub model: String,
}

impl DebugResponse {
    pub fn new(
        suggestions: Vec<DebugSuggestion>,
        analysis: impl Into<String>,
        model: String,
    ) -> Self {
        Self {
            suggestions,
            analysis: analysis.into(),
            model,
        }
    }

    pub fn suggestion_count(&self) -> usize {
        self.suggestions.len()
    }

    pub fn get_best_suggestion(&self) -> Option<&DebugSuggestion> {
        self.suggestions.iter().max_by(|a, b| {
            a.confidence
                .partial_cmp(&b.confidence)
                .unwrap_or(std::cmp::Ordering::Equal)
        })
    }
}