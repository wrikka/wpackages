use crate::error::{TestingError, TestingResult};
use crate::types::{Fixture, FixtureFile, FixtureScope, FixtureScopeType};
use std::collections::HashMap;
use std::path::PathBuf;
use std::time::Duration;
use tracing::{debug, info, warn};

pub struct FixtureManager {
    fixtures: HashMap<String, Fixture>,
    active_fixtures: HashMap<String, ActiveFixture>,
    base_dir: PathBuf,
    scope_stack: Vec<FixtureScope>,
}

struct ActiveFixture {
    fixture: Fixture,
    work_dir: PathBuf,
    created_at: std::time::Instant,
}

impl FixtureManager {
    pub fn new(base_dir: PathBuf) -> Self {
        Self {
            fixtures: HashMap::new(),
            active_fixtures: HashMap::new(),
            base_dir,
            scope_stack: Vec::new(),
        }
    }

    pub fn register(&mut self, fixture: Fixture) {
        self.fixtures.insert(fixture.id.clone(), fixture);
    }

    pub fn unregister(&mut self, id: &str) {
        self.fixtures.remove(id);
    }

    pub fn get(&self, id: &str) -> Option<&Fixture> {
        self.fixtures.get(id)
    }

    pub fn list(&self) -> Vec<&Fixture> {
        self.fixtures.values().collect()
    }

    pub fn setup(&mut self, fixture_id: &str) -> TestingResult<PathBuf> {
        let fixture = self
            .fixtures
            .get(fixture_id)
            .ok_or_else(|| TestingError::fixture_error(format!("Fixture not found: {}", fixture_id)))?
            .clone();

        let work_dir = self.create_work_dir(&fixture)?;
        self.create_files(&fixture, &work_dir)?;

        if let Some(ref script) = fixture.setup_script {
            self.run_setup_script(script, &work_dir)?;
        }

        for (key, value) in &fixture.env {
            std::env::set_var(key, value);
        }

        let active = ActiveFixture {
            fixture: fixture.clone(),
            work_dir: work_dir.clone(),
            created_at: std::time::Instant::now(),
        };

        self.active_fixtures.insert(fixture_id.to_string(), active);
        info!("Setup fixture: {} at {:?}", fixture.name, work_dir);

        Ok(work_dir)
    }

    pub fn teardown(&mut self, fixture_id: &str) -> TestingResult<()> {
        let active = self
            .active_fixtures
            .remove(fixture_id)
            .ok_or_else(|| TestingError::fixture_error(format!("Active fixture not found: {}", fixture_id)))?;

        if let Some(ref script) = active.fixture.teardown_script {
            self.run_teardown_script(script, &active.work_dir)?;
        }

        for key in active.fixture.env.keys() {
            std::env::remove_var(key);
        }

        if !active.fixture.reuse {
            self.cleanup_work_dir(&active.work_dir)?;
        }

        info!("Teardown fixture: {}", active.fixture.name);
        Ok(())
    }

    pub fn teardown_all(&mut self) -> TestingResult<()> {
        let fixture_ids: Vec<String> = self.active_fixtures.keys().cloned().collect();

        for id in fixture_ids {
            if let Err(e) = self.teardown(&id) {
                warn!("Failed to teardown fixture {}: {}", id, e);
            }
        }

        Ok(())
    }

    fn create_work_dir(&self, fixture: &Fixture) -> TestingResult<PathBuf> {
        let work_dir = self.base_dir
            .join("fixtures")
            .join(&fixture.id);

        std::fs::create_dir_all(&work_dir)?;
        Ok(work_dir)
    }

    fn create_files(&self, fixture: &Fixture, work_dir: &PathBuf) -> TestingResult<()> {
        for file in &fixture.files {
            let dest_path = work_dir.join(&file.destination);

            if let Some(ref content) = file.content {
                if let Some(parent) = dest_path.parent() {
                    std::fs::create_dir_all(parent)?;
                }
                std::fs::write(&dest_path, content)?;
            } else if !file.source.as_os_str().is_empty() {
                std::fs::copy(&file.source, &dest_path)?;
            }
        }

        debug!("Created {} files for fixture {}", fixture.files.len(), fixture.name);
        Ok(())
    }

