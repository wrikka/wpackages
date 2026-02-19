use crate::error::BufferResult;
use crate::types::Position;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Snippet placeholder
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SnippetPlaceholder {
    pub name: String,
    pub default_value: Option<String>,
}

impl SnippetPlaceholder {
    pub fn new(name: String) -> Self {
        Self {
            name,
            default_value: None,
        }
    }

    pub fn with_default(name: String, default_value: String) -> Self {
        Self {
            name,
            default_value: Some(default_value),
        }
    }
}

/// Code snippet
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Snippet {
    pub name: String,
    pub prefix: String,
    pub description: String,
    pub body: String,
    pub language: Option<String>,
    pub placeholders: Vec<SnippetPlaceholder>,
}

impl Snippet {
    pub fn new(name: String, prefix: String, body: String) -> Self {
        Self {
            name,
            prefix,
            description: String::new(),
            body,
            language: None,
            placeholders: Vec::new(),
        }
    }

    pub fn with_description(mut self, description: String) -> Self {
        self.description = description;
        self
    }

    pub fn with_language(mut self, language: String) -> Self {
        self.language = Some(language);
        self
    }

    pub fn with_placeholders(mut self, placeholders: Vec<SnippetPlaceholder>) -> Self {
        self.placeholders = placeholders;
        self
    }

    /// Expand snippet with placeholder values
    pub fn expand(&self, values: &HashMap<String, String>) -> String {
        let mut result = self.body.clone();

        // Replace placeholders with values
        for placeholder in &self.placeholders {
            let value = values
                .get(&placeholder.name)
                .or(placeholder.default_value.as_ref())
                .unwrap_or(&placeholder.name);

            result = result.replace(&format!("${{{}}}", placeholder.name), value);
            result = result.replace(&format!("${{{}:{}}}", placeholder.name, placeholder.name), value);
        }

        result
    }

    /// Get tab stops in the snippet
    pub fn get_tab_stops(&self) -> Vec<(usize, String)> {
        let mut stops = Vec::new();
        let mut idx = 0;

        for (i, placeholder) in self.placeholders.iter().enumerate() {
            stops.push((i + 1, placeholder.name.clone()));
        }

        stops
    }
}

/// Snippet manager
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnippetManager {
    snippets: HashMap<String, Vec<Snippet>>,
}

impl Default for SnippetManager {
    fn default() -> Self {
        Self::new()
    }
}

impl SnippetManager {
    pub fn new() -> Self {
        Self {
            snippets: HashMap::new(),
        }
    }

    /// Add a snippet
    pub fn add_snippet(&mut self, snippet: Snippet) {
        let language = snippet.language.clone().unwrap_or_else(|| "default".to_string());
        self.snippets
            .entry(language)
            .or_insert_with(Vec::new)
            .push(snippet);
    }

    /// Get snippets for a language
    pub fn get_snippets(&self, language: &str) -> &[Snippet] {
        self.snippets
            .get(language)
            .map(|v| v.as_slice())
            .unwrap_or(&[])
    }

    /// Get snippets for all languages
    pub fn get_all_snippets(&self) -> Vec<&Snippet> {
        self.snippets
            .values()
            .flat_map(|v| v.iter())
            .collect()
    }

    /// Find snippet by prefix
    pub fn find_by_prefix(&self, prefix: &str, language: Option<&str>) -> Option<&Snippet> {
        if let Some(lang) = language {
            self.snippets
                .get(lang)
                .and_then(|snippets| snippets.iter().find(|s| s.prefix == prefix))
        } else {
            self.get_all_snippets()
                .into_iter()
                .find(|s| s.prefix == prefix)
        }
    }

    /// Search snippets by prefix (fuzzy match)
    pub fn search(&self, query: &str, language: Option<&str>) -> Vec<&Snippet> {
        let query_lower = query.to_lowercase();

        if let Some(lang) = language {
            if let Some(snippets) = self.snippets.get(lang) {
                snippets
                    .iter()
                    .filter(|s| {
                        s.prefix.to_lowercase().starts_with(&query_lower)
                            || s.name.to_lowercase().contains(&query_lower)
                    })
                    .collect()
            } else {
                Vec::new()
            }
        } else {
            self.get_all_snippets()
                .into_iter()
                .filter(|s| {
                    s.prefix.to_lowercase().starts_with(&query_lower)
                        || s.name.to_lowercase().contains(&query_lower)
                })
                .collect()
        }
    }

    /// Remove snippet
    pub fn remove_snippet(&mut self, name: &str, language: &str) -> bool {
        if let Some(snippets) = self.snippets.get_mut(language) {
            let original_len = snippets.len();
            snippets.retain(|s| s.name != name);
            snippets.len() < original_len
        } else {
            false
        }
    }

    /// Clear all snippets for a language
    pub fn clear_language(&mut self, language: &str) {
        self.snippets.remove(language);
    }

