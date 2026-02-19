//! Constants for Context Suite
//!
//! This module contains all constant values used throughout the context suite.

/// Maximum file size to analyze (10MB)
pub const MAX_FILE_SIZE: usize = 10 * 1024 * 1024;

/// Default poll interval for file watcher (100ms)
pub const DEFAULT_POLL_INTERVAL_MS: u64 = 100;

/// Default debounce delay for file watcher (500ms)
pub const DEFAULT_DEBOUNCE_DELAY_MS: u64 = 500;

/// Cache directory name
pub const CACHE_DIR_NAME: &str = ".context_cache";

/// Configuration file name
pub const CONFIG_FILE_NAME: &str = "Config.toml";

/// Default log level
pub const DEFAULT_LOG_LEVEL: &str = "info";

/// Supported file extensions by language
pub mod extensions {
    /// Rust file extensions
    pub const RUST: &[&str] = &["rs"];
    
    /// JavaScript file extensions
    pub const JAVASCRIPT: &[&str] = &["js", "jsx", "mjs"];
    
    /// TypeScript file extensions
    pub const TYPESCRIPT: &[&str] = &["ts", "tsx"];
    
    /// Python file extensions
    pub const PYTHON: &[&str] = &["py", "pyi", "pyw"];
    
    /// Go file extensions
    pub const GO: &[&str] = &["go"];
    
    /// Java file extensions
    pub const JAVA: &[&str] = &["java"];
    
    /// C++ file extensions
    pub const CPP: &[&str] = &["cpp", "cxx", "cc", "h", "hpp"];
    
    /// C file extensions
    pub const C: &[&str] = &["c", "h"];
}

/// Default ignore patterns
pub const DEFAULT_IGNORE_PATTERNS: &[&str] = &[
    "*.tmp",
    "*.log",
    "*.swp",
    "*.swo",
    "*~",
    ".DS_Store",
    "Thumbs.db",
    "node_modules",
    "target",
    ".git",
    ".svn",
    ".hg",
    ".bzr",
    "__pycache__",
    "*.pyc",
    "*.pyo",
    "*.pyd",
    ".pytest_cache",
    ".coverage",
    "coverage.xml",
    "*.cover",
    ".tox",
    ".venv",
    "venv",
    "ENV",
    "env",
    ".env",
    ".env.local",
    ".env.development.local",
    ".env.test.local",
    ".env.production.local",
    "dist",
    "build",
    "out",
    "public",
    ".next",
    ".nuxt",
    ".cache",
    "bower_components",
];

/// Dependency file patterns
pub mod dependency_files {
    /// Cargo dependency files
    pub const CARGO: &[&str] = &["Cargo.toml", "Cargo.lock"];
    
    /// npm dependency files
    pub const NPM: &[&str] = &["package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml"];
    
    /// pip dependency files
    pub const PIP: &[&str] = &["requirements.txt", "setup.py", "pyproject.toml", "Pipfile", "Pipfile.lock"];
    
    /// Go dependency files
    pub const GO: &[&str] = &["go.mod", "go.sum"];
    
    /// Maven dependency files
    pub const MAVEN: &[&str] = &["pom.xml", "build.gradle"];
}

/// Framework detection patterns
pub mod framework_patterns {
    /// React patterns
    pub const REACT: &[&str] = &["react", "React", "createElement", "jsx"];
    
    /// Vue patterns
    pub const VUE: &[&str] = &["vue", "Vue", "createApp"];
    
    /// Angular patterns
    pub const ANGULAR: &[&str] = &["angular", "Angular", "@angular"];
    
    /// Express patterns
    pub const EXPRESS: &[&str] = &["express", "Express", "app.use"];
    
    /// Django patterns
    pub const DJANGO: &[&str] = &["django", "Django", "DJANGO_SETTINGS_MODULE"];
    
    /// Flask patterns
    pub const FLASK: &[&str] = &["flask", "Flask", "Flask(__name__)"];
    
    /// Rails patterns
    pub const RAILS: &[&str] = &["rails", "Rails", "ActiveRecord"];
    
    /// Spring patterns
    pub const SPRING: &[&str] = &["spring", "Spring", "@SpringBootApplication"];
}

/// Error messages
pub mod error_messages {
    pub const FILE_NOT_FOUND: &str = "File not found";
    pub const PARSE_ERROR: &str = "Parse error";
    pub const INVALID_CONFIG: &str = "Invalid configuration";
    pub const WATCHER_ERROR: &str = "File watcher error";
    pub const ANALYSIS_ERROR: &str = "Analysis error";
    pub const DEPENDENCY_ERROR: &str = "Dependency error";
}

/// Log messages
pub mod log_messages {
    pub const INITIALIZING: &str = "Initializing context suite";
    pub const LOADING_CONFIG: &str = "Loading configuration";
    pub const STARTING_WATCHER: &str = "Starting file watcher";
    pub const ANALYZING_PROJECT: &str = "Analyzing project";
    pub const PARSING_FILE: &str = "Parsing file";
    pub const DETECTING_LANGUAGE: &str = "Detecting language";
    pub const EXTRACTING_DEPENDENCIES: &str = "Extracting dependencies";
    pub const CALCULATING_METRICS: &str = "Calculating metrics";
    pub const BUILDING_INDEX: &str = "Building search index";
    pub const SHUTTING_DOWN: &str = "Shutting down";
}
