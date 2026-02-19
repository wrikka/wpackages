use crate::error::{Error, Result};
use camino::Utf8Path;
use std::fs;

#[cfg(unix)]
use std::os::unix::fs::PermissionsExt;

/// A builder for creating file permissions.
#[derive(Debug, Clone, Default)]
pub struct PermissionsBuilder {
    readonly: Option<bool>,
    #[cfg(unix)]
    mode: u32,
}

impl PermissionsBuilder {
    /// Creates a new `PermissionsBuilder`.
    pub fn new() -> Self {
        Self::default()
    }

    /// Sets the readonly flag.
    pub fn readonly(mut self, readonly: bool) -> Self {
        self.readonly = Some(readonly);
        self
    }

    /// Sets the Unix permissions mode.
    #[cfg(unix)]
    pub fn mode(mut self, mode: u32) -> Self {
        self.mode = mode;
        self
    }

    /// Applies the permissions to a file.
        pub fn apply(&self, path: &Utf8Path) -> Result<()> {
        let mut perms = fs::metadata(path)?.permissions();

        if let Some(readonly) = self.readonly {
            perms.set_readonly(readonly);
        }

        #[cfg(unix)]
        {
            if self.mode != 0 {
                perms.set_mode(self.mode);
            }
        }

        fs::set_permissions(path, perms)?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_permissions_builder() -> Result<()> {
        let dir = tempdir()?;
        let file_path = Utf8Path::from_path(dir.path()).unwrap().join("test.txt");
        fs::write(&file_path, "hello")?;

        let builder = PermissionsBuilder::new().readonly(true);
        #[cfg(unix)]
        let builder = builder.mode(0o755);

        builder.apply(&file_path)?;

        let metadata = fs::metadata(&file_path)?;
        let perms = metadata.permissions();

        assert!(perms.readonly());
        #[cfg(unix)]
        {
            assert_eq!(perms.mode() & 0o777, 0o755);
        }

        Ok(())
    }
}
