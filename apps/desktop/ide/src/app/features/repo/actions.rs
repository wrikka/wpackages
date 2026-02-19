use crate::app::runtime::TOKIO_RUNTIME;
use crate::app::state::IdeState;
use crate::types::jobs::JobRequest;
use filesystem;
use git::{self, DiffTarget};

pub async fn reload_repo_data(state: &mut IdeState) {
    state.clear_error();

    let Some(repo_root) = state.core.workspace.selected_repo.clone() else {
        state.core.git.branches = Vec::new();
        state.core.git.commits = Vec::new();
        state.core.git.status = Vec::new();
        state.core.git.diffs = Vec::new();
        state.core.fs.file_tree = Vec::new();
        return;
    };

    state.core.workspace.loading_repo = true;

    if let Some(tx) = state.channels.job_tx.as_ref() {
        let _ = tx.send(JobRequest::LoadRepo { repo_root });
        return;
    }

    let branches = await git::list_branches_async(repo_root.as_path());
    let commits = await git::list_commits_async(repo_root.as_path(), 50);
    let status = await git::git_status_async(repo_root.as_path());
    let diffs = await git::git_diff_async(repo_root.as_path(), DiffTarget::Head, DiffTarget::Workdir);
    let tree = TOKIO_RUNTIME.block_on(filesystem::list_files(repo_root.as_path(), 6));

    let mut first_err: Option<String> = None;
                    if let Err(e) = &branches {
        if first_err.is_none() {
            first_err = Some(e.to_string());
        }
    }
    if let Err(e) = &commits {
        if first_err.is_none() {
            first_err = Some(e.to_string());
        }
    }
    if let Err(e) = &status {
        if first_err.is_none() {
            first_err = Some(e.to_string());
        }
    }
    if let Err(e) = &diffs {
        if first_err.is_none() {
            first_err = Some(e.to_string());
        }
    }
    if let Err(e) = &tree {
        if first_err.is_none() {
            first_err = Some(e.to_string());
        }
    }

    state.core.git.branches = branches.unwrap_or_default();
    state.core.git.commits = commits.unwrap_or_default();
    state.core.git.status = status.unwrap_or_default();
    state.core.git.diffs = diffs.unwrap_or_default();

    state.core.git.git_status_abs.clear();
    for s in &state.core.git.status {
        let root = repo_root.to_string();
        let abs = format!("{}/{}", root.trim_end_matches(['/', '\\']), s.path);
        state.core.git.git_status_abs.insert(abs, s.status.as_str().to_string());
    }

    state.core.fs.file_tree = tree.unwrap_or_default();

    state.core.workspace.loading_repo = false;

    if let Some(e) = first_err {
        state.set_error(e);
    }
}
