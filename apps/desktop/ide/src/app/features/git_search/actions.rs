//! # Git Search Actions
//!
//! Actions for the Advanced Search & Navigation feature.

use crate::app::state::IdeState;
use crate::types::git_search_types::*;
use crate::services::git_search_service::GitSearchService;

/// Initialize search index for the selected repository
pub async fn initialize_search_index(state: &mut IdeState) {
    state.clear_error();

    let Some(repo_root) = state.core.workspace.selected_repo.clone() else {
        state.set_error("No repository selected".to_string());
        return;
    };

    if let Some(search_service) = &state.services.search_service {
        let repo_path = repo_root.to_str().ok_or_else(|| "Invalid repository path".to_string());
        match repo_path {
            Ok(path) => {
                match search_service.initialize_index(path).await {
                    Ok(()) => {
                        state.set_info("Search index initialized".to_string());
                    }
                    Err(e) => {
                        state.set_error(format!("Failed to initialize search index: {}", e));
                    }
                }
            }
            Err(e) => {
                state.set_error(e);
            }
        }
    }
}

/// Perform search
pub async fn perform_search(state: &mut IdeState, query: &SearchQuery) {
    state.clear_error();

    if let Some(search_service) = &state.services.search_service {
        let results = match query.scope {
            SearchScope::Commits => search_service.search_commits(query).await,
            SearchScope::Files => search_service.search_files(query).await,
            SearchScope::Branches => search_service.search_branches(query).await,
            SearchScope::All => {
                // Search all scopes and merge results
                let mut all_results = Vec::new();
                if let Ok(commits) = search_service.search_commits(query).await {
                    all_results.extend(commits);
                }
                if let Ok(files) = search_service.search_files(query).await {
                    all_results.extend(files);
                }
                if let Ok(branches) = search_service.search_branches(query).await {
                    all_results.extend(branches);
                }
                Ok(all_results)
            }
        };

        match results {
            Ok(r) => {
                state.features.search_results = r;
            }
            Err(e) => {
                state.set_error(format!("Search failed: {}", e));
            }
        }
    }
}

/// Perform semantic search
pub async fn semantic_search(state: &mut IdeState, intent: &str) {
    state.clear_error();

    let Some(repo_root) = state.core.workspace.selected_repo.clone() else {
        state.set_error("No repository selected".to_string());
        return;
    };

    if let Some(search_service) = &state.services.search_service {
        let repo_path = repo_root.to_str().ok_or_else(|| "Invalid repository path".to_string());
        match repo_path {
            Ok(path) => {
                match search_service.semantic_search(path, intent).await {
                    Ok(results) => {
                        state.features.search_results = results;
                    }
                    Err(e) => {
                        state.set_error(format!("Semantic search failed: {}", e));
                    }
                }
            }
            Err(e) => {
                state.set_error(e);
            }
        }
    }
}

/// Perform regex search
pub async fn regex_search(state: &mut IdeState, pattern: &str) {
    state.clear_error();

    let Some(repo_root) = state.core.workspace.selected_repo.clone() else {
        state.set_error("No repository selected".to_string());
        return;
    };

    if let Some(search_service) = &state.services.search_service {
        let repo_path = repo_root.to_str().ok_or_else(|| "Invalid repository path".to_string());
        match repo_path {
            Ok(path) => {
                match search_service.regex_search(path, pattern).await {
                    Ok(results) => {
                        state.features.search_results = results;
                    }
                    Err(e) => {
                        state.set_error(format!("Regex search failed: {}", e));
                    }
                }
            }
            Err(e) => {
                state.set_error(e);
            }
        }
    }
}

/// Perform multi-repo search
pub async fn multi_repo_search(state: &mut IdeState, query: &SearchQuery, repos: &[RepoConfig]) {
    state.clear_error();

    if let Some(search_service) = &state.services.search_service {
        match search_service.multi_repo_search(query, repos).await {
            Ok(results) => {
                state.features.search_results = results;
            }
            Err(e) => {
                state.set_error(format!("Multi-repo search failed: {}", e));
            }
        }
    }
}

/// Save search query
pub async fn save_search_query(state: &mut IdeState, query: &SearchQuery, name: &str) {
    state.clear_error();

    if let Some(search_service) = &state.services.search_service {
        match search_service.save_query(query, name).await {
            Ok(saved_query) => {
                state.features.saved_search_queries.push(saved_query);
                state.set_info(format!("Query '{}' saved", name));
            }
            Err(e) => {
                state.set_error(format!("Failed to save query: {}", e));
            }
        }
    }
}

/// Load saved queries
pub async fn load_saved_queries(state: &mut IdeState) {
    state.clear_error();

    if let Some(search_service) = &state.services.search_service {
        match search_service.get_saved_queries().await {
            Ok(queries) => {
                state.features.saved_search_queries = queries;
            }
            Err(e) => {
                state.set_error(format!("Failed to load saved queries: {}", e));
            }
        }
    }
}

/// Delete saved query
pub fn delete_saved_query(state: &mut IdeState, query_id: &str) {
    state.features.saved_search_queries.retain(|q| q.id != query_id);
}

/// Clear search results
pub fn clear_search_results(state: &mut IdeState) {
    state.features.search_results.clear();
}

/// Get search statistics
pub async fn get_search_stats(state: &mut IdeState, query: &SearchQuery) {
    state.clear_error();

    if let Some(search_service) = &state.services.search_service {
        match search_service.get_search_stats(query).await {
            Ok(stats) => {
                state.features.search_stats = Some(stats);
            }
            Err(e) => {
                state.set_error(format!("Failed to get search stats: {}", e));
            }
        }
    }
}
