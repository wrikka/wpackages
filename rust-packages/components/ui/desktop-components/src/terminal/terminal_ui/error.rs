use thiserror::Error;

#[derive(Error, Debug)]
pub enum TerminalError {
    #[error("PTY error: {0}")]
    Pty(String),
}

pub type TerminalResult<T> = Result<T, TerminalError>;
