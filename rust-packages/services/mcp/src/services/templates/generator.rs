use std::collections::HashMap;
use tracing::debug;

use super::template::ResourceTemplate;

#[derive(Debug, Clone)]
pub struct GeneratorConfig {
    pub cache_enabled: bool,
    pub cache_ttl: u64,
}

impl Default for GeneratorConfig {
    fn default() -> Self {
        Self {
            cache_enabled: true,
            cache_ttl: 3600,
        }
    }
}

pub struct TemplateGenerator {
    templates: HashMap<String, ResourceTemplate>,
    config: GeneratorConfig,
}

impl TemplateGenerator {
    pub fn new(config: GeneratorConfig) -> Self {
        Self {
            templates: HashMap::new(),
            config,
        }
    }

    pub fn register_template(&mut self, template: ResourceTemplate) {
        let name = template.name.clone();
        self.templates.insert(name.clone(), template);
        debug!("Registered template: {}", name);
    }

    pub fn generate(&self, template_name: &str, values: &HashMap<String, String>) -> Result<String, String> {
        let template = self.templates.get(template_name)
            .ok_or_else(|| format!("Template not found: {}", template_name))?;

        template.validate(values)?;
        template.render(values)
    }

    pub fn list_templates(&self) -> Vec<String> {
        self.templates.keys().cloned().collect()
    }

    pub fn get_template(&self, name: &str) -> Option<&ResourceTemplate> {
        self.templates.get(name)
    }
}
