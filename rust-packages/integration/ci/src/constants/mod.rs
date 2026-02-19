// Constants for CI/CD integration

/// Default timeout for API requests (in seconds)
pub const API_TIMEOUT: u64 = 30;

/// Maximum number of retries for failed requests
pub const MAX_RETRIES: u32 = 3;

/// Default polling interval for checking CI status (in milliseconds)
pub const POLLING_INTERVAL_MS: u64 = 1000;

/// Maximum number of polling attempts
pub const MAX_POLLING_ATTEMPTS: u32 = 60;

/// GitHub API base URL
pub const GITHUB_API_URL: &str = "https://api.github.com";

/// GitLab API base URL
pub const GITLAB_API_URL: &str = "https://gitlab.com/api/v4";

/// Default user agent for API requests
pub const USER_AGENT: &str = concat!("wterminal-ci-cd/", env!("CARGO_PKG_VERSION"));
