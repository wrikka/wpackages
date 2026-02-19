pub mod generic;
pub mod javascript;
pub mod python;
pub mod rust;
pub mod traits;

use crate::config::LspConfig;
use crate::error::Result;
use crate::services::tree_sitter::TreeSitterService;
use lsp_types::{CompletionItem, Diagnostic, HoverContents, Location};
use once_cell::sync::Lazy;
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::Mutex;
use tower_lsp::Client;

use self::traits::LspProvider;

static GENERIC_PROVIDER: Lazy<Box<dyn LspProvider + Send + Sync>> =
    Lazy::new(|| Box::new(generic::GenericLspProvider));

#[derive(Clone)]
pub struct LspService {
    tree_sitter: Arc<Mutex<TreeSitterService>>,
    client: Option<Client>,
    providers: Arc<HashMap<String, Box<dyn LspProvider + Send + Sync>>>,
    config: LspConfig,
}

impl LspService {
    pub fn new(tree_sitter: Arc<Mutex<TreeSitterService>>, config: LspConfig) -> Self {
        let mut providers: HashMap<String, Box<dyn LspProvider + Send + Sync>> = HashMap::new();
        providers.insert("rust".to_string(), Box::new(rust::RustLspProvider));
        providers.insert(
            "javascript".to_string(),
            Box::new(javascript::JavaScriptLspProvider),
        );
        providers.insert(
            "typescript".to_string(),
            Box::new(javascript::JavaScriptLspProvider), // Reuse for TS
        );
        providers.insert("python".to_string(), Box::new(python::PythonLspProvider));

        Self {
            tree_sitter,
            client: None,
            providers: Arc::new(providers),
            config,
        }
    }

    fn get_provider(&self, language: &str) -> &(dyn LspProvider + Send + Sync) {
        self.providers
            .get(language)
            .map(|p| p.as_ref())
            .unwrap_or_else(|| GENERIC_PROVIDER.as_ref())
    }

    pub async fn initialize(&mut self, client: Client) -> Result<()> {
        self.client = Some(client);
        Ok(())
    }

    pub async fn get_completions(
        &self,
        file_path: PathBuf,
        line: usize,
        column: usize,
    ) -> Result<Vec<CompletionItem>> {
        if !self.config.enabled {
            return Ok(Vec::new());
        }

        let ts = self.tree_sitter.lock().await;
        let language = ts.detect_language(&file_path);
        let provider = self.get_provider(&language);
        provider.get_completions(line, column).await
    }

    pub async fn get_diagnostics(
        &self,
        file_path: PathBuf,
        content: &str,
    ) -> Result<Vec<Diagnostic>> {
        if !self.config.enabled {
            return Ok(Vec::new());
        }

        let ts = self.tree_sitter.lock().await;
        let language = ts.detect_language(&file_path);
        let provider = self.get_provider(&language);
        provider.get_diagnostics(content).await
    }

    pub async fn get_hover(
        &self,
        file_path: PathBuf,
        line: usize,
        column: usize,
    ) -> Result<HoverContents> {
        if !self.config.enabled {
            return Ok(HoverContents::Scalar(lsp_types::MarkedString::String(
                "LSP is disabled".to_string(),
            )));
        }

        let ts = self.tree_sitter.lock().await;
        let language = ts.detect_language(&file_path);
        let provider = self.get_provider(&language);
        provider.get_hover(line, column).await
    }

    pub async fn go_to_definition(
        &self,
        file_path: PathBuf,
        line: usize,
        column: usize,
    ) -> Result<Option<Location>> {
        if !self.config.enabled {
            return Ok(None);
        }

        let ts = self.tree_sitter.lock().await;
        let language = ts.detect_language(&file_path);
        let provider = self.get_provider(&language);
        provider.go_to_definition(file_path, line, column).await
    }
}
