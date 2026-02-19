use napi_derive::napi;
use crate::config::RenderOptions;
use crate::app::markdown_orchestrator;

pub mod app;
pub mod components;
pub mod config;
pub mod constants;
pub mod error;
pub mod adapters;
pub mod services;
pub mod types;
pub mod utils;
pub mod telemetry;

pub use app::markdown_orchestrator::{render_unsafe, render_unsafe_no_highlight};

#[napi]
pub fn parse(input: String) -> String {
    markdown_orchestrator::parse(input)
}

#[napi]
pub fn render(input: String) -> String {
    markdown_orchestrator::render(input)
}

#[napi(js_name = "renderWithOptions")]
pub fn render_with_options(input: String, options: Option<RenderOptions>) -> String {
    let flags = config::RenderFlags::from_options(options);
    markdown_orchestrator::render_with_options(input, flags)
}

#[napi]
pub fn render_gfm(input: String) -> String {
    render_with_options(input, None)
}

#[napi]
pub fn init() {
    telemetry::init_subscriber();
}

