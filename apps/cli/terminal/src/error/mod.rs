use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Configuration error: {0}")]
    Config(#[from] figment::Error),

    #[error(transparent)]
    Io(#[from] std::io::Error),

    #[error("PTY Error: {0}")]
    Pty(String),

    #[error("Mutex lock poisoned")]
    MutexPoison,

    #[error(transparent)]
    Tauri(#[from] tauri::Error),

    #[error("Could not find config directory")]
    ConfigDirNotFound,

    #[error(transparent)]
    SerdeJson(#[from] serde_json::Error),

    #[error("External service failed: {service_name}")]
    ServiceError {
        service_name: String,
        #[source]
        source: anyhow::Error,
    },

    #[error("{0}")]
    Other(String),
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

pub type AppResult<T> = Result<T, AppError>;