    /// Clear all snippets
    pub fn clear(&mut self) {
        self.snippets.clear();
    }

    /// Load default snippets for common languages
    pub fn load_defaults(&mut self) {
        // Rust snippets
        self.add_snippet(Snippet::new(
            "fn".to_string(),
            "fn".to_string(),
            "fn $1($2) {\n    $0\n}".to_string(),
        )
        .with_description("Function".to_string())
        .with_language("rust".to_string())
        .with_placeholders(vec![
            SnippetPlaceholder::new("name".to_string()),
            SnippetPlaceholder::new("args".to_string()),
        ]));

        self.add_snippet(Snippet::new(
            "main".to_string(),
            "main".to_string(),
            "fn main() {\n    $0\n}".to_string(),
        )
        .with_description("Main function".to_string())
        .with_language("rust".to_string()));

        self.add_snippet(Snippet::new(
            "struct".to_string(),
            "struct".to_string(),
            "struct $1 {\n    $0\n}".to_string(),
        )
        .with_description("Struct".to_string())
        .with_language("rust".to_string())
        .with_placeholders(vec![SnippetPlaceholder::new("name".to_string())]));

        self.add_snippet(Snippet::new(
            "impl".to_string(),
            "impl".to_string(),
            "impl $1 {\n    $0\n}".to_string(),
        )
        .with_description("Implementation block".to_string())
        .with_language("rust".to_string())
        .with_placeholders(vec![SnippetPlaceholder::new("type".to_string())]));

        // JavaScript/TypeScript snippets
        self.add_snippet(Snippet::new(
            "function".to_string(),
            "fn".to_string(),
            "function $1($2) {\n    $0\n}".to_string(),
        )
        .with_description("Function".to_string())
        .with_language("javascript".to_string())
        .with_placeholders(vec![
            SnippetPlaceholder::new("name".to_string()),
            SnippetPlaceholder::new("args".to_string()),
        ]));

        self.add_snippet(Snippet::new(
            "console.log".to_string(),
            "log".to_string(),
            "console.log($0);".to_string(),
        )
        .with_description("Console log".to_string())
        .with_language("javascript".to_string()));

        // Python snippets
        self.add_snippet(Snippet::new(
            "def".to_string(),
            "def".to_string(),
            "def $1($2):\n    $0".to_string(),
        )
        .with_description("Function".to_string())
        .with_language("python".to_string())
        .with_placeholders(vec![
            SnippetPlaceholder::new("name".to_string()),
            SnippetPlaceholder::new("args".to_string()),
        ]));

        self.add_snippet(Snippet::new(
            "class".to_string(),
            "class".to_string(),
            "class $1:\n    def __init__(self):\n        $0".to_string(),
        )
        .with_description("Class".to_string())
        .with_language("python".to_string())
        .with_placeholders(vec![SnippetPlaceholder::new("name".to_string())]));
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_snippet_creation() {
        let snippet = Snippet::new("test".to_string(), "tst".to_string(), "test body".to_string());
        assert_eq!(snippet.name, "test");
        assert_eq!(snippet.prefix, "tst");
    }

    #[test]
    fn test_snippet_expand() {
        let snippet = Snippet::new(
            "test".to_string(),
            "tst".to_string(),
            "function ${name}() { return ${value}; }".to_string(),
        )
        .with_placeholders(vec![
            SnippetPlaceholder::new("name".to_string()),
            SnippetPlaceholder::new("value".to_string()),
        ]);

        let mut values = HashMap::new();
        values.insert("name".to_string(), "test".to_string());
        values.insert("value".to_string(), "42".to_string());

        let expanded = snippet.expand(&values);
        assert_eq!(expanded, "function test() { return 42; }");
    }

    #[test]
    fn test_snippet_manager() {
        let mut manager = SnippetManager::new();
        let snippet = Snippet::new("test".to_string(), "tst".to_string(), "test body".to_string())
            .with_language("rust".to_string());

        manager.add_snippet(snippet);
        assert_eq!(manager.get_snippets("rust").len(), 1);
    }

    #[test]
    fn test_find_by_prefix() {
        let mut manager = SnippetManager::new();
        manager.add_snippet(
            Snippet::new("test".to_string(), "tst".to_string(), "test body".to_string())
                .with_language("rust".to_string()),
        );

        let found = manager.find_by_prefix("tst", Some("rust"));
        assert!(found.is_some());
        assert_eq!(found.unwrap().name, "test");
    }

    #[test]
    fn test_search_snippets() {
        let mut manager = SnippetManager::new();
        manager.add_snippet(
            Snippet::new("function".to_string(), "fn".to_string(), "fn body".to_string())
                .with_language("rust".to_string()),
        );

        let results = manager.search("f", Some("rust"));
        assert_eq!(results.len(), 1);
    }
}
