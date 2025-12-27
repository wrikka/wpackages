use wasm_bindgen::prelude::*;

pub mod components;
pub mod config;
pub mod constants;
pub mod error;
pub mod lib_wrapper;
pub mod services;
pub mod types;
pub mod utils;

// Called when the wasm module is instantiated
#[wasm_bindgen(start)]
pub fn main_js() -> Result<(), JsValue> {
    // This provides better error messages in debug mode.
    // It's disabled in release mode so it doesn't bloat up the file size.
    #[cfg(debug_assertions)]
    console_error_panic_hook::set_once();

    Ok(())
}
