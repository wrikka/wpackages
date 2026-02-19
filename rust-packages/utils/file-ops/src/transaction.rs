use camino::{Utf8Path, Utf8PathBuf};
use std::fs;
use tempfile::{tempdir, TempDir};

use crate::error::Error;
use crate::core_ops;

/// Represents a single file operation within a transaction.
#[derive(Debug)]
enum Operation {
    Write { path: Utf8PathBuf },
    Copy { to: Utf8PathBuf },
    Move { from: Utf8PathBuf, to: Utf8PathBuf },
    Delete { path: Utf8PathBuf },
}

/// A file system transaction that can be committed or rolled back.
///
/// Operations are first performed in a temporary staging directory.
/// When the transaction is committed, the changes are atomically
/// moved to their final destination.
/// If the transaction is dropped without being committed, all changes are discarded.
#[derive(Debug)]
pub struct Transaction {
    staging_dir: TempDir,
    operations: Vec<Operation>,
    committed: bool,
}

impl Transaction {
    /// Creates a new, empty transaction.
    pub fn new() -> Result<Self, Error> {
        let staging_dir = tempdir()?;
        Ok(Self {
            staging_dir,
            operations: Vec::new(),
            committed: false,
        })
    }

    fn staging_path(&self, path: &Utf8Path) -> Utf8PathBuf {
        let mut staging_path = Utf8PathBuf::from_path_buf(self.staging_dir.path().to_path_buf()).unwrap();
        // Strip leading `/` or `C:` to make the path relative for joining.
        let relative_path = path.strip_prefix("/").unwrap_or(path);
        staging_path.push(relative_path);
        staging_path
    }

    /// Stages a write operation. The content is written to a temporary file.
    pub fn write(&mut self, path: &Utf8Path, contents: &[u8]) -> Result<(), Error> {
        let staging_path = self.staging_path(path);
        if let Some(parent) = staging_path.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::write(&staging_path, contents)?;
        self.operations.push(Operation::Write { path: path.to_path_buf() });
        Ok(())
    }

    /// Stages a copy operation. The file is copied to the staging directory.
    pub fn copy(&mut self, from: &Utf8Path, to: &Utf8Path) -> Result<(), Error> {
        let staging_to = self.staging_path(to);
        if let Some(parent) = staging_to.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::copy(from, &staging_to)?;
        self.operations.push(Operation::Copy { to: to.to_path_buf() });
        Ok(())
    }

    /// Stages a move operation.
    pub fn move_file(&mut self, from: &Utf8Path, to: &Utf8Path) -> Result<(), Error> {
        let staging_to = self.staging_path(to);
        if let Some(parent) = staging_to.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::copy(from, &staging_to)?;
        self.operations.push(Operation::Move { from: from.to_path_buf(), to: to.to_path_buf() });
        Ok(())
    }

    /// Stages a delete operation.
    pub fn delete(&mut self, path: &Utf8Path) -> Result<(), Error> {
        self.operations.push(Operation::Delete { path: path.to_path_buf() });
        Ok(())
    }

    /// Commits all staged operations.
    /// This is the point of no return. If any operation fails, the state might be inconsistent.
    /// A more robust implementation would use a journal for recovery.
    pub fn commit(mut self) -> Result<(), Error> {
        // Phase 1: Atomically move all new/modified files from staging to their final destination.
        for op in &self.operations {
            match op {
                Operation::Write { path } | Operation::Copy { to: path } | Operation::Move { to: path, .. } => {
                    let staging_path = self.staging_path(path);
                    if let Some(parent) = path.parent() {
                        fs::create_dir_all(parent)?;
                    }
                    fs::rename(staging_path, path)?;
                }
                _ => {}
            }
        }

        // Phase 2: Perform deletions.
        for op in &self.operations {
            match op {
                Operation::Delete { path } => {
                    core_ops::delete(path)?;
                }
                Operation::Move { from, .. } => {
                    core_ops::delete(from)?;
                }
                _ => {}
            }
        }

        self.committed = true;
        Ok(())
    }
}

impl Drop for Transaction {
    fn drop(&mut self) {
        if !self.committed {
            // Rollback: The TempDir will be automatically cleaned up,
            // removing the staging directory and all its contents.
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_transaction_write_commit() -> Result<(), Error> {
        let dir = tempdir()?;
        let file_path = Utf8Path::from_path(dir.path()).unwrap().join("test.txt");

        let mut tx = Transaction::new()?;
        tx.write(&file_path, b"hello world")?;
        tx.commit()?;

        assert_eq!(fs::read_to_string(file_path)?,"hello world");

        Ok(())
    }

    #[test]
    fn test_transaction_move_commit() -> Result<(), Error> {
        let dir = tempdir()?;
        let from_path = Utf8Path::from_path(dir.path()).unwrap().join("from.txt");
        let to_path = Utf8Path::from_path(dir.path()).unwrap().join("to.txt");

        fs::write(&from_path, "hello move")?;

        let mut tx = Transaction::new()?;
        tx.move_file(&from_path, &to_path)?;
        tx.commit()?;

        assert!(!from_path.exists());
        assert!(to_path.exists());
        assert_eq!(fs::read_to_string(to_path)?,"hello move");

        Ok(())
    }

    #[test]
    fn test_transaction_rollback() -> Result<(), Error> {
        let dir = tempdir()?;
        let file_path = Utf8Path::from_path(dir.path()).unwrap().join("test.txt");

        let mut tx = Transaction::new()?;
        tx.write(&file_path, b"hello world")?;
        // Drop the transaction without committing
        drop(tx);

        assert!(!file_path.exists());

        Ok(())
    }
}
