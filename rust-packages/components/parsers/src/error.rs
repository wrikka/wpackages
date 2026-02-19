use thiserror::Error;

#[derive(Error, Debug)]
pub enum ParseError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Cache error: {0}")]
    Cache(#[from] cache::CacheError),

    #[error("PDF parsing error: {0}")]
    Pdf(String),

    #[error("Markdown parsing error: {0}")]
    Markdown(String),

    #[error("HTML parsing error: {0}")]
    Html(String),

    #[error("DOCX parsing error: {0}")]
    Docx(String),

    #[error("Unsupported format: {0}")]
    UnsupportedFormat(String),

    #[error("Encoding error: {0}")]
    Encoding(String),

    #[error("Empty document")]
    EmptyDocument,

    #[error("{0}")]
    Custom(String),
}

pub type ParseResult<T> = Result<T, ParseError>;
