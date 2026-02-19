//! Provides path manipulation utilities.

use camino::{Utf8Component, Utf8Path, Utf8PathBuf};

/// Cleans a path by resolving `.` and `..` components.
///
/// This is similar to `std::path::Path::canonicalize` but it does not
/// resolve symlinks and does not require the path to exist on the filesystem.
///
/// # Arguments
///
/// * `path` - The path to clean.
///
/// # Example
///
/// ```
/// use file_ops::clean_path;
/// use camino::{Utf8Path, Utf8PathBuf};
///
/// let path = Utf8Path::new("/foo/./bar/../baz");
/// let cleaned = clean_path(path);
/// assert_eq!(cleaned, Utf8PathBuf::from("/foo/baz"));
/// ```
pub fn clean_path(path: &Utf8Path) -> Utf8PathBuf {
    let mut cleaned = Utf8PathBuf::new();
    for component in path.components() {
        match component {
            Utf8Component::RootDir => {
                cleaned.push(component.as_str());
            }
            Utf8Component::CurDir => {}
            Utf8Component::ParentDir => {
                cleaned.pop();
            }
            Utf8Component::Normal(part) => {
                cleaned.push(part);
            }
            Utf8Component::Prefix(prefix) => {
                cleaned.push(prefix.as_str());
            }
        }
    }
    cleaned
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clean_path() {
        assert_eq!(clean_path(Utf8Path::new("/foo/./bar/../baz")), Utf8PathBuf::from("/foo/baz"));
        assert_eq!(clean_path(Utf8Path::new("foo/./bar/../baz")), Utf8PathBuf::from("foo/baz"));
        assert_eq!(clean_path(Utf8Path::new("/../foo")), Utf8PathBuf::from("/foo"));
        assert_eq!(clean_path(Utf8Path::new("C:\\foo\\..\\bar")), Utf8PathBuf::from("C:\\bar"));
    }
}
