use crate::error::Result;
use async_trait::async_trait;

#[async_trait]
pub trait PdfExportService: Send + Sync {
    async fn export_page(&self, session_id: &str, path: &str) -> Result<()>;
    async fn export_with_options(
        &self,
        session_id: &str,
        path: &str,
        options: PdfOptions,
    ) -> Result<()>;
}

#[derive(Debug, Clone)]
pub struct PdfOptions {
    pub format: PdfFormat,
    pub landscape: bool,
    pub print_background: bool,
    pub margin: PdfMargin,
}

impl Default for PdfOptions {
    fn default() -> Self {
        Self {
            format: PdfFormat::A4,
            landscape: false,
            print_background: true,
            margin: PdfMargin::default(),
        }
    }
}

#[derive(Debug, Clone, Default)]
pub enum PdfFormat {
    #[default]
    A4,
    Letter,
    Legal,
    Tabloid,
}

#[derive(Debug, Clone)]
pub struct PdfMargin {
    pub top: f64,
    pub bottom: f64,
    pub left: f64,
    pub right: f64,
}

impl Default for PdfMargin {
    fn default() -> Self {
        Self {
            top: 1.0,
            bottom: 1.0,
            left: 1.0,
            right: 1.0,
        }
    }
}
