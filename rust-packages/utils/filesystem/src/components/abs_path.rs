use camino::{Utf8Path, Utf8PathBuf};
use std::fmt;

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct AbsPath(Utf8PathBuf);

impl AbsPath {
    pub fn new(path: impl Into<Utf8PathBuf>) -> Self {
        Self(path.into())
    }

    pub fn as_path(&self) -> &Utf8Path {
        &self.0
    }

    pub fn exists(&self) -> bool {
        self.0.exists()
    }
}

impl fmt::Display for AbsPath {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl AsRef<std::path::Path> for AbsPath {
    fn as_ref(&self) -> &std::path::Path {
        self.0.as_std_path()
    }
}

impl AsRef<Utf8Path> for AbsPath {
    fn as_ref(&self) -> &Utf8Path {
        self.as_path()
    }
}

impl From<Utf8PathBuf> for AbsPath {
    fn from(value: Utf8PathBuf) -> Self {
        Self(value)
    }
}

impl From<AbsPath> for Utf8PathBuf {
    fn from(value: AbsPath) -> Self {
        value.0
    }
}

impl From<&str> for AbsPath {
    fn from(value: &str) -> Self {
        Self(Utf8PathBuf::from(value))
    }
}

impl From<String> for AbsPath {
    fn from(value: String) -> Self {
        Self(Utf8PathBuf::from(value))
    }
}
