#![cfg(not(target_arch = "wasm32"))]

//! An adapter for dynamically loading shared libraries.

use crate::error::{AppError, Result};
use crate::types::Extension;
use libloading::{Library, Symbol};
use std::path::Path;

/// The symbol name for the extension's initialization function.
pub const INIT_SYMBOL: &[u8] = b"_wext_init";

/// Type signature for the extension's initialization function.
type ExtensionInitFn = unsafe extern "Rust" fn() -> *mut dyn Extension;

/// A wrapper around a dynamically loaded extension library.
pub struct ExtensionLibrary {
    _library: Library,
    instance: Box<dyn Extension>,
}

impl ExtensionLibrary {
    /// Loads a dynamic library from the given path and initializes the extension instance.
    ///
    /// # Safety
    /// This is unsafe because it loads and executes foreign code from the library.
    pub unsafe fn load(path: &Path) -> Result<Self> {
        let library = Library::new(path).map_err(|source| AppError::LibraryLoad {
            path: path.to_string_lossy().into_owned(),
            source,
        })?;

        let init_fn: Symbol<ExtensionInitFn> = library
            .get(INIT_SYMBOL)
            .map_err(|_| AppError::MissingInitSymbol(path.to_string_lossy().into_owned()))?;

        let instance_ptr = init_fn();
        let instance = Box::from_raw(instance_ptr);

        Ok(Self {
            _library: library,
            instance,
        })
    }

    /// Consumes the loader and returns its constituent parts.
    pub fn into_parts(self) -> (Library, Box<dyn Extension>) {
        (self._library, self.instance)
    }
}
