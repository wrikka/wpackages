use crate::types::templates::{TemplateLibrary, Template};

#[derive(Debug, Clone, Default)]
pub struct TemplatesState {
    pub libraries: Vec<TemplateLibrary>,
    pub active_template: Option<Template>,
    pub language: Option<String>,
}

impl TemplatesState {
    pub fn new() -> Self {
        Self {
            libraries: Vec::new(),
            active_template: None,
            language: None,
        }
    }

    pub fn with_libraries(mut self, libraries: Vec<TemplateLibrary>) -> Self {
        self.libraries = libraries;
        self
    }

    pub fn with_active_template(mut self, template: Template) -> Self {
        self.active_template = Some(template);
        self
    }

    pub fn with_language(mut self, language: Option<String>) -> Self {
        self.language = language;
        self
    }

    pub fn add_library(&mut self, library: TemplateLibrary) {
        self.libraries.push(library);
    }

    pub fn set_active_template(&mut self, template: Template) {
        self.active_template = Some(template);
    }

    pub fn set_language(&mut self, language: String) {
        self.language = Some(language);
    }

    pub fn get_templates(&self) -> Vec<&Template> {
        let mut templates = Vec::new();

        for library in &self.libraries {
            for template in &library.templates {
                templates.push(template);
            }
        }

        templates
    }

    pub fn get_templates_by_language(&self, language: &str) -> Vec<&Template> {
        self.get_templates()
            .into_iter()
            .filter(|t| t.language.as_ref().map(|l| l == language).unwrap_or(true))
            .collect()
    }

    pub fn find_template(&self, name: &str) -> Option<&Template> {
        self.get_templates()
            .into_iter()
            .find(|t| t.name == name)
    }

    pub fn library_count(&self) -> usize {
        self.libraries.len()
    }
}
