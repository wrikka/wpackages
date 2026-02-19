#[derive(Debug, Clone, Default)]
pub struct TemplateLibrary {
    pub name: String,
    pub language: String,
    pub templates: Vec<Template>,
}

impl TemplateLibrary {
    pub fn new(name: String, language: String) -> Self {
        Self {
            name,
            language,
            templates: Vec::new(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct Template {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub content: String,
    pub language: Option<String>,
    pub variables: Vec<TemplateVariable>,
}

impl Template {
    pub fn new(id: String, name: String, content: String) -> Self {
        Self {
            id,
            name,
            description: None,
            content,
            language: None,
            variables: Vec::new(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct TemplateVariable {
    pub name: String,
    pub default_value: Option<String>,
}

impl TemplateVariable {
    pub fn new(name: String) -> Self {
        Self {
            name,
            default_value: None,
        }
    }
}
