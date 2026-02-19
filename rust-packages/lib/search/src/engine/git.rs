use crate::engine::text::TextMatch;
use git2::{BlameOptions, DiffOptions, Patch, Repository};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use thiserror::Error;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlameResult {
    pub commit: String,
    pub author: String,
    pub date: String,
    pub line_number: usize,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiffResult {
    pub path: String,
    pub line_number_before: Option<usize>,
    pub line_number_after: Option<usize>,
    pub line: String,
}

#[derive(Error, Debug)]
pub enum GitError {
    #[error("git2 error: {0}")]
    Git2(#[from] git2::Error),
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),
    #[error("UTF-8 error: {0}")]
    Utf8(#[from] std::str::Utf8Error),
    #[error("line {1} not found in blame for file {0}")]
    BlameLineNotFound(String, usize),
}

pub fn search_diff(
    repo_path: &str,
    revspec: &str,
    pattern: &str,
) -> Result<Vec<TextMatch>, GitError> {
    let repo = Repository::open(repo_path)?;
    let mut revwalk = repo.revwalk()?;
    revwalk.push_range(revspec)?;

    let mut results = Vec::new();

    for oid in revwalk {
        let oid = oid?;
        let commit = repo.find_commit(oid)?;
        let tree = commit.tree()?;
        let parent_commit = if commit.parent_count() > 0 {
            commit.parent(0).ok()
        } else {
            None
        };
        let parent_tree = parent_commit.as_ref().and_then(|p| p.tree().ok());

        let mut diff_opts = DiffOptions::new();
        let diff = repo.diff_tree_to_tree(parent_tree.as_ref(), Some(&tree), Some(&mut diff_opts))?;

        diff.foreach(
            &mut |delta, _| {
                if let Ok(patch) = Patch::from_diff(&diff, 0) {
                    for hunk_idx in 0..patch.num_hunks() {
                        if let Ok((hunk, _)) = patch.hunk(hunk_idx) {
                            for line_idx in 0..hunk.num_lines() {
                                if let Ok(line) = patch.line_in_hunk(hunk_idx, line_idx) {
                                    if line.origin() == '+' || line.origin() == '-' {
                                        if let Ok(content) = std::str::from_utf8(line.content()) {
                                            if content.contains(pattern) {
                                                if let Some(path) = delta.new_file().path() {
                                                    results.push(TextMatch {
                                                        path: path.to_string_lossy().into_owned(),
                                                        line: line.new_lineno().or(line.old_lineno()).unwrap_or(0) as usize,
                                                        text: content.to_string(),
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                true
            },
            None,
            None,
            None,
        )?;
    }
    Ok(results)
}

pub fn blame(repo_path: &str, file_path: &str, line_number: usize) -> Result<BlameResult, GitError> {
    let repo = Repository::open(repo_path)?;
    let mut blame_opts = BlameOptions::new();
    let blame = repo.blame_file(Path::new(file_path), Some(&mut blame_opts))?;

    if let Some(hunk) = blame.get_line(line_number) {
        let commit = repo.find_commit(hunk.orig_commit_id())?;
        let content = std::fs::read_to_string(file_path)?
            .lines()
            .nth(line_number - 1)
            .unwrap_or("")
            .to_string();

        Ok(BlameResult {
            commit: hunk.orig_commit_id().to_string(),
            author: hunk.orig_signature().name().unwrap_or("").to_string(),
            date: "".to_string(), // Date is not easily available here
            line_number,
            content,
        })
    } else {
        Err(GitError::BlameLineNotFound(
            file_path.to_string(),
            line_number,
        ))
    }
}
