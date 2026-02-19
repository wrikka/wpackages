//! An adapter for loading and running extensions compiled to WebAssembly.

use crate::error::Result;
use crate::services::{CommandRegistry, SettingsService, UiRegistry};
use crate::types::ActivationContext;
use std::path::Path;

#[derive(Clone)]
pub enum LifecycleCommand {
    Activate(ActivationContext),
    Deactivate,
}

#[derive(Clone)]
pub struct WasmExtensionHandle;

impl WasmExtensionHandle {
    pub fn on_activate(&self, _context: ActivationContext) {}

    pub fn on_deactivate(&self) {}
}

pub fn load_and_spawn_wasm_extension(
    _path: &Path,
    _command_registry: CommandRegistry,
    _ui_registry: UiRegistry,
    _settings_service: SettingsService,
) -> Result<WasmExtensionHandle> {
    Ok(WasmExtensionHandle)
}
