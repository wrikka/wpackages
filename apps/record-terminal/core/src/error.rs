use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("I/O Error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("PTY Error: {0}")]
    PtyError(String),

    #[error("GIF Encoding Error: {0}")]
    GifError(#[from] gif::EncodingError),
}

pub type AppResult<T> = Result<T, AppError>;
