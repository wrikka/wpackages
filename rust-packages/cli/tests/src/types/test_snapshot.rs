use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Snapshot {
    pub id: String,
    pub name: String,
    pub content: String,
    pub file_path: PathBuf,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub comparison_mode: SnapshotComparison,
}

impl Snapshot {
    pub fn new(name: impl Into<String>, content: impl Into<String>, file_path: PathBuf) -> Self {
        let now = chrono::Utc::now();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name: name.into(),
            content: content.into(),
            file_path,
            created_at: now,
            updated_at: now,
            comparison_mode: SnapshotComparison::default(),
        }
    }

    pub fn with_comparison_mode(mut self, mode: SnapshotComparison) -> Self {
        self.comparison_mode = mode;
        self
    }

    pub fn update_content(&mut self, content: impl Into<String>) {
        self.content = content.into();
        self.updated_at = chrono::Utc::now();
    }

    pub fn compare(&self, actual: &str) -> SnapshotDiff {
        let matches = match &self.comparison_mode {
            SnapshotComparison::Exact => self.content == actual,
            SnapshotComparison::NormalizeWhitespace => {
                normalize_whitespace(&self.content) == normalize_whitespace(actual)
            }
            SnapshotComparison::IgnoreLineEnding => {
                self.content.replace("\r\n", "\n") == actual.replace("\r\n", "\n")
            }
            SnapshotComparison::Regex(pattern) => {
                regex::Regex::new(pattern)
                    .map(|re| re.is_match(actual))
                    .unwrap_or(false)
            }
            SnapshotComparison::Json => {
                serde_json::from_str::<serde_json::Value>(&self.content)
                    .and_then(|expected| {
                        serde_json::from_str::<serde_json::Value>(actual)
                            .map(|actual| expected == actual)
                    })
                    .unwrap_or(false)
            }
        };

        SnapshotDiff {
            snapshot_name: self.name.clone(),
            expected: self.content.clone(),
            actual: actual.to_string(),
            matches,
        }
    }
}

fn normalize_whitespace(s: &str) -> String {
    s.split_whitespace().collect::<Vec<_>>().join(" ")
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SnapshotComparison {
    Exact,
    NormalizeWhitespace,
    IgnoreLineEnding,
    Regex(String),
    Json,
}

impl Default for SnapshotComparison {
    fn default() -> Self {
        Self::Exact
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnapshotDiff {
    pub snapshot_name: String,
    pub expected: String,
    pub actual: String,
    pub matches: bool,
}

impl SnapshotDiff {
    pub fn diff(&self) -> String {
        if self.matches {
            return "Snapshots match".to_string();
        }

        let expected_lines: Vec<&str> = self.expected.lines().collect();
        let actual_lines: Vec<&str> = self.actual.lines().collect();

        let mut diff = String::new();
        diff.push_str(&format!("--- {}\n", self.snapshot_name));
        diff.push_str(&format!("+++ {}\n", self.snapshot_name));

        for (i, (exp, act)) in expected_lines.iter().zip(actual_lines.iter()).enumerate() {
            if exp != act {
                diff.push_str(&format!("@@ line {} @@\n", i + 1));
                diff.push_str(&format!("-{}\n", exp));
                diff.push_str(&format!("+{}\n", act));
            }
        }

        if expected_lines.len() != actual_lines.len() {
            diff.push_str(&format!(
                "@@ line count: expected {}, actual {} @@\n",
                expected_lines.len(),
                actual_lines.len()
            ));
        }

        diff
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnapshotStore {
    pub snapshots_dir: PathBuf,
    pub update_mode: SnapshotUpdateMode,
}

impl SnapshotStore {
    pub fn new(snapshots_dir: PathBuf) -> Self {
        Self {
            snapshots_dir,
            update_mode: SnapshotUpdateMode::default(),
        }
    }

    pub fn with_update_mode(mut self, mode: SnapshotUpdateMode) -> Self {
        self.update_mode = mode;
        self
    }

    pub fn snapshot_path(&self, name: &str) -> PathBuf {
        self.snapshots_dir.join(format!("{}.snap", name))
    }

    pub fn exists(&self, name: &str) -> bool {
        self.snapshot_path(name).exists()
    }

    pub fn load(&self, name: &str) -> Option<String> {
        std::fs::read_to_string(self.snapshot_path(name)).ok()
    }

    pub fn save(&self, name: &str, content: &str) -> std::io::Result<()> {
        if let Some(parent) = self.snapshots_dir.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::write(self.snapshot_path(name), content)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
pub enum SnapshotUpdateMode {
    #[default]
    NoUpdate,
    Update,
    UpdateNew,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_snapshot_exact_comparison() {
        let snapshot = Snapshot::new("test", "expected content", PathBuf::from("test.snap"));
        let diff = snapshot.compare("expected content");
        assert!(diff.matches);
    }

    #[test]
    fn test_snapshot_diff() {
        let snapshot = Snapshot::new("test", "line1\nline2", PathBuf::from("test.snap"));
        let diff = snapshot.compare("line1\nline3");
        assert!(!diff.matches);
        assert!(diff.diff().contains("-line2"));
        assert!(diff.diff().contains("+line3"));
    }

    #[test]
    fn test_snapshot_whitespace_normalization() {
        let snapshot = Snapshot::new("test", "hello   world", PathBuf::from("test.snap"))
            .with_comparison_mode(SnapshotComparison::NormalizeWhitespace);
        let diff = snapshot.compare("hello world");
        assert!(diff.matches);
    }
}
