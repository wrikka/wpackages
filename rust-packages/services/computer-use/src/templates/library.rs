//! Template Library System
//!
//! Pre-built automation templates for common tasks.

use crate::error::{Error, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::fs;
use tokio::sync::Mutex;
use uuid::Uuid;

/// Template library manager
pub struct TemplateLibrary {
    templates: Arc<Mutex<HashMap<String, AutomationTemplate>>>,
    categories: Arc<Mutex<HashMap<String, TemplateCategory>>>,
    storage_path: PathBuf,
    user_favorites: Arc<Mutex<Vec<String>>>,
    usage_stats: Arc<Mutex<HashMap<String, u64>>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutomationTemplate {
    pub id: String,
    pub name: String,
    pub description: String,
    pub version: String,
    pub author: String,
    pub category: String,
    pub tags: Vec<String>,
    pub difficulty: Difficulty,
    pub estimated_duration_secs: u64,
    pub workflow: WorkflowDefinition,
    pub variables: Vec<TemplateVariable>,
    pub preview_image: Option<String>,
    pub icon: String,
    pub created_at: u64,
    pub updated_at: u64,
    pub downloads: u64,
    pub rating: f64,
    pub is_official: bool,
    pub is_verified: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Difficulty {
    Beginner,
    Intermediate,
    Advanced,
    Expert,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplateVariable {
    pub name: String,
    pub description: String,
    pub var_type: VariableType,
    pub default_value: Option<String>,
    pub required: bool,
    pub placeholder: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VariableType {
    String,
    Number,
    Boolean,
    Path,
    Url,
    Email,
    Selection { options: Vec<String> },
    MultiSelect { options: Vec<String> },
    Secret,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowDefinition {
    pub actions: Vec<TemplateAction>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplateAction {
    pub action_type: String,
    pub description: String,
    pub params: HashMap<String, serde_json::Value>,
    pub screenshot_ref: Option<String>,
    pub help_text: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplateCategory {
    pub id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
    pub color: String,
    pub template_count: usize,
}

impl TemplateLibrary {
    pub fn new(storage_path: PathBuf) -> Self {
        Self {
            templates: Arc::new(Mutex::new(HashMap::new())),
            categories: Arc::new(Mutex::new(HashMap::new())),
            storage_path,
            user_favorites: Arc::new(Mutex::new(vec![])),
            usage_stats: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn initialize(&self) -> Result<()> {
        // Create storage directory
        fs::create_dir_all(&self.storage_path).await.map_err(|e| Error::Io(e))?;
        
        // Load built-in templates
        self.load_builtin_templates().await;
        
        // Load user templates
        self.load_user_templates().await?;
        
        Ok(())
    }

    /// Get a template by ID
    pub async fn get_template(&self, id: &str) -> Option<AutomationTemplate> {
        let template = self.templates.lock().await.get(id).cloned();
        if template.is_some() {
            // Update usage stats
            let mut stats = self.usage_stats.lock().await;
            *stats.entry(id.to_string()).or_insert(0) += 1;
        }
        template
    }

    /// Search templates
    pub async fn search_templates(&self, query: &str, category: Option<&str>) -> Vec<AutomationTemplate> {
        let templates = self.templates.lock().await;
        let query_lower = query.to_lowercase();
        
        templates
            .values()
            .filter(|t| {
                let matches_query = t.name.to_lowercase().contains(&query_lower)
                    || t.description.to_lowercase().contains(&query_lower)
                    || t.tags.iter().any(|tag| tag.to_lowercase().contains(&query_lower));
                
                let matches_category = category.map_or(true, |c| t.category == c);
                
                matches_query && matches_category
            })
            .cloned()
            .collect()
    }

    /// Get templates by category
    pub async fn get_templates_by_category(&self, category: &str) -> Vec<AutomationTemplate> {
        self.templates
            .lock()
            .await
            .values()
            .filter(|t| t.category == category)
            .cloned()
            .collect()
    }

    /// Get all categories
    pub async fn get_categories(&self) -> Vec<TemplateCategory> {
        self.categories.lock().await.values().cloned().collect()
    }

    /// Add custom template
    pub async fn add_template(&self, template: AutomationTemplate) -> Result<String> {
        let id = template.id.clone();
        self.templates.lock().await.insert(id.clone(), template);
        
        // Save to disk
        self.save_template(&id).await?;
        
        // Update category count
        if let Some(category) = self.categories.lock().await.get_mut(&template.category) {
            category.template_count += 1;
        }
        
        Ok(id)
    }

    /// Delete template
    pub async fn delete_template(&self, id: &str) -> Result<()> {
        let template = self.templates
            .lock()
            .await
            .remove(id)
            .ok_or_else(|| Error::InvalidCommand(format!("Template {} not found", id)))?;
        
        // Update category count
        if let Some(category) = self.categories.lock().await.get_mut(&template.category) {
            if category.template_count > 0 {
                category.template_count -= 1;
            }
        }
        
        // Delete from disk
        let path = self.storage_path.join(format!("{}.json", id));
        let _ = fs::remove_file(path).await;
        
        Ok(())
    }

    /// Add to favorites
    pub async fn add_to_favorites(&self, template_id: &str) -> Result<()> {
        if !self.templates.lock().await.contains_key(template_id) {
            return Err(Error::InvalidCommand(format!("Template {} not found", template_id)));
        }
        
        let mut favorites = self.user_favorites.lock().await;
        if !favorites.contains(&template_id.to_string()) {
            favorites.push(template_id.to_string());
        }
        
        Ok(())
    }

    /// Get favorites
    pub async fn get_favorites(&self) -> Vec<AutomationTemplate> {
        let favorites = self.user_favorites.lock().await.clone();
        let templates = self.templates.lock().await;
        
        favorites
            .into_iter()
            .filter_map(|id| templates.get(&id).cloned())
            .collect()
    }

    /// Get trending templates
    pub async fn get_trending(&self, limit: usize) -> Vec<AutomationTemplate> {
        let stats = self.usage_stats.lock().await;
        let templates = self.templates.lock().await;
        
        let mut sorted: Vec<_> = stats.iter().collect();
        sorted.sort_by(|a, b| b.1.cmp(a.1));
        
        sorted
            .into_iter()
            .take(limit)
            .filter_map(|(id, _)| templates.get(id).cloned())
            .collect()
    }

    /// Instantiate template with variables
    pub async fn instantiate(&self, template_id: &str, variables: HashMap<String, String>) -> Result<WorkflowDefinition> {
        let template = self.get_template(template_id).await
            .ok_or_else(|| Error::InvalidCommand(format!("Template {} not found", template_id)))?;
        
        // Validate required variables
        for var in &template.variables {
            if var.required && !variables.contains_key(&var.name) {
                return Err(Error::InvalidCommand(format!(
                    "Required variable '{}' not provided",
                    var.name
                )));
            }
        }
        
        // Substitute variables in workflow
        let workflow_json = serde_json::to_string(&template.workflow)
            .map_err(|e| Error::Protocol(e.to_string()))?;
        
        let mut workflow_str = workflow_json;
        for (name, value) in variables {
            workflow_str = workflow_str.replace(&format!("{{{{{}}}}}", name), &value);
        }
        
        let workflow: WorkflowDefinition = serde_json::from_str(&workflow_str)
            .map_err(|e| Error::Protocol(e.to_string()))?;
        
        Ok(workflow)
    }

    async fn load_builtin_templates(&self) {
        // Load built-in templates
        let templates = get_builtin_templates();
        for template in templates {
            self.templates.lock().await.insert(template.id.clone(), template);
        }
        
        // Setup default categories
        let mut categories = self.categories.lock().await;
        categories.insert("productivity".to_string(), TemplateCategory {
            id: "productivity".to_string(),
            name: "Productivity".to_string(),
            description: "Automate daily productivity tasks".to_string(),
            icon: "zap".to_string(),
            color: "#f59e0b".to_string(),
            template_count: 0,
        });
        categories.insert("data".to_string(), TemplateCategory {
            id: "data".to_string(),
            name: "Data Processing".to_string(),
            description: "Extract, transform, and load data".to_string(),
            icon: "database".to_string(),
            color: "#3b82f6".to_string(),
            template_count: 0,
        });
    }

    async fn load_user_templates(&self) -> Result<()> {
        if let Ok(mut entries) = fs::read_dir(&self.storage_path).await {
            while let Ok(Some(entry)) = entries.next_entry().await {
                let path = entry.path();
                if path.extension().and_then(|e| e.to_str()) == Some("json") {
                    if let Ok(content) = fs::read_to_string(&path).await {
                        if let Ok(template) = serde_json::from_str::<AutomationTemplate>(&content) {
                            self.templates.lock().await.insert(template.id.clone(), template);
                        }
                    }
                }
            }
        }
        Ok(())
    }

    async fn save_template(&self, id: &str) -> Result<()> {
        let templates = self.templates.lock().await;
        let template = templates.get(id)
            .ok_or_else(|| Error::InvalidCommand(format!("Template {} not found", id)))?;
        
        let path = self.storage_path.join(format!("{}.json", id));
        let json = serde_json::to_string_pretty(template)
            .map_err(|e| Error::Protocol(e.to_string()))?;
        
        fs::write(path, json).await.map_err(|e| Error::Io(e))?;
        Ok(())
    }
}

/// Built-in templates
fn get_builtin_templates() -> Vec<AutomationTemplate> {
    vec![
        AutomationTemplate {
            id: "daily-report".to_string(),
            name: "Daily Report Generator".to_string(),
            description: "Collect data from multiple sources and generate a daily report".to_string(),
            version: "1.0.0".to_string(),
            author: "System".to_string(),
            category: "productivity".to_string(),
            tags: vec!["report".to_string(), "daily".to_string(), "automation".to_string()],
            difficulty: Difficulty::Beginner,
            estimated_duration_secs: 300,
            workflow: WorkflowDefinition {
                actions: vec![],
            },
            variables: vec![
                TemplateVariable {
                    name: "report_name".to_string(),
                    description: "Name of the report".to_string(),
                    var_type: VariableType::String,
                    default_value: Some("Daily Report".to_string()),
                    required: true,
                    placeholder: Some("Enter report name".to_string()),
                },
            ],
            preview_image: None,
            icon: "file-text".to_string(),
            created_at: current_timestamp(),
            updated_at: current_timestamp(),
            downloads: 1000,
            rating: 4.5,
            is_official: true,
            is_verified: true,
        },
        AutomationTemplate {
            id: "form-filler".to_string(),
            name: "Smart Form Filler".to_string(),
            description: "Automatically fill forms with data from clipboard or database".to_string(),
            version: "1.0.0".to_string(),
            author: "System".to_string(),
            category: "productivity".to_string(),
            tags: vec!["forms".to_string(), "data-entry".to_string()],
            difficulty: Difficulty::Intermediate,
            estimated_duration_secs: 180,
            workflow: WorkflowDefinition {
                actions: vec![],
            },
            variables: vec![],
            preview_image: None,
            icon: "edit".to_string(),
            created_at: current_timestamp(),
            updated_at: current_timestamp(),
            downloads: 2500,
            rating: 4.8,
            is_official: true,
            is_verified: true,
        },
        AutomationTemplate {
            id: "data-extraction".to_string(),
            name: "Website Data Extractor".to_string(),
            description: "Extract structured data from websites and save to spreadsheet".to_string(),
            version: "1.0.0".to_string(),
            author: "System".to_string(),
            category: "data".to_string(),
            tags: vec!["scraping".to_string(), "data".to_string(), "web".to_string()],
            difficulty: Difficulty::Advanced,
            estimated_duration_secs: 600,
            workflow: WorkflowDefinition {
                actions: vec![],
            },
            variables: vec![],
            preview_image: None,
            icon: "download".to_string(),
            created_at: current_timestamp(),
            updated_at: current_timestamp(),
            downloads: 1500,
            rating: 4.3,
            is_official: true,
            is_verified: true,
        },
    ]
}

fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}