    fn run_setup_script(&self, script: &str, work_dir: &PathBuf) -> TestingResult<()> {
        debug!("Running setup script in {:?}", work_dir);

        let output = std::process::Command::new("sh")
            .arg("-c")
            .arg(script)
            .current_dir(work_dir)
            .output()
            .map_err(|e| TestingError::fixture_error(format!("Setup script failed: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(TestingError::fixture_error(format!("Setup script failed: {}", stderr)));
        }

        Ok(())
    }

    fn run_teardown_script(&self, script: &str, work_dir: &PathBuf) -> TestingResult<()> {
        debug!("Running teardown script in {:?}", work_dir);

        let output = std::process::Command::new("sh")
            .arg("-c")
            .arg(script)
            .current_dir(work_dir)
            .output()
            .map_err(|e| TestingError::fixture_error(format!("Teardown script failed: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            warn!("Teardown script warning: {}", stderr);
        }

        Ok(())
    }

    fn cleanup_work_dir(&self, work_dir: &PathBuf) -> TestingResult<()> {
        if work_dir.exists() {
            std::fs::remove_dir_all(work_dir)?;
        }
        Ok(())
    }

    pub fn push_scope(&mut self, scope: FixtureScope) {
        self.scope_stack.push(scope);
    }

    pub fn pop_scope(&mut self) -> Option<FixtureScope> {
        self.scope_stack.pop()
    }

    pub fn current_scope(&self) -> Option<&FixtureScope> {
        self.scope_stack.last()
    }

    pub fn active_count(&self) -> usize {
        self.active_fixtures.len()
    }
}

#[derive(Debug, Clone)]
pub struct FixtureBuilder {
    fixture: Fixture,
}

impl FixtureBuilder {
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            fixture: Fixture::new(name),
        }
    }

    pub fn with_setup(mut self, script: impl Into<String>) -> Self {
        self.fixture.setup_script = Some(script.into());
        self
    }

    pub fn with_teardown(mut self, script: impl Into<String>) -> Self {
        self.fixture.teardown_script = Some(script.into());
        self
    }

    pub fn with_file(mut self, file: FixtureFile) -> Self {
        self.fixture.files.push(file);
        self
    }

    pub fn with_env(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.fixture.env.insert(key.into(), value.into());
        self
    }

    pub fn with_timeout(mut self, timeout: Duration) -> Self {
        self.fixture.timeout = timeout;
        self
    }

    pub fn reusable(mut self) -> Self {
        self.fixture.reuse = true;
        self
    }

    pub fn build(self) -> Fixture {
        self.fixture
    }
}

pub fn fixture(name: impl Into<String>) -> FixtureBuilder {
    FixtureBuilder::new(name)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fixture_builder() {
        let fixture = fixture("test_db")
            .with_setup("create_db()")
            .with_teardown("drop_db()")
            .with_env("DB_URL", "localhost:5432")
            .build();

        assert_eq!(fixture.name, "test_db");
        assert!(fixture.setup_script.is_some());
        assert_eq!(fixture.env.get("DB_URL"), Some(&"localhost:5432".to_string()));
    }

    #[test]
    fn test_fixture_manager() {
        let temp_dir = tempfile::tempdir().unwrap();
        let mut manager = FixtureManager::new(temp_dir.path().to_path_buf());

        let fixture = fixture("test")
            .with_file(FixtureFile::from_content("test.txt", "hello"))
            .build();

        manager.register(fixture);
        assert_eq!(manager.list().len(), 1);
    }

    #[test]
    fn test_fixture_file() {
        let file = FixtureFile::from_content("config.json", r#"{"key": "value"}"#);
        assert!(file.content.is_some());
        assert_eq!(file.destination, PathBuf::from("config.json"));
    }
}
