//! Provides functions for creating and applying file patches.
//!
//! This module uses the `diff` crate to generate and apply patches in a standard text format.

use crate::error::{Error, Result};
use camino::Utf8Path;
use std::fs;

/// Creates a patch from the differences between two files.
///
/// The patch is returned as a string in a format compatible with the `patch` command-line utility.
///
/// # Arguments
///
/// * `from` - The original file.
/// * `to` - The modified file.
///
/// # Example
///
/// ```no_run
/// use file_ops::create_patch;
/// use camino::Utf8Path;
///
/// let from = Utf8Path::new("old_version.txt");
/// let to = Utf8Path::new("new_version.txt");
/// // std::fs::write(from, "hello\nworld").unwrap(); // Ensure files exist
/// // std::fs::write(to, "hello\nrust").unwrap();
/// let patch = create_patch(from, to).unwrap();
/// println!("{}", patch);
/// ```
pub fn create_patch(from: &Utf8Path, to: &Utf8Path) -> Result<String> {
    let from_content = fs::read_to_string(from)?;
    let to_content = fs::read_to_string(to)?;
    Ok(diff::lines(&from_content, &to_content)
        .iter()
        .map(|diff| match diff {
            diff::Result::Left(l) => format!("-{}", l),
            diff::Result::Both(l, _) => format!(" {}", l),
            diff::Result::Right(r) => format!("+{}", r),
        })
        .collect::<Vec<_>>()
        .join("\n"))
}

/// Applies a patch to a file in-place.
///
/// # Arguments
///
/// * `path` - The path to the file to be patched.
/// * `patch` - The patch string to apply.
///
/// # Example
///
/// ```no_run
/// use file_ops::apply_patch;
/// use camino::Utf8Path;
///
/// let path = Utf8Path::new("file_to_patch.txt");
/// let patch = "-world\n+rust";
/// // std::fs::write(path, "hello\nworld").unwrap(); // Ensure the file exists
/// apply_patch(path, patch).unwrap();
/// ```
pub fn apply_patch(path: &Utf8Path, patch: &str) -> Result<()> {
    let original_content = fs::read_to_string(path)?;
    let patched_content = apply_patch_text(&original_content, patch)
        .map_err(|e| Error::Patch(e))?;
    fs::write(path, patched_content)?;
    Ok(())
}

/// Apply a patch text to original content.
fn apply_patch_text(original: &str, patch: &str) -> std::result::Result<String, String> {
    let original_lines: Vec<&str> = original.lines().collect();
    let patch_lines: Vec<&str> = patch.lines().collect();
    let mut result = Vec::new();
    let mut orig_idx = 0;

    for line in &patch_lines {
        if line.is_empty() {
            continue;
        }
        match line.chars().next() {
            Some(' ') => {
                // Context line - must match original
                let content = &line[1..];
                if orig_idx < original_lines.len() && original_lines[orig_idx] == content {
                    result.push(content);
                    orig_idx += 1;
                } else {
                    return Err(format!(
                        "Context line mismatch at {}: expected '{}', got '{}'",
                        orig_idx, content, original_lines.get(orig_idx).unwrap_or(&"")
                    ));
                }
            }
            Some('-') => {
                // Deletion - skip this line in original
                let content = &line[1..];
                if orig_idx < original_lines.len() && original_lines[orig_idx] == content {
                    orig_idx += 1;
                } else {
                    return Err(format!(
                        "Deletion mismatch at {}: expected '{}', got '{}'",
                        orig_idx, content, original_lines.get(orig_idx).unwrap_or(&"")
                    ));
                }
            }
            Some('+') => {
                // Addition - include this line
                result.push(&line[1..]);
            }
            _ => {
                return Err(format!("Invalid patch line: {}", line));
            }
        }
    }

    // Add any remaining original lines
    while orig_idx < original_lines.len() {
        result.push(original_lines[orig_idx]);
        orig_idx += 1;
    }

    Ok(result.join("\n"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_create_apply_patch() -> Result<()> {
        let dir = tempdir()?;
        let original_path = Utf8Path::from_path(dir.path()).unwrap().join("original.txt");
        let new_path = Utf8Path::from_path(dir.path()).unwrap().join("new.txt");

        let original_content = "hello\nworld";
        let new_content = "hello\nrust";

        fs::write(&original_path, original_content)?;
        fs::write(&new_path, new_content)?;

        let patch = create_patch(&original_path, &new_path)?;

        apply_patch(&original_path, &patch)?;

        let patched_content = fs::read_to_string(&original_path)?;
        assert_eq!(patched_content, new_content);

        Ok(())
    }
}
