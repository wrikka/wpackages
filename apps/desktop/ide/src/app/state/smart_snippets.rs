use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SmartSnippet {
    pub id: String,
    pub name: String,
    pub prefix: String,
    pub description: String,
    pub body: Vec<String>,
    pub language: String,
    pub context: SnippetContext,
    pub variables: Vec<SnippetVariable>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnippetContext {
    pub trigger_pattern: String,
    pub scope: Vec<String>,
    pub requires_selection: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnippetVariable {
    pub name: String,
    pub default_value: Option<String>,
    pub prompt: Option<String>,
    pub choices: Option<Vec<String>>,
}

#[derive(Debug, Clone, Default)]
pub struct SmartSnippetsState {
    pub snippets: Vec<SmartSnippet>,
    pub suggestions: Vec<SnippetSuggestion>,
    pub auto_expand: bool,
    pub show_preview: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnippetSuggestion {
    pub snippet_id: String,
    pub name: String,
    pub relevance: f32,
    pub preview: String,
}

impl SmartSnippetsState {
    pub fn new() -> Self {
        Self {
            snippets: Vec::new(),
            suggestions: Vec::new(),
            auto_expand: true,
            show_preview: true,
        }
    }

    pub fn add_snippet(&mut self, snippet: SmartSnippet) {
        self.snippets.push(snippet);
    }

    pub fn remove_snippet(&mut self, id: &str) {
        self.snippets.retain(|s| s.id != id);
    }

    pub fn suggest_snippets(&mut self, context: &str, language: &str) {
        self.suggestions.clear();
        for snippet in &self.snippets {
            if snippet.language == language && context.contains(&snippet.prefix) {
                self.suggestions.push(SnippetSuggestion {
                    snippet_id: snippet.id.clone(),
                    name: snippet.name.clone(),
                    relevance: 0.8,
                    preview: snippet.body.join("\n"),
                });
            }
        }
    }

    pub fn expand_snippet(&self, snippet_id: &str, variables: HashMap<String, String>) -> Vec<String> {
        if let Some(snippet) = self.snippets.iter().find(|s| s.id == snippet_id) {
            let mut result = Vec::new();
            for line in &snippet.body {
                let mut expanded_line = line.clone();
                for var in &snippet.variables {
                    let value = variables.get(&var.name).cloned()
                        .unwrap_or_else(|| var.default_value.clone().unwrap_or_default());
                    expanded_line = expanded_line.replace(&format!("${{{}}}", var.name), &value);
                }
                result.push(expanded_line);
            }
            result
        } else {
            Vec::new()
        }
    }
}
