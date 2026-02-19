use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Template {
    id: String,
    name: String,
    description: String,
    // path to the template files
    path: PathBuf,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ScaffoldOptions {
    project_name: String,
    variables: HashMap<String, String>,
}

pub struct ProjectScaffoldingService {
    templates: Vec<Template>,
}

impl Default for ProjectScaffoldingService {
    fn default() -> Self {
        Self::new()
    }
}

impl ProjectScaffoldingService {
    pub fn new() -> Self {
        // Load templates from a known directory
        Self { templates: vec![] }
    }

    pub fn get_templates(&self) -> &[Template] {
        &self.templates
    }

    pub fn scaffold(
        &self,
        template_id: &str,
        output_path: &Path,
        options: &ScaffoldOptions,
    ) -> Result<()> {
        let template = self
            .templates
            .iter()
            .find(|t| t.id == template_id)
            .ok_or_else(|| anyhow::anyhow!("Template not found"))?;

        // This is a simplified version. A real implementation would use a templating engine
        // like Handlebars or Tera to replace variables in file contents and names.
        let project_dir = output_path.join(&options.project_name);
        fs::create_dir_all(&project_dir)?;

        tracing::info!(
            "Scaffolding project '{}' from template '{}' into '{}'",
            options.project_name,
            template.name,
            project_dir.display()
        );

        // Example: create a dummy file
        fs::write(
            project_dir.join("README.md"),
            format!("# {}\n", options.project_name),
        )?;

        Ok(())
    }
}
