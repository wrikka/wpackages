//! Service for loading extensions from disk.

use crate::adapters::wasm_loader;
use crate::error::{AppError, Result};
use crate::services::{CommandRegistry, SettingsService, UiRegistry};
use crate::types::{
    loaded_extension::{ExtensionInstance, LoadedExtension},
    manifest::ExtensionManifest,
};
use std::fs;
use std::path::{Path, PathBuf};
use tracing::{debug, info};

#[cfg(not(target_arch = "wasm32"))]
use crate::adapters::dynamic_loader::ExtensionLibrary;

enum EntryPoint {
    Wasm(PathBuf),
    #[cfg(not(target_arch = "wasm32"))]
    Native(PathBuf),
}

/// Loads a single extension from its directory.
///
/// This function orchestrates the loading process by:
/// 1. Finding and parsing the manifest file.
/// 2. Finding the entrypoint file (.wasm or dynamic library).
/// 3. Delegating the loading to the appropriate adapter.
///
/// # Safety
/// This function is unsafe because it may delegate to `ExtensionLibrary::load`.
pub unsafe fn load_extension(
    extension_dir: &Path,
    command_registry: CommandRegistry,
    ui_registry: UiRegistry,
    settings_service: SettingsService,
) -> Result<LoadedExtension> {
    if !extension_dir.is_dir() {
        return Err(AppError::InvalidExtensionPath(
            extension_dir.to_string_lossy().into_owned(),
        ));
    }
    debug!("Attempting to load extension from: {:?}", extension_dir);

    let manifest_path = extension_dir.join("extension.toml");
    if !manifest_path.exists() {
        return Err(AppError::MissingManifest(
            extension_dir.to_string_lossy().into_owned(),
        ));
    }
    let manifest_content = fs::read_to_string(&manifest_path)?;
    let manifest: ExtensionManifest =
        toml::from_str(&manifest_content).map_err(AppError::TomlParse)?;

    let entrypoint = find_entrypoint_in_dir(extension_dir)?;

    let instance = match entrypoint {
        EntryPoint::Wasm(path) => {
            info!("Loading WASM extension from: {:?}", path);
            let wasm_handle = wasm_loader::load_and_spawn_wasm_extension(
                &path,
                command_registry,
                ui_registry,
                settings_service,
            )?;
            ExtensionInstance::Wasm(wasm_handle)
        }
        #[cfg(not(target_arch = "wasm32"))]
        EntryPoint::Native(path) => {
            info!("Loading native extension from: {:?}", path);
            let extension_lib = ExtensionLibrary::load(&path)?;
            let (_library, instance) = extension_lib.into_parts();
            ExtensionInstance::Native { instance, _library }
        }
    };

    info!(
        "Successfully loaded extension: '{}' v{}",
        manifest.name, manifest.version
    );

    Ok(LoadedExtension { manifest, instance })
}

/// Finds an entrypoint file (.wasm, .dll, .so, .dylib) in a given directory.
/// It prioritizes WASM files over native libraries if both are present.
fn find_entrypoint_in_dir(dir: &Path) -> Result<EntryPoint> {
    let mut wasm_path = None;
    let mut native_path = None;

    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        if let Some(ext) = path.extension().and_then(|s| s.to_str()) {
            match ext {
                "wasm" => {
                    wasm_path = Some(path);
                    break; // Prioritize WASM
                }
                "dll" | "so" | "dylib" => {
                    native_path = Some(path);
                }
                _ => {}
            }
        }
    }

    if let Some(path) = wasm_path {
        return Ok(EntryPoint::Wasm(path));
    }

    #[cfg(not(target_arch = "wasm32"))]
    if let Some(path) = native_path {
        return Ok(EntryPoint::Native(path));
    }

    Err(AppError::LibraryNotFound(
        dir.to_string_lossy().into_owned(),
    ))
}

/// Loads all extensions from a given base directory by searching for subdirectories.
///
/// # Safety
/// See `load_extension`.
#[cfg(not(target_arch = "wasm32"))]
pub unsafe fn load_extensions_from_dir(
    dir: &Path,
    command_registry: CommandRegistry,
    ui_registry: UiRegistry,
    settings_service: SettingsService,
) -> Vec<Result<LoadedExtension>> {
    let mut extensions = Vec::new();

    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                extensions.push(load_extension(
                    &path,
                    command_registry.clone(),
                    ui_registry.clone(),
                    settings_service.clone(),
                ));
            }
        }
    }

    extensions
}

#[cfg(target_arch = "wasm32")]
pub unsafe fn load_extensions_from_dir(_dir: &Path) -> Vec<Result<LoadedExtension>> {
    vec![]
}
