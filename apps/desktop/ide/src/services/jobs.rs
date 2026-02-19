use crate::error::AppResult;
use crate::types::jobs::{JobRequest, JobResult, RepoData};

// Assuming these are workspace crates
use filesystem;
use git::{self, DiffTarget};

pub fn process_request(req: JobRequest) -> AppResult<JobResult> {
    match req {
        JobRequest::ListRepos {
            project_idx,
            project_root,
        } => {
            let repos = git::list_repos(&project_root)?;
            Ok(JobResult::Repos { project_idx, repos })
        }
        JobRequest::LoadRepo { repo_root } => {
            let branches = git::list_branches(repo_root.as_path())?;
            let commits = git::list_commits(repo_root.as_path(), 50)?;
            let status = git::git_status(repo_root.as_path())?;
            let diffs = git::git_diff(repo_root.as_path(), DiffTarget::Head, DiffTarget::Workdir)?;
            let tree = filesystem::list_files(repo_root.as_path(), 6).await?;

            Ok(JobResult::RepoData {
                repo_root,
                data: RepoData {
                    branches,
                    commits,
                    status,
                    diffs,
                    tree,
                },
            })
        }
    }
}
