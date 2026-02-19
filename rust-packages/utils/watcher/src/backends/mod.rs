pub mod auto;
pub mod polling;

#[cfg(not(target_arch = "wasm32"))]
pub mod native_linux;
#[cfg(not(target_arch = "wasm32"))]
pub mod native_macos;
#[cfg(not(target_arch = "wasm32"))]
pub mod native_windows;

// Re-export the auto watcher as the default entry point
pub use auto::AutoWatcher;
