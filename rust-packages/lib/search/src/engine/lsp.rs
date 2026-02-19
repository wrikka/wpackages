use crate::query::ast::{SearchField, SearchQuery};
use crate::query::executor::{ExecutorError, SearchResult};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use thiserror::Error;
use tokio::sync::{mpsc, oneshot, RwLock};

#[derive(Error, Debug)]
pub enum LspError {
    #[error("LSP client not available for language: {0}")]
    ClientNotAvailable(String),
    #[error("LSP request failed: {0}")]
    RequestFailed(String),
    #[error("LSP initialization failed: {0}")]
    InitializationFailed(String),
    #[error("unsupported language: {0}")]
    UnsupportedLanguage(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LspLocation {
    pub uri: String,
    pub range: LspRange,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LspRange {
    pub start: LspPosition,
    pub end: LspPosition,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LspPosition {
    pub line: u32,
    pub character: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LspSymbol {
    pub name: String,
    pub kind: String,
    pub location: LspLocation,
    pub container_name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LspReference {
    pub uri: String,
    pub range: LspRange,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LspDefinition {
    pub uri: String,
    pub range: LspRange,
}

pub struct LspManager {
    clients: Arc<RwLock<HashMap<String, Arc<LspClient>>>>,
    root: PathBuf,
}

impl LspManager {
    pub fn new(root: PathBuf) -> Self {
        Self {
            clients: Arc::new(RwLock::new(HashMap::new())),
            root,
        }
    }
    
    pub async fn get_or_create_client(&self, language: &str) -> Option<Arc<LspClient>> {
        let clients = self.clients.read().await;
        if let Some(client) = clients.get(language) {
            return Some(client.clone());
        }
        drop(clients);
        
        let client = self.create_client(language).await?;
        let mut clients = self.clients.write().await;
        clients.insert(language.to_string(), client.clone());
        Some(client)
    }
    
    async fn create_client(&self, language: &str) -> Option<Arc<LspClient>> {
        let config = get_language_config(language)?;
        Some(Arc::new(LspClient {
            language: language.to_string(),
            config,
            root: self.root.clone(),
        }))
    }
    
    pub async fn search(&self, query: &SearchQuery, limit: usize) -> Result<Vec<SearchResult>, LspError> {
        let language = detect_language_from_path(&query.value);
        
        match &query.field {
            SearchField::Calls => {
                self.find_calls(&query.value, language, limit).await
            }
            SearchField::CalledBy => {
                self.find_callers(&query.value, language, limit).await
            }
            SearchField::References => {
                self.find_references(&query.value, language, limit).await
            }
            _ => Err(LspError::RequestFailed(format!("unsupported field: {:?}", query.field))),
        }
    }
    
    async fn find_calls(&self, symbol: &str, language: Option<&str>, limit: usize) -> Result<Vec<SearchResult>, LspError> {
        let lang = language.unwrap_or("rust");
        let client = self.get_or_create_client(lang).await
            .ok_or_else(|| LspError::ClientNotAvailable(lang.to_string()))?;
        
        let calls = client.find_calls(symbol, limit).await?;
        Ok(calls.into_iter().map(|c| SearchResult {
            path: c.uri,
            line: c.range.start.line as usize + 1,
            column: Some(c.range.start.character as usize + 1),
            text: symbol.to_string(),
            score: 1.0,
            context: None,
            kind: Some("call".to_string()),
        }).collect())
    }
    
    async fn find_callers(&self, symbol: &str, language: Option<&str>, limit: usize) -> Result<Vec<SearchResult>, LspError> {
        let lang = language.unwrap_or("rust");
        let client = self.get_or_create_client(lang).await
            .ok_or_else(|| LspError::ClientNotAvailable(lang.to_string()))?;
        
        let callers = client.find_callers(symbol, limit).await?;
        Ok(callers.into_iter().map(|c| SearchResult {
            path: c.uri,
            line: c.range.start.line as usize + 1,
            column: Some(c.range.start.character as usize + 1),
            text: symbol.to_string(),
            score: 1.0,
            context: None,
            kind: Some("caller".to_string()),
        }).collect())
    }
    
    async fn find_references(&self, symbol: &str, language: Option<&str>, limit: usize) -> Result<Vec<SearchResult>, LspError> {
        let lang = language.unwrap_or("rust");
        let client = self.get_or_create_client(lang).await
            .ok_or_else(|| LspError::ClientNotAvailable(lang.to_string()))?;
        
        let refs = client.find_references(symbol, limit).await?;
        Ok(refs.into_iter().map(|r| SearchResult {
            path: r.uri,
            line: r.range.start.line as usize + 1,
            column: Some(r.range.start.character as usize + 1),
            text: symbol.to_string(),
            score: 1.0,
            context: None,
            kind: Some("reference".to_string()),
        }).collect())
    }
}

pub struct LspClient {
    language: String,
    config: LanguageConfig,
    root: PathBuf,
}

#[derive(Debug, Clone)]
pub struct LanguageConfig {
    pub command: String,
    pub args: Vec<String>,
    pub extensions: Vec<String>,
}

fn get_language_config(language: &str) -> Option<LanguageConfig> {
    match language {
        "rust" | "rs" => Some(LanguageConfig {
            command: "rust-analyzer".to_string(),
            args: vec![],
            extensions: vec!["rs".to_string()],
        }),
        "typescript" | "ts" => Some(LanguageConfig {
            command: "typescript-language-server".to_string(),
            args: vec!["--stdio".to_string()],
            extensions: vec!["ts".to_string(), "tsx".to_string()],
        }),
        "javascript" | "js" => Some(LanguageConfig {
            command: "typescript-language-server".to_string(),
            args: vec!["--stdio".to_string()],
            extensions: vec!["js".to_string(), "jsx".to_string()],
        }),
        "python" | "py" => Some(LanguageConfig {
            command: "pylsp".to_string(),
            args: vec![],
            extensions: vec!["py".to_string()],
        }),
        "go" => Some(LanguageConfig {
            command: "gopls".to_string(),
            args: vec![],
            extensions: vec!["go".to_string()],
        }),
        _ => None,
    }
}

fn detect_language_from_path(value: &str) -> Option<&str> {
    if value.contains(".rs") { Some("rust") }
    else if value.contains(".ts") || value.contains(".tsx") { Some("typescript") }
    else if value.contains(".js") || value.contains(".jsx") { Some("javascript") }
    else if value.contains(".py") { Some("python") }
    else if value.contains(".go") { Some("go") }
    else { None }
}

impl LspClient {
    pub async fn find_definition(&self, _uri: &str, _line: u32, _character: u32) -> Result<Option<LspDefinition>, LspError> {
        Ok(None)
    }
    
    pub async fn find_references(&self, _symbol: &str, _limit: usize) -> Result<Vec<LspReference>, LspError> {
        Ok(Vec::new())
    }
    
    pub async fn find_calls(&self, _symbol: &str, _limit: usize) -> Result<Vec<LspLocation>, LspError> {
        Ok(Vec::new())
    }
    
    pub async fn find_callers(&self, _symbol: &str, _limit: usize) -> Result<Vec<LspLocation>, LspError> {
        Ok(Vec::new())
    }
    
    pub async fn document_symbols(&self, _uri: &str) -> Result<Vec<LspSymbol>, LspError> {
        Ok(Vec::new())
    }
    
    pub async fn workspace_symbols(&self, _query: &str, _limit: usize) -> Result<Vec<LspSymbol>, LspError> {
        Ok(Vec::new())
    }
}

#[cfg(feature = "lsp")]
pub async fn search(root: &str, query: &SearchQuery, limit: usize) -> Result<Vec<SearchResult>, ExecutorError> {
    let manager = LspManager::new(PathBuf::from(root));
    manager.search(query, limit).await.map_err(ExecutorError::from)
}

#[cfg(not(feature = "lsp"))]
pub async fn search(_root: &str, _query: &SearchQuery, _limit: usize) -> Result<Vec<SearchResult>, ExecutorError> {
    Err(ExecutorError::LspNotAvailable("lsp feature not enabled".to_string()))
}
