#[derive(Debug, Clone, Default)]
pub struct SnippetLibrary {
    pub name: String,
    pub language: String,
    pub snippets: Vec<Snippet>,
}

impl SnippetLibrary {
    pub fn new(name: String, language: String) -> Self {
        Self {
            name,
            language,
            snippets: Vec::new(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct Snippet {
    pub id: String,
    pub name: String,
    pub prefix: String,
    pub description: Option<String>,
    pub body: String,
    pub language: Option<String>,
}

impl Snippet {
    pub fn new(id: String, name: String, prefix: String, body: String) -> Self {
        Self {
            id,
            name,
            prefix,
            description: None,
            body,
            language: None,
        }
    }

    pub fn matches_prefix(&self, prefix: &str) -> bool {
        self.prefix.starts_with(prefix)
    }
}
