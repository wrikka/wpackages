use wasm_bindgen::prelude::*;

pub mod app;
pub mod components;
pub mod config;
pub mod error;
pub mod services;
pub mod telemetry;
pub mod types;
pub mod utils;

use app::runtime::AppRuntime;

#[wasm_bindgen]
pub struct WasmSandbox {
    runtime: AppRuntime,
}

impl Default for WasmSandbox {
    fn default() -> Self {
        Self::new()
    }
}

#[wasm_bindgen]
impl WasmSandbox {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        // Initialize the tracing subscriber for logging.
        // This is essential for observability.
        crate::telemetry::init_subscriber();

        Self {
            runtime: AppRuntime::new(),
        }
    }

    #[wasm_bindgen(js_name = runCommand)]
    pub fn run_command(&mut self, command: &str) -> Result<String, JsValue> {
        self.runtime
            .run_command(command)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }
}
