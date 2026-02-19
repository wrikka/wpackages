use thiserror::Error;
use napi::Error as NapiError;
use napi::bindgen_prelude::*;

/// Library-specific error types
#[derive(Error, Debug)]
pub enum ParseError {
    #[error("JSON parse error: {0}")]
    Json(#[from] serde_json::Error),
    
    #[error("TOML parse error: {0}")]
    Toml(#[from] toml::de::Error),
    
    #[error("XML parse error: {0}")]
    Xml(#[from] quick_xml::DeError),
    
    #[error("YAML parse error: {0}")]
    Yaml(#[from] serde_yaml::Error),
    
    #[error("Schema validation error: {0}")]
    Schema(String),
    
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("Format detection error: {0}")]
    Detection(String),
    
    #[error("Security error: {0}")]
    Security(String),
    
    #[error("Plugin error: {0}")]
    Plugin(String),
    
    #[error("Configuration error: {0}")]
    Config(String),
    
    #[error("Validation error: {0}")]
    Validation(String),
}

impl From<ParseError> for NapiError {
    fn from(err: ParseError) -> Self {
        NapiError::new(Status::GenericFailure, format!("{}", err))
    }
}

impl From<ParseError> for Error {
    fn from(err: ParseError) -> Self {
        Error::new(
            Status::InvalidArg,
            err.to_string(),
        )
    }
}

/// Result type alias for library operations
pub type Result<T> = std::result::Result<T, ParseError>;

/// Supported parsing formats
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Format {
    Json,
    Toml,
    Xml,
    Yaml,
}

impl Format {
    /// Get format as string
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Json => "json",
            Self::Toml => "toml",
            Self::Xml => "xml",
            Self::Yaml => "yaml",
        }
    }
    
    /// Parse format from string
    pub fn from_str(s: &str) -> Result<Self> {
        match s.to_lowercase().as_str() {
            "json" => Ok(Self::Json),
            "toml" => Ok(Self::Toml),
            "xml" => Ok(Self::Xml),
            "yaml" => Ok(Self::Yaml),
            _ => Err(ParseError::Detection(format!("Unknown format: {}", s))),
        }
    }
}

/// Parsing configuration options
#[derive(Debug, Clone, Default)]
pub struct ParseOptions {
    pub strict: bool,
    pub allow_comments: bool,
    pub max_depth: usize,
    pub security_enabled: bool,
}

impl ParseOptions {
    /// Create new parse options with defaults
    pub fn new() -> Self {
        Self::default()
    }
    
    /// Set strict mode
    pub fn with_strict(mut self, strict: bool) -> Self {
        self.strict = strict;
        self
    }
    
    /// Set security enabled
    pub fn with_security(mut self, security_enabled: bool) -> Self {
        self.security_enabled = security_enabled;
        self
    }
    
    /// Set maximum depth
    pub fn with_max_depth(mut self, max_depth: usize) -> Self {
        self.max_depth = max_depth;
        self
    }
}
