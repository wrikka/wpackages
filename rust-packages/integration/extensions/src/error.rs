use serde_json;
use thiserror::Error;

pub type Result<T> = std::result::Result<T, AppError>;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("I/O error")]
    Io(#[from] std::io::Error),

    #[error("Failed to parse TOML file: {0}")]
    TomlParse(#[from] toml::de::Error),

    #[error("Failed to serialize TOML: {0}")]
    TomlSerialize(#[from] toml::ser::Error),

    #[error("Failed to load configuration: {0}")]
    Config(#[source] Box<figment::Error>),

    #[cfg(not(target_arch = "wasm32"))]
    #[error("File watcher error: {0}")]
    Notify(#[from] notify::Error),

    #[error("Missing manifest file in: {0}")]
    MissingManifest(String),

    #[error("Invalid extension path: {0}")]
    InvalidExtensionPath(String),

    #[error("Dynamic library not found in: {0}")]
    LibraryNotFound(String),

    #[cfg(not(target_arch = "wasm32"))]
    #[error("Failed to load extension library")]
    LibraryLoad {
        path: String,
        #[source]
        source: libloading::Error,
    },

    #[error("Missing initialization symbol in library: {0}")]
    MissingInitSymbol(String),

    #[error("Cyclic dependency detected involving extension: {0}")]
    CyclicDependency(String),

    #[error("Dependency not found for extension")]
    DependencyNotFound {
        extension_name: String,
        dependency_name: String,
    },

    #[error("Wasmtime error: {0}")]
    Wasmtime(#[from] wasmtime::Error),

    #[error("Service error")]
    ServiceError {
        service_name: String,
        #[source]
        source: anyhow::Error,
    },

    #[error("Command not found: {0}")]
    CommandNotFound(String),

    #[error("Setting not found: {0}")]
    SettingNotFound(String),

    #[error("Permission denied: {0}")]
    PermissionDenied(String),

    #[error("Network error: {0}")]
    NetworkError(String),

    #[error("Listener not found: {0}")]
    ListenerNotFound(String),

    #[error("Tool already exists: {0}")]
    ToolAlreadyExists(String),

    #[error("Tool not found: {0}")]
    ToolNotFound(String),

    #[error("WebView not found: {0}")]
    WebViewNotFound(String),
}

impl From<figment::Error> for AppError {
    fn from(value: figment::Error) -> Self {
        Self::Config(Box::new(value))
    }
}

impl From<serde_json::Error> for AppError {
    fn from(value: serde_json::Error) -> Self {
        Self::ServiceError {
            service_name: "serde_json".to_string(),
            source: anyhow::Error::from(value),
        }
    }
}
