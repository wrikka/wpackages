//! Main entry point for wdocs-search application
//!
//! This file serves as the composition root for the wdocs-search library,
//! providing a high-level interface for common operations.

use crate::config::SearchConfig;
use crate::error::{ConfigResult, SearchError};
use crate::prelude::*;
use crate::telemetry::{init_telemetry, TelemetryConfig};
use std::path::PathBuf;

/// Main application structure
#[derive(Debug)]
pub struct WdocsSearchApp {
    config: SearchConfig,
    index: Option<Index>,
}

impl Default for WdocsSearchApp {
    fn default() -> Self {
        Self::new()
    }
}

impl WdocsSearchApp {
    /// Create new application instance
    pub fn new() -> Self {
        let config = SearchConfig::from_env().unwrap_or_else(|e| {
            eprintln!("Failed to load configuration: {}", e);
            SearchConfig::default()
        });

        Self {
            config,
            index: None,
        }
    }

    /// Create application with custom configuration
    pub fn with_config(config: SearchConfig) -> Self {
        Self {
            config,
            index: None,
        }
    }

    /// Initialize the application
    pub fn initialize(&mut self) -> ConfigResult<()> {
        // Initialize telemetry
        let telemetry_config = TelemetryConfig {
            log_level: self.config.log_level.clone(),
            enable_file_logging: self.config.debug,
            log_file_path: self
                .config
                .get_backup_dir()
                .map(|dir| dir.join("wdocs-search.log").to_string_lossy().to_string()),
            enable_json_format: false,
            enable_performance_metrics: true,
        };

        init_telemetry(&telemetry_config)?;

        info!("WdocsSearch application initialized");
        info!("Configuration: {:?}", self.config);

        // Load existing index if configured
        if self.config.is_persistence_enabled() {
            if let Some(index_path) = self.config.get_index_path() {
                info!("Loading existing index from: {:?}", index_path);
                match self.load_index(index_path) {
                    Ok(_) => {
                        info!("Index loaded successfully");
                    }
                    Err(e) => {
                        warn!("Failed to load index: {}", e);
                        info!("Creating new index");
                    }
                }
            }
        }

        Ok(())
    }

    /// Create and initialize a new index
    pub fn create_index(&mut self) -> ConfigResult<Index> {
        let index = Index::new();
        self.index = Some(index.clone());

        info!("Created new search index");

        // Save index if persistence is enabled
        if self.config.is_persistence_enabled() {
            if let Some(index_path) = self.config.get_index_path() {
                if let Err(e) = self.save_index(&index, index_path) {
                    warn!("Failed to save index: {}", e);
                } else {
                    info!("Index saved to: {:?}", index_path);
                }
            }
        }

        Ok(index)
    }

    /// Get the current index
    pub fn get_index(&self) -> Option<&Index> {
        self.index.as_ref()
    }

    /// Load index from file
    pub fn load_index(&self, path: &PathBuf) -> ConfigResult<Index> {
        let mut index = Index::new();
        index.load_from_file(path).map_err(|e| {
            error!("Failed to load index from {:?}: {}", path, e);
            e
        })?;

        self.index = Some(index.clone());
        Ok(index)
    }

    /// Save index to file
    pub fn save_index(&self, index: &Index, path: &PathBuf) -> ConfigResult<()> {
        index.save_to_file(path).map_err(|e| {
            error!("Failed to save index to {:?}: {}", path, e);
            e
        })?;

        info!("Index saved to: {:?}", path);
        Ok(())
    }

    /// Create backup of current index
    pub fn create_backup(&self) -> ConfigResult<Option<String>> {
        if let Some(index) = &self.index {
            if let Some(backup_dir) = self.config.get_backup_dir() {
                match index.create_backup(backup_dir) {
                    Ok(backup_file) => {
                        info!("Backup created: {}", backup_file);
                        Ok(Some(backup_file))
                    }
                    Err(e) => {
                        warn!("Failed to create backup: {}", e);
                        Ok(None)
                    }
                }
            } else {
                warn!("No backup directory configured");
                Ok(None)
            }
        } else {
            warn!("No index available for backup");
            Ok(None)
        }
    }

    /// Get application statistics
    pub fn get_stats(&self) -> Option<IndexStats> {
        self.index.as_ref().map(|index| index.get_stats())
    }

    /// Search documents
    pub fn search(
        &self,
        query: &str,
        options: Option<SearchOptions>,
    ) -> ConfigResult<SearchResult> {
        let index = self.get_index().ok_or_else(|| SearchError::IndexNotBuilt)?;

        let results = index.search(query, options);

        info!(
            "Search query: '{}' returned {} results",
            query, results.total_hits
        );

        Ok(results)
    }

