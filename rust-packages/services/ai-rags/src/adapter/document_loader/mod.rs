pub mod docx_loader;
pub mod factory;
pub mod markdown_loader;
pub mod pdf_loader;
pub mod text_loader;
pub mod url_loader;

use crate::domain::Document;
use crate::error::RagResult;
use async_trait::async_trait;

pub use docx_loader::DocxLoader;
pub use factory::get_loader;
pub use markdown_loader::MarkdownLoader;
pub use pdf_loader::PdfLoader;
pub use text_loader::TextLoader;
pub use url_loader::UrlLoader;

#[async_trait]
pub trait DocumentLoader: Send + Sync {
    async fn load(&self, path: &str) -> RagResult<Vec<Document>>;
}
