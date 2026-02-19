use crate::components::dependency_resolver;
use crate::config::AppConfig;
use crate::error::Result;
use crate::services::{
    loader, CommandRegistry, MarketplaceService, PermissionService, SettingsService, ToolRegistry,
    UiRegistry,
};
use crate::types::{
    loaded_extension::ExtensionInstanceTrait, manifest::ExtensionManifest, ActivationContext,
    ExtensionId, LoadedExtension,
};
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::PathBuf;
use tracing::{error, info, warn};

#[cfg(not(target_arch = "wasm32"))]
use {
    crate::adapters::file_watcher::FileWatcher,
    tokio::sync::mpsc::{self, UnboundedReceiver},
};

type ReloadHandle = ();

/// Manages the lifecycle of all extensions.
pub struct ExtensionManager {
    extensions: HashMap<ExtensionId, LoadedExtension>,
    extension_dirs: Vec<PathBuf>,
    storage_dir: PathBuf,
    activation_order: Vec<ExtensionId>,
    config: AppConfig,
    disabled_extensions: HashSet<ExtensionId>,
    command_registry: CommandRegistry,
    ui_registry: UiRegistry,
    settings_service: SettingsService,
    permission_service: PermissionService,
    marketplace_service: MarketplaceService,
    tool_registry: ToolRegistry,

    #[cfg(not(target_arch = "wasm32"))]
    reload_rx: UnboundedReceiver<ReloadHandle>,
    // The watcher needs to be kept alive to receive events.
    #[cfg(not(target_arch = "wasm32"))]
    _file_watcher: Option<FileWatcher>,
}

impl ExtensionManager {
    /// Creates a new `ExtensionManager`.
    pub fn new(config: AppConfig) -> Result<Self> {
        #[cfg(not(target_arch = "wasm32"))]
        let (tx, rx) = mpsc::unbounded_channel::<ReloadHandle>();

        let storage_path = PathBuf::from(&config.storage_dir);
        if !storage_path.exists() {
            fs::create_dir_all(&storage_path)?;
        }

        #[cfg(not(target_arch = "wasm32"))]
        let file_watcher = {
            let mut watcher = FileWatcher::new(move || {
                if tx.send(()).is_err() {
                    error!("Failed to send reload event: channel closed.");
                }
            })?;

            for dir in &config.extension_dirs {
                info!("Watching for changes in '{}'", dir);
                if let Err(e) = watcher.watch(dir.as_ref()) {
                    warn!("Failed to start watching '{}': {}", dir, e);
                }
            }
            Some(watcher)
        };

        Ok(Self {
            extensions: HashMap::new(),
            extension_dirs: config.extension_dirs.iter().map(PathBuf::from).collect(),
            storage_dir: storage_path.clone(),
            activation_order: Vec::new(),
            disabled_extensions: config
                .disabled_extensions
                .iter()
                .map(|s| ExtensionId::new(s.as_str()))
                .collect(),
            config: config.clone(),
            command_registry: CommandRegistry::new(),
            ui_registry: UiRegistry::new(),
            settings_service: SettingsService::new(&storage_path),
            permission_service: PermissionService::new(),
            marketplace_service: MarketplaceService::new(),
            tool_registry: ToolRegistry::new(),
            #[cfg(not(target_arch = "wasm32"))]
            reload_rx: rx,
            #[cfg(not(target_arch = "wasm32"))]
            _file_watcher: file_watcher,
            #[cfg(target_arch = "wasm32")]
            _file_watcher: None,
        })
    }

    // --- Accessors for UI ---
    pub fn command_registry(&self) -> &CommandRegistry {
        &self.command_registry
    }
    pub fn ui_registry(&self) -> &UiRegistry {
        &self.ui_registry
    }
    pub fn settings_service(&self) -> &SettingsService {
        &self.settings_service
    }
    pub fn permission_service(&self) -> &PermissionService {
        &self.permission_service
    }
    pub fn marketplace_service(&self) -> &MarketplaceService {
        &self.marketplace_service
    }
    pub fn tool_registry(&self) -> &ToolRegistry {
        &self.tool_registry
    }
    pub fn get_loaded_extensions(&self) -> Vec<ExtensionManifest> {
        self.extensions
            .values()
            .map(|ext| ext.manifest.clone())
            .collect()
    }

    /// Runs the extension manager's event loop.
    #[cfg(not(target_arch = "wasm32"))]
    pub async fn run(&mut self) {
        info!("ExtensionManager is running.");
        while self.reload_rx.recv().await.is_some() {
            info!("Detected file change, reloading extensions...");
            unsafe {
                if let Err(e) = self.reload_all_extensions().await {
                    error!("Failed to reload extensions: {}", e);
                }
            }
        }
    }

    #[cfg(target_arch = "wasm32")]
    pub async fn run(&mut self) {
        // No hot-reloading on wasm
    }

