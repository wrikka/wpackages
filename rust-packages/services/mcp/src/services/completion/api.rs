use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompletionRequest {
    pub query: String,
    pub cursor_position: usize,
    pub context: Option<serde_json::Value>,
    pub max_results: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompletionItem {
    pub label: String,
    pub kind: CompletionItemKind,
    pub detail: Option<String>,
    pub documentation: Option<String>,
    pub insert_text: String,
    pub sort_text: Option<String>,
    pub filter_text: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CompletionItemKind {
    Method,
    Function,
    Constructor,
    Field,
    Variable,
    Class,
    Interface,
    Module,
    Property,
    Unit,
    Value,
    Enum,
    Keyword,
    Snippet,
    Color,
    File,
    Reference,
    Folder,
    EnumMember,
    Constant,
    Struct,
    Event,
    Operator,
    TypeParameter,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompletionResponse {
    pub items: Vec<CompletionItem>,
    pub is_incomplete: bool,
}

pub struct CompletionApi {
    suggestions: Vec<CompletionItem>,
}

impl CompletionApi {
    pub fn new() -> Self {
        Self {
            suggestions: Vec::new(),
        }
    }

    pub async fn complete(&self, request: CompletionRequest) -> CompletionResponse {
        let mut items = Vec::new();

        let query_lower = request.query.to_lowercase();

        for suggestion in &self.suggestions {
            if suggestion.label.to_lowercase().contains(&query_lower) {
                items.push(suggestion.clone());
            }
        }

        items.sort_by(|a, b| {
            let a_score = self.calculate_relevance_score(&request.query, a);
            let b_score = self.calculate_relevance_score(&request.query, b);
            b_score.partial_cmp(&a_score).unwrap_or(std::cmp::Ordering::Equal)
        });

        items.truncate(request.max_results);

        CompletionResponse {
            items,
            is_incomplete: false,
        }
    }

    pub fn register_suggestion(&mut self, item: CompletionItem) {
        self.suggestions.push(item);
    }

    pub fn register_suggestions(&mut self, items: Vec<CompletionItem>) {
        self.suggestions.extend(items);
    }

    fn calculate_relevance_score(&self, query: &str, item: &CompletionItem) -> f64 {
        let query_lower = query.to_lowercase();
        let label_lower = item.label.to_lowercase();

        let mut score = 0.0;

        if label_lower.starts_with(&query_lower) {
            score += 10.0;
        } else if label_lower.contains(&query_lower) {
            score += 5.0;
        }

        if let Some(filter_text) = &item.filter_text {
            let filter_lower = filter_text.to_lowercase();
            if filter_lower.starts_with(&query_lower) {
                score += 8.0;
            } else if filter_lower.contains(&query_lower) {
                score += 4.0;
            }
        }

        score
    }
}
