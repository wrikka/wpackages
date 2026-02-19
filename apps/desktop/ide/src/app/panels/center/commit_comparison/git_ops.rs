use crate::app::state::IdeState;

pub(crate) fn perform_comparison(state: &mut IdeState) {
    if let Some(repo_root) = &state.workspace.selected_repo {
        state.commit_comparison.comparing = true;

        let commit_a = state.commit_comparison.commit_a.clone();
        let commit_b = state.commit_comparison.commit_b.clone();
        let branch_a = state.commit_comparison.branch_a.clone();
        let branch_b = state.commit_comparison.branch_b.clone();
        let repo_path = repo_root.clone();

        tokio::spawn(async move {
            let comparison_result = perform_git_comparison(
                &repo_path,
                commit_a.as_deref(),
                commit_b.as_deref(),
                branch_a.as_deref(),
                branch_b.as_deref(),
            ).await;

            match comparison_result {
                Ok(result) => {
                    // TODO: Implement comparison result update via channel or async mechanism
                    // - Send comparison result to state
                    // - Update UI to display comparison
                    // For now, this is a placeholder
                }
                Err(e) => {
                    eprintln!("Failed to compare commits: {}", e);
                }
            }
        });
    }
}

async fn perform_git_comparison(
    repo_path: &str,
    commit_a: Option<&str>,
    commit_b: Option<&str>,
    branch_a: Option<&str>,
    branch_b: Option<&str>,
) -> Result<crate::types::commit_comparison::ComparisonResult, Box<dyn std::error::Error>> {
    use git::ops::diff::compare_commits;

    let repo = git::Repository::open(repo_path)?;

    let rev_a = if let Some(commit) = commit_a {
        Some(repo.revparse_single(commit)?.peel_to_commit()?)
    } else if let Some(branch) = branch_a {
        Some(repo.revparse_single(branch)?.peel_to_commit()?)
    } else {
        Some(repo.head()?.peel_to_commit()?)
    };

    let rev_b = if let Some(commit) = commit_b {
        Some(repo.revparse_single(commit)?.peel_to_commit()?)
    } else if let Some(branch) = branch_b {
        Some(repo.revparse_single(branch)?.peel_to_commit()?)
    } else {
        None
    };

    if let (Some(commit_a), Some(commit_b)) = (rev_a, rev_b) {
        let diff = compare_commits(&repo, &commit_a, &commit_b)?;

        let mut total_files = 0;
        let mut added_files = 0;
        let mut modified_files = 0;
        let mut deleted_files = 0;
        let mut total_additions = 0;
        let mut total_deletions = 0;
        let mut files = Vec::new();

        for delta in diff.deltas() {
            total_files += 1;
            let file_path = delta.new_file().path().and_then(|p| p.to_str()).unwrap_or("unknown").to_string();

            let (status, additions, deletions) = if delta.status() == git::Delta::Added {
                added_files += 1;
                (crate::types::commit_comparison::FileStatus::Added, 0, 0)
            } else if delta.status() == git::Delta::Deleted {
                deleted_files += 1;
                (crate::types::commit_comparison::FileStatus::Deleted, 0, 0)
            } else if delta.status() == git::Delta::Modified {
                modified_files += 1;
                (crate::types::commit_comparison::FileStatus::Modified, 0, 0)
            } else if delta.status() == git::Delta::Renamed {
                (crate::types::commit_comparison::FileStatus::Renamed, 0, 0)
            } else {
                (crate::types::commit_comparison::FileStatus::Copied, 0, 0)
            };

            total_additions += additions;
            total_deletions += deletions;

            files.push(crate::types::commit_comparison::FileComparison {
                path: file_path,
                status,
                additions,
                deletions,
            });
        }

        Ok(crate::types::commit_comparison::ComparisonResult {
            files,
            stats: crate::types::commit_comparison::ComparisonStats {
                total_files,
                total_additions,
                total_deletions,
                added_files,
                modified_files,
                deleted_files,
            },
        })
    } else {
        Err("Both commits/branches must be specified for comparison".into())
    }
}