    /// Reloads all extensions.
    ///
    /// # Safety
    ///
    /// This calls into dynamically-loaded extension code and may execute foreign code.
    /// The caller must ensure loaded extensions are trusted and ABI-compatible.
    pub async unsafe fn reload_all_extensions(&mut self) -> Result<()> {
        self.deactivate_all().await;
        self.unload_all().await;

        self.command_registry = CommandRegistry::new();
        self.ui_registry = UiRegistry::new();
        self.settings_service = SettingsService::new(&self.storage_dir);
        self.permission_service = PermissionService::new();

        self.load_extensions().await?;
        self.activate_all().await;
        info!("Finished reloading extensions.");
        Ok(())
    }

    /// Loads all extensions and resolves their dependency order.
    ///
    /// # Safety
    ///
    /// This loads and initializes dynamically-loaded extension code and may execute foreign code.
    /// The caller must ensure loaded extensions are trusted and ABI-compatible.
    pub async unsafe fn load_extensions(&mut self) -> Result<()> {
        for dir in &self.extension_dirs {
            info!("Loading extensions from: {:?}", dir);
            let loaded_results = loader::load_extensions_from_dir(
                dir,
                self.command_registry.clone(),
                self.ui_registry.clone(),
                self.settings_service.clone(),
            );

            for result in loaded_results {
                if let Ok(ext) = &result {
                    if self.disabled_extensions.contains(&ext.manifest.id) {
                        info!("Skipping disabled extension: {}", ext.manifest.id);
                        continue;
                    }
                }
                match result {
                    Ok(ext) => {
                        let id = ext.manifest.id.clone();
                        self.permission_service
                            .grant_permissions(&id, &ext.manifest.permissions);
                        self.extensions.insert(id, ext);
                    }
                    Err(e) => error!("Failed to load an extension: {}", e),
                }
            }
        }

        let manifests: Vec<_> = self.extensions.values().map(|e| &e.manifest).collect();
        self.activation_order = dependency_resolver::resolve_dependencies(&manifests)?;

        // Update the marketplace service with the list of loaded extensions
        let local_extensions = self
            .extensions
            .values()
            .map(|ext| {
                let is_enabled = !self.disabled_extensions.contains(&ext.manifest.id);
                crate::services::marketplace_service::LocalExtension {
                    manifest: ext.manifest.clone(),
                    is_enabled,
                    is_builtin: false, // Assuming non-builtin for now
                }
            })
            .collect();
        self.marketplace_service
            .update_local_extensions(local_extensions);

        Ok(())
    }

    /// Activates all loaded extensions in the correct dependency order.
    pub async fn activate_all(&mut self) {
        info!("Activating all extensions...");
        let context = ActivationContext {
            commands: self.command_registry.clone(),
            ui: self.ui_registry.clone(),
            settings: self.settings_service.clone(),
        };

        for id in &self.activation_order {
            if let Some(ext) = self.extensions.get_mut(id) {
                info!(extension_id = %id, "Activating extension");
                ext.instance.on_activate(context.clone()).await;
            }
        }
    }

    /// Deactivates all loaded extensions in reverse dependency order.
    pub async fn deactivate_all(&mut self) {
        info!("Deactivating all extensions...");
        for id in self.activation_order.iter().rev() {
            if let Some(ext) = self.extensions.get_mut(id) {
                info!(extension_id = %id, "Deactivating extension");
                ext.instance.on_deactivate().await;
            }
        }
    }

    /// Unloads all extensions.
    /// Enables an extension and reloads all extensions.
    pub async fn enable_extension(&mut self, extension_id: &ExtensionId) -> Result<()> {
        info!("Enabling extension: {}", extension_id);
        self.disabled_extensions.remove(extension_id);
        self.config.disabled_extensions = self
            .disabled_extensions
            .iter()
            .map(ToString::to_string)
            .collect();
        self.config.save()?;
        unsafe { self.reload_all_extensions().await }
    }

    /// Disables an extension and reloads all extensions.
    pub async fn disable_extension(&mut self, extension_id: &ExtensionId) -> Result<()> {
        info!("Disabling extension: {}", extension_id);
        self.disabled_extensions.insert(extension_id.clone());
        self.config.disabled_extensions = self
            .disabled_extensions
            .iter()
            .map(ToString::to_string)
            .collect();
        self.config.save()?;
        unsafe { self.reload_all_extensions().await }
    }

    pub async fn unload_all(&mut self) {
        info!("Unloading all extensions...");
        let extension_ids: Vec<_> = self.extensions.keys().cloned().collect();
        for id in extension_ids {
            if let Some(mut ext) = self.extensions.remove(&id) {
                info!(extension_id = %id, "Unloading extension");
                self.permission_service.revoke_permissions(&id);
                ext.instance.on_unload().await;
            }
        }
        self.activation_order.clear();
    }
}
