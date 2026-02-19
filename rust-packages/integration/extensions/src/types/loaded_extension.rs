use super::extension_trait::Extension;
use super::manifest::ExtensionManifest;
use crate::adapters::wasm_loader::WasmExtensionHandle;
use crate::types::ActivationContext;
use async_trait::async_trait;

#[cfg(not(target_arch = "wasm32"))]
use libloading::Library;

/// A trait that unifies the behavior of different extension types.
#[async_trait]
pub trait ExtensionInstanceTrait {
    async fn on_activate(&mut self, context: ActivationContext);
    async fn on_deactivate(&mut self);
    async fn on_unload(&mut self);
}

/// An enum that holds the instance of a loaded extension, which can be either native or WASM.
pub enum ExtensionInstance {
    #[cfg(not(target_arch = "wasm32"))]
    Native {
        instance: Box<dyn Extension + Send + Sync>,
        // Library must be kept in memory
        _library: Library,
    },
    Wasm(WasmExtensionHandle),
}

#[async_trait]
impl ExtensionInstanceTrait for ExtensionInstance {
    async fn on_activate(&mut self, context: ActivationContext) {
        match self {
            #[cfg(not(target_arch = "wasm32"))]
            ExtensionInstance::Native { instance, .. } => instance.on_activate(context).await,
            ExtensionInstance::Wasm(handle) => handle.on_activate(context),
        }
    }

    async fn on_deactivate(&mut self) {
        match self {
            #[cfg(not(target_arch = "wasm32"))]
            ExtensionInstance::Native { instance, .. } => instance.on_deactivate().await,
            ExtensionInstance::Wasm(handle) => handle.on_deactivate(),
        }
    }

    async fn on_unload(&mut self) {
        match self {
            #[cfg(not(target_arch = "wasm32"))]
            ExtensionInstance::Native { instance, .. } => instance.on_unload().await,
            ExtensionInstance::Wasm(_handle) => {
                // The actor task will shut down when the handle is dropped.
            }
        }
    }
}

/// Represents an extension that has been loaded into memory.
pub struct LoadedExtension {
    pub manifest: ExtensionManifest,
    pub instance: ExtensionInstance,
}
