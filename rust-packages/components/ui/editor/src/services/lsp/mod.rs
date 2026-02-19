use lsp_types::{Hover, PublishDiagnosticsParams};

mod client;
mod transport;

pub use client::LspService;

#[derive(Debug)]
pub enum LspMessage {
    Diagnostics(PublishDiagnosticsParams),
    Hover(Hover),
}
