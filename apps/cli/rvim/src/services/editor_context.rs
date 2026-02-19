use std::sync::Arc;
use tokio::sync::Mutex;

use crate::config::AppConfig;
use crate::error::Result;
use crate::services::lsp::LspService;
use crate::services::multi_selection::MultiSelection;
use crate::services::plugins::PluginSystem;
use crate::services::surround::SurroundService;
use crate::services::textobjects::TextObjectsService;
use crate::services::theme::ThemeService;
use crate::services::tree_sitter::TreeSitterService;

/// Context for editor services - holds all services that the editor needs
pub struct EditorContext {
    pub tree_sitter: Arc<Mutex<TreeSitterService>>,
    pub lsp: Arc<Mutex<LspService>>,
    pub multi_selection: MultiSelection,
    pub textobjects: TextObjectsService,
    pub surround: SurroundService,
    pub theme: ThemeService,
    pub plugin_system: PluginSystem,
}

impl EditorContext {
    pub fn new(config: &AppConfig) -> Result<Self> {
        let tree_sitter = Arc::new(Mutex::new(TreeSitterService::new()?));
        let lsp = Arc::new(Mutex::new(LspService::new(
            Arc::clone(&tree_sitter),
            config.lsp.clone(),
        )));
        let textobjects = TextObjectsService::default();
        let surround = SurroundService::default();
        let theme = ThemeService::default();
        let plugin_system = PluginSystem::default();

        Ok(Self {
            tree_sitter,
            lsp,
            multi_selection: MultiSelection::default(),
            textobjects,
            surround,
            theme,
            plugin_system,
        })
    }

    pub fn tree_sitter(&self) -> Arc<Mutex<TreeSitterService>> {
        Arc::clone(&self.tree_sitter)
    }

    pub fn lsp(&self) -> Arc<Mutex<LspService>> {
        Arc::clone(&self.lsp)
    }

    pub fn plugin_system(&self) -> &PluginSystem {
        &self.plugin_system
    }

    pub fn plugin_system_mut(&mut self) -> &mut PluginSystem {
        &mut self.plugin_system
    }
}