    /// Add documents to index
    pub fn add_documents(&mut self, docs: Vec<Document>) -> ConfigResult<()> {
        let index = if let Some(existing_index) = &mut self.index {
            existing_index
        } else {
            self.create_index()?
        };

        index.add_documents(docs).map_err(|e| {
            error!("Failed to add documents: {}", e);
            e
        })?;

        // Rebuild index
        index.build().map_err(|e| {
            error!("Failed to build index: {}", e);
            e
        })?;

        info!("Added {} documents to index", docs.len());
        Ok(())
    }

    /// Get suggestions
    pub fn suggest(&self, query: &str, limit: Option<u32>) -> ConfigResult<Vec<String>> {
        let index = self.get_index().ok_or_else(|| SearchError::IndexNotBuilt)?;

        let suggestions = index.suggest(query, limit.unwrap_or(10));

        info!(
            "Generated {} suggestions for query: '{}'",
            suggestions.len(),
            query
        );

        Ok(suggestions)
    }

    /// Get memory usage
    pub fn get_memory_usage(&self) -> Option<u64> {
        self.index
            .as_ref()
            .map(|index| index.estimate_memory_usage())
    }

    /// Check if index is built
    pub fn is_index_built(&self) -> bool {
        self.index
            .as_ref()
            .map(|index| index.is_built())
            .unwrap_or(false)
    }

    /// Get configuration
    pub fn get_config(&self) -> &SearchConfig {
        &self.config
    }

    /// Update configuration
    pub fn update_config(&mut self, config: SearchConfig) {
        self.config = config;
        info!("Configuration updated");
    }

    /// Shutdown application
    pub fn shutdown(&self) {
        info!("Shutting down WdocsSearch application");

        // Log performance summary
        crate::telemetry::log_performance_summary();

        // Save index if needed
        if self.config.is_persistence_enabled() {
            if let (Some(index), Some(index_path)) = (&self.index, self.config.get_index_path()) {
                if let Err(e) = self.save_index(index, index_path) {
                    error!("Failed to save index on shutdown: {}", e);
                } else {
                    info!("Index saved on shutdown");
                }
            }
        }
    }
}

/// Application builder for fluent configuration
#[derive(Debug, Default)]
pub struct WdocsSearchBuilder {
    config: Option<SearchConfig>,
    enable_telemetry: bool,
    enable_persistence: bool,
}

impl WdocsSearchBuilder {
    /// Create new builder
    pub fn new() -> Self {
        Self::default()
    }

    /// Set configuration
    pub fn with_config(mut self, config: SearchConfig) -> Self {
        self.config = Some(config);
        self
    }

    /// Enable/disable telemetry
    pub fn with_telemetry(mut self, enable: bool) -> Self {
        self.enable_telemetry = enable;
        self
    }

    /// Enable/disable persistence
    pub fn with_persistence(mut self, enable: bool) -> Self {
        self.enable_persistence = enable;
        self
    }

    /// Build the application
    pub fn build(self) -> ConfigResult<WdocsSearchApp> {
        let config = self
            .config
            .unwrap_or_else(|| SearchConfig::from_env().unwrap_or_default());

        let mut app = WdocsSearchApp::with_config(config);

        if self.enable_telemetry {
            app.initialize()?;
        }

        Ok(app)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn create_test_document(title: &str, content: &str) -> Document {
        let mut fields = HashMap::new();
        fields.insert("title".to_string(), title.to_string());
        fields.insert("content".to_string(), content.to_string());

        Document {
            id: 0,
            fields,
            metadata: json!({"test": true}),
        }
    }

    #[test]
    fn test_app_creation() {
        let app = WdocsSearchApp::new();
        assert!(!app.is_index_built());
    }

    #[test]
    fn test_app_with_config() {
        let config = SearchConfig::default();
        let app = WdocsSearchApp::with_config(config);
        assert_eq!(app.get_config().max_results, 100);
    }

    #[test]
    fn test_builder() {
        let app = WdocsSearchBuilder::new()
            .with_telemetry(true)
            .with_persistence(false)
            .build()
            .unwrap();

        assert!(!app.is_index_built());
    }

    #[test]
    fn test_add_documents() {
        let mut app = WdocsSearchApp::new();
        let docs = vec![create_test_document("Test Doc", "Test content")];

        assert!(app.add_documents(docs).is_ok());
        assert!(app.is_index_built());
    }

    #[test]
    fn test_search() {
        let mut app = WdocsSearchApp::new();
        let docs = vec![create_test_document("Hello World", "This is a test")];

        app.add_documents(docs).unwrap();

        let results = app.search("test", None).unwrap();
        assert_eq!(results.total_hits, 1);
    }
}
