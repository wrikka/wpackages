use crate::config::Config;
use crate::engine::{self, fuzzy, hybrid, semantic, symbol, syntax, text};
use crate::query::ast::*;
use serde::{Deserialize, Serialize};
use std::path::Path;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ExecutorError {
    #[error("search error: {0}")]
    Search(#[from] SearchError),
    #[error("unsupported field: {0}")]
    UnsupportedField(String),
    #[error("LSP not available for field: {0}")]
    LspNotAvailable(String),
}

#[derive(Error, Debug)]
pub enum SearchError {
    #[error("text search error: {0}")]
    Text(#[from] text::TextSearchError),
    #[error("syntax search error: {0}")]
    Syntax(#[from] syntax::SyntaxSearchError),
    #[error("symbol search error: {0}")]
    Symbol(#[from] symbol::SymbolSearchError),
    #[error("fuzzy search error: {0}")]
    Fuzzy(#[from] fuzzy::FuzzySearchError),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub path: String,
    pub line: usize,
    pub column: Option<usize>,
    pub text: String,
    pub score: f64,
    pub context: Option<String>,
    pub kind: Option<String>,
}

pub struct QueryExecutor {
    root: String,
    config: Config,
}

impl QueryExecutor {
    pub fn new(root: impl Into<String>, config: Config) -> Self {
        Self {
            root: root.into(),
            config,
        }
    }
    
    pub async fn execute(&self, query: &Query) -> Result<Vec<SearchResult>, ExecutorError> {
        self.execute_query(query, QueryMetadata::default()).await
    }
    
    pub async fn execute_with_metadata(
        &self,
        query: &Query,
        metadata: QueryMetadata,
    ) -> Result<Vec<SearchResult>, ExecutorError> {
        self.execute_query(query, metadata).await
    }
    
    async fn execute_query(
        &self,
        query: &Query,
        metadata: QueryMetadata,
    ) -> Result<Vec<SearchResult>, ExecutorError> {
        let mut results = match query {
            Query::Search(sq) => self.execute_search(sq, &metadata).await?,
            Query::Logical(lq) => self.execute_logical(lq, &metadata).await?,
        };
        
        if let Some(limit) = metadata.limit {
            results.truncate(limit);
        }
        
        if let Some(offset) = metadata.offset {
            results = results.into_iter().skip(offset).collect();
        }
        
        Ok(results)
    }
    
    async fn execute_search(
        &self,
        query: &SearchQuery,
        metadata: &QueryMetadata,
    ) -> Result<Vec<SearchResult>, ExecutorError> {
        let limit = metadata.limit.unwrap_or(100);
        
        match &query.field {
            SearchField::Text => {
                let matches = text::search(&self.root, &query.value, false, limit)?;
                Ok(matches.into_iter().map(|m| SearchResult {
                    path: m.path,
                    line: m.line,
                    column: None,
                    text: m.text,
                    score: 1.0,
                    context: None,
                    kind: Some("text".to_string()),
                }).collect())
            }
            SearchField::Regex => {
                let matches = text::search(&self.root, &query.value, true, limit)?;
                Ok(matches.into_iter().map(|m| SearchResult {
                    path: m.path,
                    line: m.line,
                    column: None,
                    text: m.text,
                    score: 1.0,
                    context: None,
                    kind: Some("regex".to_string()),
                }).collect())
            }
            SearchField::Function | SearchField::Class | SearchField::Struct | 
            SearchField::Enum | SearchField::Trait | SearchField::Method |
            SearchField::Symbol => {
                self.execute_symbol_search(query, limit).await
            }
            SearchField::File | SearchField::Path => {
                self.execute_path_search(query, limit).await
            }
            SearchField::Calls | SearchField::CalledBy | SearchField::References => {
                self.execute_lsp_search(query, limit).await
            }
            _ => Err(ExecutorError::UnsupportedField(query.field.to_string())),
        }
    }
    
    async fn execute_symbol_search(
        &self,
        query: &SearchQuery,
        limit: usize,
    ) -> Result<Vec<SearchResult>, ExecutorError> {
        #[cfg(feature = "symbol")]
        {
            let matches = symbol::search(&self.root, &query.value, limit)?;
            Ok(matches.into_iter().map(|m| SearchResult {
                path: m.location.path,
                line: m.location.line,
                column: Some(m.location.col),
                text: m.name.clone(),
                score: 1.0,
                context: None,
                kind: Some(format!("{:?}", m.kind).to_lowercase()),
            }).collect())
        }
        
        #[cfg(not(feature = "symbol"))]
        {
            let _ = (query, limit);
            Ok(Vec::new())
        }
    }
    
    async fn execute_path_search(
        &self,
        query: &SearchQuery,
        limit: usize,
    ) -> Result<Vec<SearchResult>, ExecutorError> {
        use ignore::WalkBuilder;
        use std::fs;
        
        let mut results = Vec::new();
        let pattern = query.value.to_lowercase();
        
        for entry in WalkBuilder::new(&self.root).build().flatten() {
            if results.len() >= limit {
                break;
            }
            
            if let Some(path) = entry.path().to_str() {
                if path.to_lowercase().contains(&pattern) {
                    if let Ok(content) = fs::read_to_string(entry.path()) {
                        let first_line = content.lines().next().unwrap_or("");
                        results.push(SearchResult {
                            path: path.to_string(),
                            line: 1,
                            column: None,
                            text: first_line.to_string(),
                            score: 1.0,
                            context: None,
                            kind: Some("file".to_string()),
                        });
                    } else {
                        results.push(SearchResult {
                            path: path.to_string(),
                            line: 0,
                            column: None,
                            text: String::new(),
                            score: 1.0,
                            context: None,
                            kind: Some("file".to_string()),
                        });
                    }
                }
            }
        }
        
        Ok(results)
    }
    
    async fn execute_lsp_search(
        &self,
        query: &SearchQuery,
        limit: usize,
    ) -> Result<Vec<SearchResult>, ExecutorError> {
        #[cfg(feature = "lsp")]
        {
            crate::engine::lsp::search(&self.root, query, limit).await
        }
        
        #[cfg(not(feature = "lsp"))]
        {
            let _ = (query, limit);
            Err(ExecutorError::LspNotAvailable(query.field.to_string()))
        }
    }
    
    async fn execute_logical(
        &self,
        query: &LogicalQuery,
        metadata: &QueryMetadata,
    ) -> Result<Vec<SearchResult>, ExecutorError> {
        match query.operator {
            LogicalOp::And => {
                let left = self.execute_query(&query.left, metadata.clone()).await?;
                let right = self.execute_query(&query.right, metadata.clone()).await?;
                
                let right_keys: std::collections::HashSet<_> = right
                    .iter()
                    .map(|r| (r.path.clone(), r.line))
                    .collect();
                
                Ok(left.into_iter()
                    .filter(|l| right_keys.contains(&(l.path.clone(), l.line)))
                    .collect())
            }
            LogicalOp::Or => {
                let mut left = self.execute_query(&query.left, metadata.clone()).await?;
                let right = self.execute_query(&query.right, metadata.clone()).await?;
                
                let left_keys: std::collections::HashSet<_> = left
                    .iter()
                    .map(|l| (l.path.clone(), l.line))
                    .collect();
                
                for r in right {
                    if !left_keys.contains(&(r.path.clone(), r.line)) {
                        left.push(r);
                    }
                }
                
                Ok(left)
            }
            LogicalOp::Not => {
                let left = self.execute_query(&query.left, metadata.clone()).await?;
                let right = self.execute_query(&query.right, metadata.clone()).await?;
                
                let right_keys: std::collections::HashSet<_> = right
                    .iter()
                    .map(|r| (r.path.clone(), r.line))
                    .collect();
                
                Ok(left.into_iter()
                    .filter(|l| !right_keys.contains(&(l.path.clone(), l.line)))
                    .collect())
            }
        }
    }
}
