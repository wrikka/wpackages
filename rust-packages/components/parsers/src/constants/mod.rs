//! Constants for document-parsers

/// Maximum document size in bytes
pub const MAX_DOCUMENT_SIZE: usize = 100_000_000; // 100MB

/// Maximum text length to process
pub const MAX_TEXT_LENGTH: usize = 10_000_000; // 10M characters

/// Default chunk size for section extraction
pub const DEFAULT_CHUNK_SIZE: usize = 4096;

/// Minimum section length
pub const MIN_SECTION_LENGTH: usize = 100;

/// Supported file extensions
pub const SUPPORTED_PDF_EXTENSIONS: &[&str] = &["pdf"];
pub const SUPPORTED_MARKDOWN_EXTENSIONS: &[&str] = &["md", "markdown"];
pub const SUPPORTED_HTML_EXTENSIONS: &[&str] = &["html", "htm"];
pub const SUPPORTED_DOCX_EXTENSIONS: &[&str] = &["docx"];
pub const SUPPORTED_TEXT_EXTENSIONS: &[&str] = &["txt"];
pub const SUPPORTED_CODE_EXTENSIONS: &[&str] =
    &["rs", "py", "js", "ts", "java", "go", "cpp", "c", "h", "hpp"];
