use crate::types::snippets::{SnippetLibrary, Snippet};

#[derive(Debug, Clone, Default)]
pub struct SnippetsState {
    pub libraries: Vec<SnippetLibrary>,
    pub active_snippet: Option<Snippet>,
    pub language: Option<String>,
}

impl SnippetsState {
    pub fn new() -> Self {
        Self {
            libraries: Vec::new(),
            active_snippet: None,
            language: None,
        }
    }

    pub fn with_libraries(mut self, libraries: Vec<SnippetLibrary>) -> Self {
        self.libraries = libraries;
        self
    }

    pub fn with_active_snippet(mut self, snippet: Snippet) -> Self {
        self.active_snippet = Some(snippet);
        self
    }

    pub fn with_language(mut self, language: Option<String>) -> Self {
        self.language = language;
        self
    }

    pub fn add_library(&mut self, library: SnippetLibrary) {
        self.libraries.push(library);
    }

    pub fn set_active_snippet(&mut self, snippet: Snippet) {
        self.active_snippet = Some(snippet);
    }

    pub fn set_language(&mut self, language: String) {
        self.language = Some(language);
    }

    pub fn get_snippets(&self) -> Vec<&Snippet> {
        let mut snippets = Vec::new();

        for library in &self.libraries {
            for snippet in &library.snippets {
                snippets.push(snippet);
            }
        }

        snippets
    }

    pub fn get_snippets_by_language(&self, language: &str) -> Vec<&Snippet> {
        self.get_snippets()
            .into_iter()
            .filter(|s| s.language.as_ref().map(|l| l == language).unwrap_or(true))
            .collect()
    }

    pub fn find_snippet(&self, prefix: &str) -> Option<&Snippet> {
        self.get_snippets()
            .into_iter()
            .find(|s| s.matches_prefix(prefix))
    }

    pub fn library_count(&self) -> usize {
        self.libraries.len()
    }
}
