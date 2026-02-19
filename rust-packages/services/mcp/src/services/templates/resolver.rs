use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResolutionContext {
    pub variables: HashMap<String, String>,
    pub metadata: HashMap<String, String>,
}

impl ResolutionContext {
    pub fn new() -> Self {
        Self {
            variables: HashMap::new(),
            metadata: HashMap::new(),
        }
    }

    pub fn with_variable(mut self, key: String, value: String) -> Self {
        self.variables.insert(key, value);
        self
    }

    pub fn with_metadata(mut self, key: String, value: String) -> Self {
        self.metadata.insert(key, value);
        self
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResolutionResult {
    pub uri: String,
    pub resolved: bool,
    pub error: Option<String>,
}

pub struct TemplateResolver {
    context: ResolutionContext,
}

impl TemplateResolver {
    pub fn new(context: ResolutionContext) -> Self {
        Self { context }
    }

    pub fn resolve(&self, template: &str) -> ResolutionResult {
        let mut result = template.to_string();

        for (key, value) in &self.context.variables {
            result = result.replace(&format!("{{{{{}}}}}", key), value);
        }

        let resolved = !result.contains("{{");
        let error = if !resolved {
            Some("Unresolved variables found".to_string())
        } else {
            None
        };

        ResolutionResult {
            uri: result,
            resolved,
            error,
        }
    }

    pub fn context(&self) -> &ResolutionContext {
        &self.context
    }
}
