use crate::core_ops::{copy, CopyOptions};
use crate::error::Result;
use camino::{Utf8Path, Utf8PathBuf};
use rayon::prelude::*;
use glob::glob;


/// Copies files based on a glob pattern in parallel.
///
/// Returns a list of results for each copy operation.
///
/// # Arguments
///
/// * `from_pattern` - A glob pattern specifying the source files.
/// * `to_dir` - The destination directory.
/// * `options` - Copy options.
pub fn copy_batch_glob<'a>(
    from_pattern: &str,
    to_dir: &Utf8Path,
    options: &'a CopyOptions<'a>,
) -> Result<Vec<Result<()>>> {
    let tasks: Vec<(Utf8PathBuf, Utf8PathBuf)> = glob(from_pattern)?
        .filter_map(|e| e.ok())
        .map(|path| {
            let from = Utf8PathBuf::from_path_buf(path).unwrap();
            let to = to_dir.join(from.file_name().unwrap());
            (from, to)
        })
        .collect();

    Ok(copy_batch(&tasks, options))
}

/// Copies a list of files in parallel.
///
/// # Arguments
///
/// * `tasks` - A slice of tuples, where each tuple contains a source and destination path.
/// * `options` - Copy options.
///
/// # Example
///
/// ```no_run
/// use file_ops::{copy_batch, CopyOptions};
/// use camino::Utf8PathBuf;
///
/// let tasks = vec![
///     (Utf8PathBuf::from("file1.txt"), Utf8PathBuf::from("dest/file1.txt")),
///     (Utf8PathBuf::from("file2.txt"), Utf8PathBuf::from("dest/file2.txt")),
/// ];
/// let options = CopyOptions::default();
/// let results = copy_batch(&tasks, &options);
/// assert!(results.iter().all(|r| r.is_ok()));
/// ```
pub fn copy_batch<'a>(
    tasks: &[(Utf8PathBuf, Utf8PathBuf)],
    options: &'a CopyOptions<'a>,
) -> Vec<Result<()>> {
    tasks
        .par_iter()
        .map(|(from, to)| copy(from, to, options))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_copy_batch_glob_success() -> Result<()> {
        let dir = tempdir()?;
        let from_dir = Utf8Path::from_path(dir.path()).unwrap().join("from");
        let to_dir = Utf8Path::from_path(dir.path()).unwrap().join("to");
        std::fs::create_dir(&from_dir)?;
        std::fs::create_dir(&to_dir)?;

        for i in 0..5 {
            std::fs::write(from_dir.join(format!("file_{}.txt", i)), "")?;
        }
        for i in 0..5 {
            std::fs::write(from_dir.join(format!("file_{}.log", i)), "")?;
        }

        let pattern = from_dir.join("*.txt").to_string();
        let results = copy_batch_glob(&pattern, &to_dir, &CopyOptions::default())?;

        assert!(results.iter().all(|r| r.is_ok()));
        assert_eq!(std::fs::read_dir(to_dir)?.count(), 5);

        Ok(())
    }

    #[test]
    fn test_copy_batch_success() {
        let dir = tempdir().unwrap();
        let from_dir = Utf8Path::from_path(dir.path()).unwrap().join("from");
        let to_dir = Utf8Path::from_path(dir.path()).unwrap().join("to");
        std::fs::create_dir(&from_dir).unwrap();
        std::fs::create_dir(&to_dir).unwrap();

        let mut tasks = vec![];
        for i in 0..10 {
            let from = from_dir.join(format!("file_{}.txt", i));
            let to = to_dir.join(format!("file_{}.txt", i));
            std::fs::write(&from, format!("content_{}", i)).unwrap();
            tasks.push((from, to));
        }

        let results = copy_batch(&tasks, &CopyOptions::default());

        assert!(results.iter().all(|r| r.is_ok()));

        for (_, to) in tasks {
            assert!(to.exists());
        }
    }
}
