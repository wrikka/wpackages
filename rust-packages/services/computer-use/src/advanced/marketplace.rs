//! Template Marketplace (Feature 11)
//!
//! Community-driven template sharing for automation workflows

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Template metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Template {
    pub id: String,
    pub name: String,
    pub description: String,
    pub author: Author,
    pub version: String,
    pub category: TemplateCategory,
    pub tags: Vec<String>,
    pub workflow: crate::user_experience::workflow_builder::VisualWorkflow,
    pub stats: TemplateStats,
    pub rating: f32,
    pub downloads: u64,
    pub created_at: u64,
    pub updated_at: u64,
    pub verified: bool,
    pub featured: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Author {
    pub id: String,
    pub name: String,
    pub avatar: Option<String>,
    pub verified: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TemplateCategory {
    DataEntry,
    Reporting,
    WebScraping,
    FileManagement,
    Communication,
    SocialMedia,
    Finance,
    Productivity,
    Development,
    Custom(String),
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct TemplateStats {
    pub views: u64,
    pub likes: u64,
    pub forks: u64,
    pub success_rate: f32,
}

/// Review for template
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplateReview {
    pub id: String,
    pub template_id: String,
    pub author: String,
    pub rating: u8,
    pub comment: String,
    pub helpful: u64,
    pub created_at: u64,
}

/// Marketplace search filters
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SearchFilters {
    pub category: Option<TemplateCategory>,
    pub tags: Vec<String>,
    pub min_rating: Option<f32>,
    pub verified_only: bool,
    pub author: Option<String>,
    pub sort_by: SortOption,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SortOption {
    Relevance,
    Downloads,
    Rating,
    Newest,
    MostLiked,
}

impl Default for SortOption {
    fn default() -> Self {
        SortOption::Relevance
    }
}

/// Template marketplace
pub struct TemplateMarketplace {
    templates: HashMap<String, Template>,
    reviews: HashMap<String, Vec<TemplateReview>>,
    installed: Vec<String>,
    local_templates: Vec<Template>,
}

impl TemplateMarketplace {
    pub fn new() -> Self {
        Self {
            templates: HashMap::new(),
            reviews: HashMap::new(),
            installed: Vec::new(),
            local_templates: Vec::new(),
        }
    }

    /// Search templates
    pub fn search(&self, query: &str, filters: &SearchFilters) -> Vec<&Template> {
        let mut results: Vec<&Template> = self.templates
            .values()
            .filter(|t| {
                // Category filter
                if let Some(ref category) = filters.category {
                    if &t.category != category {
                        return false;
                    }
                }

                // Rating filter
                if let Some(min_rating) = filters.min_rating {
                    if t.rating < min_rating {
                        return false;
                    }
                }

                // Verified filter
                if filters.verified_only && !t.verified {
                    return false;
                }

                // Author filter
                if let Some(ref author) = filters.author {
                    if &t.author.name != author {
                        return false;
                    }
                }

                // Tags filter
                if !filters.tags.is_empty() {
                    let has_all_tags = filters.tags.iter().all(|tag| t.tags.contains(tag));
                    if !has_all_tags {
                        return false;
                    }
                }

                // Text search
                let query_lower = query.to_lowercase();
                t.name.to_lowercase().contains(&query_lower)
                    || t.description.to_lowercase().contains(&query_lower)
                    || t.tags.iter().any(|tag| tag.to_lowercase().contains(&query_lower))
            })
            .collect();

        // Sort results
        match filters.sort_by {
            SortOption::Downloads => results.sort_by(|a, b| b.downloads.cmp(&a.downloads)),
            SortOption::Rating => results.sort_by(|a, b| b.rating.partial_cmp(&a.rating).unwrap()),
            SortOption::Newest => results.sort_by(|a, b| b.created_at.cmp(&a.created_at)),
            SortOption::MostLiked => results.sort_by(|a, b| b.stats.likes.cmp(&a.stats.likes)),
            _ => {} // Relevance uses default order
        }

        results
    }

    /// Get featured templates
    pub fn get_featured(&self, limit: usize) -> Vec<&Template> {
        let mut featured: Vec<&Template> = self.templates
            .values()
            .filter(|t| t.featured)
            .collect();

        featured.sort_by(|a, b| b.rating.partial_cmp(&a.rating).unwrap());
        featured.into_iter().take(limit).collect()
    }

    /// Get trending templates
    pub fn get_trending(&self, limit: usize) -> Vec<&Template> {
        let mut trending: Vec<&Template> = self.templates.values().collect();
        
        // Sort by recent downloads and views
        trending.sort_by(|a, b| {
            let a_score = a.stats.views + a.downloads * 10;
            let b_score = b.stats.views + b.downloads * 10;
            b_score.cmp(&a_score)
        });

        trending.into_iter().take(limit).collect()
    }

    /// Get template by ID
    pub fn get_template(&self, id: &str) -> Option<&Template> {
        self.templates.get(id)
    }

    /// Install template
    pub fn install(&mut self, template_id: &str) -> Result<()> {
        let template = self.templates
            .get(template_id)
            .ok_or_else(|| anyhow::anyhow!("Template not found: {}", template_id))?
            .clone();

        self.installed.push(template_id.to_string());
        self.local_templates.push(template);

        Ok(())
    }

    /// Uninstall template
    pub fn uninstall(&mut self, template_id: &str) -> Result<()> {
        self.installed.retain(|id| id != template_id);
        self.local_templates.retain(|t| t.id != template_id);
        Ok(())
    }

    /// Get installed templates
    pub fn get_installed(&self) -> &[Template] {
        &self.local_templates
    }

    /// Submit new template
    pub fn submit(&mut self, template: Template) -> Result<String> {
        let id = uuid::Uuid::new_v4().to_string();
        let mut template = template;
        template.id = id.clone();
        template.created_at = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        template.updated_at = template.created_at;

        self.templates.insert(id.clone(), template);
        Ok(id)
    }

    /// Update existing template
    pub fn update(&mut self, template_id: &str, template: Template) -> Result<()> {
        if !self.templates.contains_key(template_id) {
            anyhow::bail!("Template not found: {}", template_id);
        }

        let mut template = template;
        template.id = template_id.to_string();
        template.updated_at = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();

        self.templates.insert(template_id.to_string(), template);
        Ok(())
    }

    /// Add review
    pub fn add_review(&mut self, review: TemplateReview) -> Result<()> {
        let template_id = review.template_id.clone();
        
        self.reviews
            .entry(template_id)
            .or_insert_with(Vec::new)
            .push(review);

        Ok(())
    }

    /// Get reviews for template
    pub fn get_reviews(&self, template_id: &str) -> Vec<&TemplateReview> {
        self.reviews
            .get(template_id)
            .map(|r| r.iter().collect())
            .unwrap_or_default()
    }

    /// Rate template
    pub fn rate(&mut self, template_id: &str, rating: u8) -> Result<()> {
        let template = self.templates
            .get_mut(template_id)
            .ok_or_else(|| anyhow::anyhow!("Template not found"))?;

        // Update average rating
        let new_rating = (template.rating * template.stats.likes as f32 + rating as f32) 
            / (template.stats.likes as f32 + 1.0);
        template.rating = new_rating.min(5.0);
        template.stats.likes += 1;

        Ok(())
    }

    /// Fork template
    pub fn fork(&mut self, template_id: &str, new_author: Author) -> Result<String> {
        let original = self.templates
            .get(template_id)
            .ok_or_else(|| anyhow::anyhow!("Template not found"))?;

        let original_forks = original.stats.forks;
        let mut forked = original.clone();

        let new_id = uuid::Uuid::new_v4().to_string();
        forked.id = new_id.clone();
        forked.author = new_author;
        forked.version = "1.0.0".to_string();
        forked.stats = TemplateStats::default();
        forked.rating = 0.0;
        forked.downloads = 0;
        forked.stats.forks = original_forks + 1;

        self.templates.insert(new_id.clone(), forked);
        Ok(new_id)
    }

    /// Export template to file
    pub fn export(&self, template_id: &str, path: &str) -> Result<()> {
        let template = self.templates
            .get(template_id)
            .ok_or_else(|| anyhow::anyhow!("Template not found"))?;

        let json = serde_json::to_string_pretty(template)?;
        std::fs::write(path, json)?;

        Ok(())
    }

    /// Import template from file
    pub fn import(&mut self, path: &str) -> Result<String> {
        let json = std::fs::read_to_string(path)?;
        let template: Template = serde_json::from_str(&json)?;
        
        let id = uuid::Uuid::new_v4().to_string();
        let mut template = template;
        template.id = id.clone();

        self.templates.insert(id.clone(), template);
        Ok(id)
    }

    /// Get categories with counts
    pub fn get_categories(&self) -> HashMap<TemplateCategory, usize> {
        let mut counts = HashMap::new();
        
        for template in self.templates.values() {
            *counts.entry(template.category.clone()).or_insert(0) += 1;
        }

        counts
    }

    /// Get popular tags
    pub fn get_popular_tags(&self, limit: usize) -> Vec<(String, usize)> {
        let mut tag_counts: HashMap<String, usize> = HashMap::new();
        
        for template in self.templates.values() {
            for tag in &template.tags {
                *tag_counts.entry(tag.clone()).or_insert(0) += 1;
            }
        }

        let mut tags: Vec<(String, usize)> = tag_counts.into_iter().collect();
        tags.sort_by(|a, b| b.1.cmp(&a.1));
        tags.into_iter().take(limit).collect()
    }
}
