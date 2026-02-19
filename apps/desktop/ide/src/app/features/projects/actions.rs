use crate::app::state::IdeState;
use crate::types::jobs::JobRequest;
use git;

pub fn add_project(state: &mut IdeState) {
    let folder = rfd::FileDialog::new().pick_folder();
    let Some(folder) = folder else {
        return;
    };

    let root = folder.to_string_lossy().to_string();
    if state.core.workspace.projects.iter().any(|p| p == &root) {
        return;
    }

    state.core.workspace.projects.push(root);
    state.core.workspace.repos_by_project.push(Vec::new());

    if state.core.workspace.selected_project.is_none() {
        state.core.workspace.selected_project = Some(0);
    }

    reload_project_repos(state);
}

pub fn select_project(state: &mut IdeState, project_idx: usize) {
    if project_idx >= state.core.workspace.projects.len() {
        return;
    }

    state.core.workspace.selected_project = Some(project_idx);
    state.reset_selection();

    reload_project_repos(state);
}

pub fn reload_project_repos(state: &mut IdeState) {
    state.clear_error();

    let Some(project_idx) = state.core.workspace.selected_project else {
        return;
    };
    let Some(root) = state.core.workspace.projects.get(project_idx).cloned() else {
        return;
    };

    state.core.workspace.loading_projects = true;
    if let Some(slot) = state.core.workspace.repos_by_project.get_mut(project_idx) {
        let slot: &mut Vec<crate::types::git::RepoSummary> = slot;
        slot.clear();
    }

    if let Some(tx) = state.channels.job_tx.as_ref() {
        let _ = tx.send(JobRequest::ListRepos {
            project_idx,
            project_root: root,
        });
        return;
    }

    // Fallback: synchronous mode (e.g. if job runner wasn't initialized).
    match git::list_repos(&root) {
        Ok(r) => {
            if let Some(slot) = state.core.workspace.repos_by_project.get_mut(project_idx) {
                *slot = r;
            }
        }
        Err(e) => state.set_error(e),
    }

    state.core.workspace.loading_projects = false;

    if state.core.workspace.selected_repo.is_none() {
        state.core.workspace.selected_repo = state
            .core
            .workspace
            .repos_by_project
            .get(project_idx)
            .and_then(|repos: &Vec<crate::types::git::RepoSummary>| repos.first())
            .map(|r: &crate::types::git::RepoSummary| r.root.clone());
    }
}
