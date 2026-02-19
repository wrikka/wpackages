use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::time::Duration;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Fixture {
    pub id: String,
    pub name: String,
    pub setup_script: Option<String>,
    pub teardown_script: Option<String>,
    pub files: Vec<FixtureFile>,
    pub env: std::collections::HashMap<String, String>,
    pub timeout: Duration,
    pub reuse: bool,
}

impl Fixture {
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name: name.into(),
            setup_script: None,
            teardown_script: None,
            files: Vec::new(),
            env: std::collections::HashMap::new(),
            timeout: Duration::from_secs(30),
            reuse: false,
        }
    }

    pub fn with_setup(mut self, script: impl Into<String>) -> Self {
        self.setup_script = Some(script.into());
        self
    }

    pub fn with_teardown(mut self, script: impl Into<String>) -> Self {
        self.teardown_script = Some(script.into());
        self
    }

    pub fn with_file(mut self, file: FixtureFile) -> Self {
        self.files.push(file);
        self
    }

    pub fn with_env(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.env.insert(key.into(), value.into());
        self
    }

    pub fn with_timeout(mut self, timeout: Duration) -> Self {
        self.timeout = timeout;
        self
    }

    pub fn with_reuse(mut self, reuse: bool) -> Self {
        self.reuse = reuse;
        self
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FixtureFile {
    pub source: PathBuf,
    pub destination: PathBuf,
    pub content: Option<String>,
}

impl FixtureFile {
    pub fn from_content(destination: impl Into<PathBuf>, content: impl Into<String>) -> Self {
        Self {
            source: PathBuf::new(),
            destination: destination.into(),
            content: Some(content.into()),
        }
    }

    pub fn from_file(source: PathBuf, destination: PathBuf) -> Self {
        Self {
            source,
            destination,
            content: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FixtureScope {
    pub scope_type: FixtureScopeType,
    pub name: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum FixtureScopeType {
    Test,
    Suite,
    Session,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FixtureManager {
    pub fixtures: std::collections::HashMap<String, Fixture>,
    pub active_fixtures: Vec<String>,
    pub base_dir: PathBuf,
}

impl FixtureManager {
    pub fn new(base_dir: PathBuf) -> Self {
        Self {
            fixtures: std::collections::HashMap::new(),
            active_fixtures: Vec::new(),
            base_dir,
        }
    }

    pub fn register(&mut self, fixture: Fixture) {
        self.fixtures.insert(fixture.id.clone(), fixture);
    }

    pub fn get(&self, id: &str) -> Option<&Fixture> {
        self.fixtures.get(id)
    }

    pub fn get_mut(&mut self, id: &str) -> Option<&mut Fixture> {
        self.fixtures.get_mut(id)
    }

    pub fn remove(&mut self, id: &str) -> Option<Fixture> {
        self.fixtures.remove(id)
    }

    pub fn list(&self) -> Vec<&Fixture> {
        self.fixtures.values().collect()
    }

    pub fn active_count(&self) -> usize {
        self.active_fixtures.len()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fixture_creation() {
        let fixture = Fixture::new("test_db")
            .with_setup("create_db()")
            .with_teardown("drop_db()")
            .with_env("DB_URL", "localhost:5432");

        assert_eq!(fixture.name, "test_db");
        assert!(fixture.setup_script.is_some());
    }

    #[test]
    fn test_fixture_file() {
        let file = FixtureFile::from_content("test.json", r#"{"key": "value"}"#);
        assert!(file.content.is_some());
    }
}
