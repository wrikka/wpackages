// Constants for wmorepo

/// Default cache directory name
pub const CACHE_DIR: &str = ".wmo/cache";

/// Default cache size limit in bytes (10GB)
pub const DEFAULT_CACHE_SIZE_LIMIT: u64 = 10 * 1024 * 1024 * 1024;

/// Default cache TTL in seconds (7 days)
pub const DEFAULT_CACHE_TTL: u64 = 7 * 24 * 60 * 60;

/// Default concurrency limit
pub const DEFAULT_CONCURRENCY: usize = 4;

/// Default hash buffer size
pub const HASH_BUFFER_SIZE: usize = 8192;

/// Default retry count for flaky tasks
pub const DEFAULT_RETRY_COUNT: usize = 2;

/// Default retry delay in milliseconds
pub const DEFAULT_RETRY_DELAY_MS: u64 = 1000;

/// Default remote cache timeout in seconds
pub const DEFAULT_REMOTE_CACHE_TIMEOUT: u64 = 30;

/// Default webhook timeout in seconds
pub const DEFAULT_WEBHOOK_TIMEOUT: u64 = 30;

/// Config file name
pub const CONFIG_FILE: &str = "wmo.config.json";

/// Lockfile candidates for dependency hashing
pub const LOCKFILE_CANDIDATES: &[&str] = &[
    "bun.lock",
    "bun.lockb",
    "pnpm-lock.yaml",
    "yarn.lock",
    "package-lock.json",
];

/// Python lockfile candidates
pub const PYTHON_LOCKFILE_CANDIDATES: &[&str] =
    &["poetry.lock", "Pipfile.lock", "requirements.txt"];

/// Go lockfile
pub const GO_LOCKFILE: &str = "go.sum";

/// Rust lockfile
pub const RUST_LOCKFILE: &str = "Cargo.lock";

/// Java lockfile candidates
pub const JAVA_LOCKFILE_CANDIDATES: &[&str] = &["pom.xml", "build.gradle", "build.gradle.kts"];

/// Supported languages
pub const SUPPORTED_LANGUAGES: &[&str] =
    &["typescript", "javascript", "python", "go", "rust", "java"];

/// Default file patterns for hashing
pub const DEFAULT_HASH_PATTERNS: &[&str] = &[
    "src/**/*",
    "lib/**/*",
    "include/**/*",
    "*.rs",
    "*.go",
    "*.py",
    "*.ts",
    "*.tsx",
    "*.js",
    "*.jsx",
    "*.java",
    "*.kt",
];

/// Default output patterns for caching
pub const DEFAULT_OUTPUT_PATTERNS: &[&str] = &[
    "dist/**/*",
    "build/**/*",
    "target/**/*",
    "out/**/*",
    "*.wasm",
    "*.dll",
    "*.so",
    "*.dylib",
    "*.exe",
];
