use std::collections::HashMap;

// Represents a code snippet
pub struct Snippet {
    prefix: String,
    body: String,
    description: String,
}

pub struct SnippetsService {
    snippets: HashMap<String, Vec<Snippet>>,
}

impl SnippetsService {
    pub fn new() -> Self {
        // In a real implementation, snippets would be loaded from files.
        let mut snippets = HashMap::new();
        snippets.insert(
            "rust".to_string(),
            vec![
                Snippet {
                    prefix: "fn".to_string(),
                    body: "fn $1($2) -> $3 {\n    $0\n}".to_string(),
                    description: "Function".to_string(),
                },
                Snippet {
                    prefix: "for".to_string(),
                    body: "for $1 in $2 {\n    $0\n}".to_string(),
                    description: "For loop".to_string(),
                },
            ],
        );

        Self { snippets }
    }

    pub fn get_snippets(&self, language: &str) -> Option<&Vec<Snippet>> {
        self.snippets.get(language)
    }
}

impl Default for SnippetsService {
    fn default() -> Self {
        Self::new()
    }
}
