pub mod config;
pub mod error;
pub mod telemetry;

pub mod adapters;
pub mod builders;
pub use builders::agent_builder;
pub mod components;
pub mod constants;
pub mod dsl;
pub mod services;
pub mod templates;
pub mod types;
pub mod utils;

pub use config::AppConfig;
pub use error::{AgentError, Result};
pub use telemetry::init_subscriber;

#[cfg(feature = "wasm")]
pub mod wasm {
    use crate::templates::basic;
    use wasm_bindgen::prelude::*;

    #[wasm_bindgen]
    pub async fn run_agent_step() -> Result<String, JsValue> {
        let mut agent = basic::new_basic_agent();
        let input = basic::BasicInput { content: vec![] }; // Simplified input
        match agent.step(&input).await {
            Ok(_) => Ok("Agent step completed successfully.".to_string()),
            Err(e) => Err(JsValue::from_str(&e.to_string())),
        }
    }
}

