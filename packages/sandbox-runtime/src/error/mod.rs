use thiserror::Error;

#[derive(Error, Debug)]
pub enum RuntimeError {
    #[error("Invalid command syntax")]
    InvalidCommand,

    #[error("{0}: command not found")]
    CommandNotFound(String),

    #[error("{cmd}: missing operand")]
    MissingOperand { cmd: String },

    #[error("{cmd}: invalid mode: '{mode}'")]
    InvalidMode { cmd: String, mode: String },

    #[error("No such file or directory: {path}")]
    NotFound { path: String },

    #[error("Not a directory: {path}")]
    NotADirectory { path: String },

    #[error("Cannot create directory '{path}': No such file or directory")]
    CannotCreateDirectory { path: String },

    #[error("Cannot create file '{path}': No such file or directory")]
    CannotCreateFile { path: String },

    #[error("Cannot write to '{path}': No such file or not a file")]
    CannotWrite { path: String },

    #[error("Cannot read '{path}': No such file or not a file")]
    CannotRead { path: String },

    #[error("JS evaluation error: {0}")]
    JsError(String),
}
