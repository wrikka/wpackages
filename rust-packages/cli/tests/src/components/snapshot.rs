use crate::error::{TestingError, TestingResult};
use crate::types::{Snapshot, SnapshotComparison, SnapshotDiff, SnapshotStore, SnapshotUpdateMode};
use std::path::PathBuf;
use tracing::{debug, info};

pub struct SnapshotTester {
    store: SnapshotStore,
    update_mode: SnapshotUpdateMode,
}

impl SnapshotTester {
    pub fn new(snapshots_dir: PathBuf) -> Self {
        Self {
            store: SnapshotStore::new(snapshots_dir),
            update_mode: SnapshotUpdateMode::default(),
        }
    }

    pub fn with_update_mode(mut self, mode: SnapshotUpdateMode) -> Self {
        self.update_mode = mode;
        self.store.update_mode = mode;
        self
    }

    pub fn assert(&self, name: &str, content: &str) -> TestingResult<()> {
        self.assert_with_comparison(name, content, SnapshotComparison::Exact)
    }

    pub fn assert_with_comparison(
        &self,
        name: &str,
        content: &str,
        comparison: SnapshotComparison,
    ) -> TestingResult<()> {
        if let Some(stored) = self.store.load(name) {
            let snapshot = Snapshot::new(name, &stored, self.store.snapshot_path(name))
                .with_comparison_mode(comparison);

            let diff = snapshot.compare(content);

            if diff.matches {
                debug!("Snapshot '{}' matched", name);
                return Ok(());
            }

            match self.update_mode {
                SnapshotUpdateMode::Update => {
                    self.store.save(name, content)?;
                    info!("Updated snapshot '{}'", name);
                    return Ok(());
                }
                SnapshotUpdateMode::UpdateNew => {
                    debug!("Snapshot '{}' mismatched, but not updating", name);
                }
                SnapshotUpdateMode::NoUpdate => {}
            }

            return Err(TestingError::snapshot_mismatch(name, &diff.expected, &diff.actual));
        }

        match self.update_mode {
            SnapshotUpdateMode::Update | SnapshotUpdateMode::UpdateNew => {
                self.store.save(name, content)?;
                info!("Created new snapshot '{}'", name);
                Ok(())
            }
            SnapshotUpdateMode::NoUpdate => {
                Err(TestingError::snapshot_mismatch(name, "", content))
            }
        }
    }

    pub fn assert_json(&self, name: &str, value: &serde_json::Value) -> TestingResult<()> {
        let content = serde_json::to_string_pretty(value)?;
        self.assert_with_comparison(name, &content, SnapshotComparison::Json)
    }

    pub fn assert_matches(&self, name: &str, content: &str, pattern: &str) -> TestingResult<()> {
        self.assert_with_comparison(name, content, SnapshotComparison::Regex(pattern.to_string()))
    }

    pub fn update(&self, name: &str, content: &str) -> TestingResult<()> {
        Ok(self.store.save(name, content)?)
    }

    pub fn exists(&self, name: &str) -> bool {
        self.store.exists(name)
    }

    pub fn remove(&self, name: &str) -> TestingResult<()> {
        let path = self.store.snapshot_path(name);
        if path.exists() {
            std::fs::remove_file(path)?;
            info!("Removed snapshot '{}'", name);
        }
        Ok(())
    }

    pub fn list(&self) -> Vec<String> {
        if !self.store.snapshots_dir.exists() {
            return Vec::new();
        }

        std::fs::read_dir(&self.store.snapshots_dir)
            .map(|entries| {
                entries
                    .filter_map(|e| e.ok())
                    .filter(|e| e.path().extension().map(|ext| ext == "snap").unwrap_or(false))
                    .filter_map(|e| e.path().file_stem().map(|s| s.to_string_lossy().to_string()))
                    .collect()
            })
            .unwrap_or_default()
    }

    pub fn clean_obsolete(&self, current_names: &[&str]) -> TestingResult<Vec<String>> {
        let existing = self.list();
        let current_set: std::collections::HashSet<&str> = current_names.iter().copied().collect();

        let mut removed = Vec::new();
        for name in existing {
            if !current_set.contains(name.as_str()) {
                self.remove(&name)?;
                removed.push(name);
            }
        }

        Ok(removed)
    }
}

pub fn snapshot(name: &str, content: &str) -> SnapshotBuilder {
    SnapshotBuilder::new(name, content)
}

pub struct SnapshotBuilder {
    name: String,
    content: String,
    comparison: SnapshotComparison,
}

impl SnapshotBuilder {
    pub fn new(name: impl Into<String>, content: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            content: content.into(),
            comparison: SnapshotComparison::Exact,
        }
    }

    pub fn normalize_whitespace(mut self) -> Self {
        self.comparison = SnapshotComparison::NormalizeWhitespace;
        self
    }

    pub fn ignore_line_endings(mut self) -> Self {
        self.comparison = SnapshotComparison::IgnoreLineEnding;
        self
    }

    pub fn json(mut self) -> Self {
        self.comparison = SnapshotComparison::Json;
        self
    }

    pub fn regex(mut self, pattern: impl Into<String>) -> Self {
        self.comparison = SnapshotComparison::Regex(pattern.into());
        self
    }

    pub fn compare(&self, tester: &SnapshotTester) -> TestingResult<()> {
        tester.assert_with_comparison(&self.name, &self.content, self.comparison.clone())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_snapshot_create() {
        let temp_dir = TempDir::new().unwrap();
        let tester = SnapshotTester::new(temp_dir.path().join("snapshots"))
            .with_update_mode(SnapshotUpdateMode::UpdateNew);

        tester.assert("test1", "hello world").unwrap();
        assert!(tester.exists("test1"));
    }

    #[test]
    fn test_snapshot_match() {
        let temp_dir = TempDir::new().unwrap();
        let tester = SnapshotTester::new(temp_dir.path().join("snapshots"))
            .with_update_mode(SnapshotUpdateMode::UpdateNew);

        tester.assert("test2", "content").unwrap();
        tester.assert("test2", "content").unwrap();
    }

    #[test]
    fn test_snapshot_mismatch() {
        let temp_dir = TempDir::new().unwrap();
        let tester = SnapshotTester::new(temp_dir.path().join("snapshots"))
            .with_update_mode(SnapshotUpdateMode::NoUpdate);

        tester.assert("test3", "original").unwrap();
        let result = tester.assert("test3", "changed");

        assert!(result.is_err());
    }

    #[test]
    fn test_snapshot_json() {
        let temp_dir = TempDir::new().unwrap();
        let tester = SnapshotTester::new(temp_dir.path().join("snapshots"))
            .with_update_mode(SnapshotUpdateMode::UpdateNew);

        let json = serde_json::json!({"key": "value"});
        tester.assert_json("test_json", &json).unwrap();
    }
}
