use thiserror::Error;

pub type EditorResult<T> = Result<T, EditorError>;

#[derive(Error, Debug)]
pub enum EditorError {
    #[error("Failed to detect language for file: {0}")]
    LanguageDetection(String),

    #[error(transparent)]
    Io(#[from] std::io::Error),

    #[error("Invalid file path")]
    InvalidPath,
}

pub type MultiCursorResult<T> = Result<T, MultiCursorError>;

#[derive(Error, Debug)]
pub enum MultiCursorError {
    #[error("Invalid cursor position: {0}")]
    InvalidPosition(String),

    #[error("Cursor out of bounds")]
    OutOfBounds,

    #[error("No cursors available")]
    NoCursors,

    #[error("Invalid selection")]
    InvalidSelection,

    #[error("Operation not supported: {0}")]
    NotSupported(String),

    #[error("Regex error: {0}")]
    RegexError(#[from] regex::Error),

    #[error("Other error: {0}")]
    Other(#[from] anyhow::Error),
}

pub type CodeFoldingResult<T> = Result<T, CodeFoldingError>;

#[derive(Error, Debug)]
pub enum CodeFoldingError {
    #[error("Invalid folding region: {0}")]
    InvalidRegion(String),

    #[error("Region out of bounds")]
    OutOfBounds,

    #[error("No folding regions found")]
    NoRegions,

    #[error("Syntax error: {0}")]
    SyntaxError(String),

    #[error("Parse error: {0}")]
    ParseError(String),

    #[error("Other error: {0}")]
    Other(#[from] anyhow::Error),
}

pub type BufferResult<T> = Result<T, BufferError>;

#[derive(Error, Debug)]
pub enum BufferError {
    #[error("Invalid position: {0}")]
    InvalidPosition(String),

    #[error("Position out of bounds")]
    OutOfBounds,

    #[error("Invalid range: {0}")]
    InvalidRange(String),

    #[error("Text buffer is empty")]
    EmptyBuffer,

    #[error("Line out of bounds: {0}")]
    LineOutOfBounds(usize),

    #[error("Character out of bounds: line={0}, char={1}")]
    CharOutOfBounds(usize, usize),

    #[error("Other error: {0}")]
    Other(#[from] anyhow::Error),
}

pub type HistoryResult<T> = Result<T, HistoryError>;

#[derive(Error, Debug)]
pub enum HistoryError {
    #[error("No undo history available")]
    NoUndoHistory,

    #[error("No redo history available")]
    NoRedoHistory,

    #[error("History is empty")]
    EmptyHistory,

    #[error("History limit reached: {0}")]
    HistoryLimitReached(usize),

    #[error("Invalid operation in history")]
    InvalidOperation,

    #[error("Other error: {0}")]
    Other(#[from] anyhow::Error),
}
