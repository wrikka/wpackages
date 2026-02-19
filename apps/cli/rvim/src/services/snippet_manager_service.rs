use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// Represents a user-defined code snippet.
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Snippet {
    pub id: String,
    pub name: String,
    pub language: String,
    pub body: String,
}

pub struct SnippetManagerService {
    // In-memory storage for snippets. A real app would save this to a file.
    snippets: HashMap<String, Snippet>,
}

impl Default for SnippetManagerService {
    fn default() -> Self {
        Self::new()
    }
}

impl SnippetManagerService {
    pub fn new() -> Self {
        Self {
            snippets: HashMap::new(),
        }
    }

    pub fn add_snippet(&mut self, snippet: Snippet) -> Result<()> {
        tracing::info!("Adding snippet: '{}'", snippet.name);
        self.snippets.insert(snippet.id.clone(), snippet);
        // In a real app, you would save the updated snippet collection to disk here.
        Ok(())
    }

    pub fn get_snippet(&self, id: &str) -> Option<&Snippet> {
        self.snippets.get(id)
    }

    pub fn list_snippets_for_language(&self, language: &str) -> Vec<&Snippet> {
        self.snippets
            .values()
            .filter(|s| s.language == language)
            .collect()
    }

    pub fn remove_snippet(&mut self, id: &str) -> Option<Snippet> {
        tracing::info!("Removing snippet: {}", id);
        self.snippets.remove(id)
    }
}
