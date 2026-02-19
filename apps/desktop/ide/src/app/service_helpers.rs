//! # Service Call Helpers
//!
//! Macros and helper functions for reducing code duplication in service calls.

/// Macro for handling service calls with repository validation and error handling
///
/// # Usage
/// ```rust
/// call_service!(state, state.search_service, async |service| {
///     service.initialize_index(path).await
/// }, "Failed to initialize search index");
/// ```
#[macro_export]
macro_rules! call_service {
    // With repo validation
    ($state:expr, $service:expr, $repo_root:expr, $call:expr, $error_msg:expr) => {{
        $state.clear_error();

        let Some(repo_root) = $repo_root.clone() else {
            $state.set_error("No repository selected".to_string());
            return;
        };

        if let Some(service) = &$service {
            let repo_path = repo_root.to_str().ok_or_else(|| "Invalid repository path".to_string());
            match repo_path {
                Ok(path) => {
                    match $call(service, path).await {
                        Ok(result) => result,
                        Err(e) => {
                            $state.set_error(format!("{}: {}", $error_msg, e));
                            return;
                        }
                    }
                }
                Err(e) => {
                    $state.set_error(e);
                    return;
                }
            }
        }
    }};

    // Without repo validation
    ($state:expr, $service:expr, $call:expr, $error_msg:expr) => {{
        $state.clear_error();

        if let Some(service) = &$service {
            match $call(service).await {
                Ok(result) => result,
                Err(e) => {
                    $state.set_error(format!("{}: {}", $error_msg, e));
                    return;
                }
            }
        }
    }};
}

/// Macro for handling service calls that update state
///
/// # Usage
/// ```rust
/// call_service_update!(state, state.search_service, async |service| {
///     service.search_commits(query).await
/// }, |state, result| {
///     state.search_results = result;
/// }, "Search failed");
/// ```
#[macro_export]
macro_rules! call_service_update {
    // With repo validation
    ($state:expr, $service:expr, $repo_root:expr, $call:expr, $update:expr, $error_msg:expr) => {{
        $state.clear_error();

        let Some(repo_root) = $repo_root.clone() else {
            $state.set_error("No repository selected".to_string());
            return;
        };

        if let Some(service) = &$service {
            let repo_path = repo_root.to_str().ok_or_else(|| "Invalid repository path".to_string());
            match repo_path {
                Ok(path) => {
                    match $call(service, path).await {
                        Ok(result) => {
                            $update($state, result);
                        }
                        Err(e) => {
                            $state.set_error(format!("{}: {}", $error_msg, e));
                        }
                    }
                }
                Err(e) => {
                    $state.set_error(e);
                }
            }
        }
    }};

    // Without repo validation
    ($state:expr, $service:expr, $call:expr, $update:expr, $error_msg:expr) => {{
        $state.clear_error();

        if let Some(service) = &$service {
            match $call(service).await {
                Ok(result) => {
                    $update($state, result);
                }
                Err(e) => {
                    $state.set_error(format!("{}: {}", $error_msg, e));
                }
            }
        }
    }};
}
