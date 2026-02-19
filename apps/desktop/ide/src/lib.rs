pub mod error;

pub mod adapters;
pub mod app;
pub mod components;
pub mod config;
pub mod services;
pub mod telemetry;
pub mod types;
pub mod utils;
pub mod prelude;

pub use error::AppResult;
pub use prelude::*;

pub fn run() -> AppResult<()> {
    app::run()
}

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub async fn start_wasm(canvas_id: &str) -> Result<(), wasm_bindgen::JsValue> {
    console_error_panic_hook::set_once();

    let web_options = eframe::WebOptions::default();
    eframe::start_web(
        canvas_id,
        web_options,
        Box::new(|cc| Box::new(app::IdeApp::new(cc))),
    )
    .await?;

    Ok(())
}

#[cfg(test)]
mod tests {
    #[test]
    fn smoke() {
        let ok = true;
        assert!(ok);
    }
}
