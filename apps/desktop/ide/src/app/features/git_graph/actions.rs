//! # Git Graph Actions
//!
//! Actions for the Interactive Git Graph Visualization feature.

use crate::app::state::IdeState;
use crate::types::git_graph_types::*;
use crate::services::git_graph_service::GraphService;

/// Load git graph for the selected repository
pub async fn load_git_graph(state: &mut IdeState) {
    state.clear_error();

    let Some(repo_root) = state.core.workspace.selected_repo.clone() else {
        state.set_error("No repository selected".to_string());
        return;
    };

    if let Some(graph_service) = &state.services.graph_service {
        let repo_path = repo_root.to_str().ok_or_else(|| "Invalid repository path".to_string());
        match repo_path {
            Ok(path) => {
                match graph_service.get_graph(path).await {
                    Ok(graph) => {
                        state.features.git_graph = graph;
                    }
                    Err(e) => {
                        state.set_error(format!("Failed to load git graph: {}", e));
                    }
                }
            }
            Err(e) => {
                state.set_error(e);
            }
        }
    }
}

/// Refresh git graph
pub async fn refresh_git_graph(state: &mut IdeState) {
    load_git_graph(state).await;
}

/// Apply filters to git graph
pub async fn apply_graph_filters(state: &mut IdeState, filters: GraphFilters) {
    state.clear_error();

    if let Some(graph_service) = &state.services.graph_service {
        match graph_service.apply_filters(&mut state.features.git_graph, filters).await {
            Ok(()) => {}
            Err(e) => {
                state.set_error(format!("Failed to apply filters: {}", e));
            }
        }
    }
}

/// Set graph view mode
pub fn set_graph_view_mode(state: &mut IdeState, mode: GraphViewMode) {
    state.features.git_graph.view_mode = mode;
}

/// Set graph orientation
pub fn set_graph_orientation(state: &mut IdeState, orientation: GraphOrientation) {
    state.features.git_graph.layout.orientation = orientation;
}

/// Toggle graph animation
pub fn toggle_graph_animation(state: &mut IdeState) {
    state.features.git_graph.animation.enabled = !state.features.git_graph.animation.enabled;
}

/// Set graph animation speed
pub fn set_graph_animation_speed(state: &mut IdeState, speed: AnimationSpeed) {
    state.features.git_graph.animation.speed = speed;
}

/// Select commit in graph
pub fn select_graph_commit(state: &mut IdeState, commit_hash: Option<String>) {
    state.features.git_graph.interaction.selected_commit = commit_hash;
}

/// Get commit details
pub async fn get_commit_details(state: &mut IdeState, commit_hash: &str) {
    state.clear_error();

    let Some(repo_root) = state.core.workspace.selected_repo.clone() else {
        state.set_error("No repository selected".to_string());
        return;
    };

    if let Some(graph_service) = &state.services.graph_service {
        let repo_path = repo_root.to_str().ok_or_else(|| "Invalid repository path".to_string());
        match repo_path {
            Ok(path) => {
                match graph_service.get_commit_details(path, commit_hash).await {
                    Ok(details) => {
                        state.features.selected_commit = Some(details);
                    }
                    Err(e) => {
                        state.set_error(format!("Failed to get commit details: {}", e));
                    }
                }
            }
            Err(e) => {
                state.set_error(e);
            }
        }
    }
}

/// Search commits in graph
pub async fn search_graph_commits(state: &mut IdeState, query: &str) {
    state.clear_error();

    let Some(repo_root) = state.core.workspace.selected_repo.clone() else {
        state.set_error("No repository selected".to_string());
        return;
    };

    if let Some(graph_service) = &state.services.graph_service {
        let repo_path = repo_root.to_str().ok_or_else(|| "Invalid repository path".to_string());
        match repo_path {
            Ok(path) => {
                match graph_service.search_commits(path, query).await {
                    Ok(results) => {
                        state.features.search_results = results;
                    }
                    Err(e) => {
                        state.set_error(format!("Failed to search commits: {}", e));
                    }
                }
            }
            Err(e) => {
                state.set_error(e);
            }
        }
    }
}

/// Reset graph view
pub fn reset_graph_view(state: &mut IdeState) {
    state.features.git_graph.interaction.zoom_level = 1.0;
    state.features.git_graph.interaction.pan_offset = PanOffset { x: 0.0, y: 0.0 };
    state.features.git_graph.interaction.selected_commit = None;
    state.features.git_graph.interaction.hovered_commit = None;
}

/// Toggle graph labels
pub fn toggle_graph_labels(state: &mut IdeState) {
    state.features.git_graph.layout.show_labels = !state.features.git_graph.layout.show_labels;
}

/// Toggle graph dates
pub fn toggle_graph_dates(state: &mut IdeState) {
    state.features.git_graph.layout.show_dates = !state.features.git_graph.layout.show_dates;
}

/// Toggle graph authors
pub fn toggle_graph_authors(state: &mut IdeState) {
    state.features.git_graph.layout.show_authors = !state.features.git_graph.layout.show_authors;
}
