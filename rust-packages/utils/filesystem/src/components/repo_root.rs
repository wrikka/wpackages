use super::AbsPath;
use camino::Utf8Path;
use std::fmt;

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct RepoRoot(AbsPath);

impl RepoRoot {
    pub fn new(path: impl Into<AbsPath>) -> Self {
        Self(path.into())
    }

    pub fn as_path(&self) -> &Utf8Path {
        self.0.as_path()
    }
}

impl fmt::Display for RepoRoot {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        self.0.fmt(f)
    }
}

impl AsRef<Utf8Path> for RepoRoot {
    fn as_ref(&self) -> &Utf8Path {
        self.as_path()
    }
}

impl From<String> for RepoRoot {
    fn from(value: String) -> Self {
        Self(AbsPath::from(value))
    }
}

impl From<&str> for RepoRoot {
    fn from(value: &str) -> Self {
        Self(AbsPath::from(value))
    }
}
