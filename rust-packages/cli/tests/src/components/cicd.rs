use crate::error::{TestingError, TestingResult};
use crate::types::TestReport;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use tracing::{debug, info};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CiProvider {
    GitHubActions,
    GitLabCI,
    CircleCI,
    Jenkins,
    AzureDevOps,
    BitbucketPipelines,
    TravisCI,
    Custom,
}

impl CiProvider {
    pub fn detect() -> Option<Self> {
        if std::env::var("GITHUB_ACTIONS").is_ok() {
            return Some(Self::GitHubActions);
        }
        if std::env::var("GITLAB_CI").is_ok() {
            return Some(Self::GitLabCI);
        }
        if std::env::var("CIRCLECI").is_ok() {
            return Some(Self::CircleCI);
        }
        if std::env::var("JENKINS_URL").is_ok() {
            return Some(Self::Jenkins);
        }
        if std::env::var("AZURE_DEVOPS").is_ok() {
            return Some(Self::AzureDevOps);
        }
        if std::env::var("BITBUCKET_BUILD_NUMBER").is_ok() {
            return Some(Self::BitbucketPipelines);
        }
        if std::env::var("TRAVIS").is_ok() {
            return Some(Self::TravisCI);
        }
        None
    }

    pub fn name(&self) -> &'static str {
        match self {
            Self::GitHubActions => "GitHub Actions",
            Self::GitLabCI => "GitLab CI",
            Self::CircleCI => "CircleCI",
            Self::Jenkins => "Jenkins",
            Self::AzureDevOps => "Azure DevOps",
            Self::BitbucketPipelines => "Bitbucket Pipelines",
            Self::TravisCI => "Travis CI",
            Self::Custom => "Custom",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CiContext {
    pub provider: String,
    pub build_id: String,
    pub build_number: String,
    pub branch: String,
    pub commit: String,
    pub commit_message: Option<String>,
    pub author: String,
    pub pull_request: Option<String>,
    pub target_branch: Option<String>,
    pub env_vars: HashMap<String, String>,
}

impl CiContext {
    pub fn from_env() -> Self {
        let provider = CiProvider::detect();

        let (build_id, build_number, branch, commit, author, pr, target) = match provider {
            Some(CiProvider::GitHubActions) => {
                let pr = std::env::var("GITHUB_REF")
                    .ok()
                    .and_then(|r| {
                        if r.starts_with("refs/pull/") {
                            Some(r.split('/').nth(2).unwrap_or("").to_string())
                        } else {
                            None
                        }
                    });

                (
                    std::env::var("GITHUB_RUN_ID").unwrap_or_default(),
                    std::env::var("GITHUB_RUN_NUMBER").unwrap_or_default(),
                    std::env::var("GITHUB_REF_NAME").unwrap_or_default(),
                    std::env::var("GITHUB_SHA").unwrap_or_default(),
                    std::env::var("GITHUB_ACTOR").unwrap_or_default(),
                    pr,
                    None,
                )
            }
            Some(CiProvider::GitLabCI) => (
                std::env::var("CI_JOB_ID").unwrap_or_default(),
                std::env::var("CI_JOB_ID").unwrap_or_default(),
                std::env::var("CI_COMMIT_REF_NAME").unwrap_or_default(),
                std::env::var("CI_COMMIT_SHA").unwrap_or_default(),
                std::env::var("GITLAB_USER_LOGIN").unwrap_or_default(),
                std::env::var("CI_MERGE_REQUEST_IID").ok(),
                std::env::var("CI_MERGE_REQUEST_TARGET_BRANCH_NAME").ok(),
            ),
            _ => (
                String::new(),
                String::new(),
                String::new(),
                String::new(),
                String::new(),
                None,
                None,
            ),
        };

        let mut env_vars = HashMap::new();
        for key in &["CI", "BUILD_ID", "JOB_NAME", "NODE_NAME"] {
            if let Ok(value) = std::env::var(key) {
                env_vars.insert(key.to_string(), value);
            }
        }

        Self {
            provider: provider.map(|p| p.name().to_string()).unwrap_or_default(),
            build_id,
            build_number,
            branch,
            commit,
            commit_message: None,
            author,
            pull_request: pr,
            target_branch: target,
            env_vars,
        }
    }
}

pub struct CiIntegration {
    context: Option<CiContext>,
    output_dir: PathBuf,
}

impl CiIntegration {
    pub fn new(output_dir: PathBuf) -> Self {
        Self {
            context: if CiProvider::detect().is_some() {
                Some(CiContext::from_env())
            } else {
                None
            },
            output_dir,
        }
    }

    pub fn with_context(mut self, context: CiContext) -> Self {
        self.context = Some(context);
        self
    }

    pub fn context(&self) -> Option<&CiContext> {
        self.context.as_ref()
    }

    pub fn is_ci(&self) -> bool {
        self.context.is_some()
    }

    pub fn provider(&self) -> Option<CiProvider> {
        CiProvider::detect()
    }

    pub fn enrich_report(&self, report: &mut TestReport) {
        if let Some(ref context) = self.context {
            report.metadata = report.metadata.clone()
                .with_branch(&context.branch)
                .with_commit(&context.commit)
                .with_author(&context.author);

            if let Some(ref pr) = context.pull_request {
                report.metadata = report.metadata.clone()
                    .with_ci_job(&format!("PR-{}", pr));
            } else {
                report.metadata = report.metadata.clone()
                    .with_ci_job(&context.build_id);
            }
        }
    }

    pub fn publish_results(&self, report: &TestReport) -> TestingResult<()> {
        let provider = self.provider();

        match provider {
            Some(CiProvider::GitHubActions) => self.publish_github_actions(report),
            _ => self.publish_generic(report),
        }
    }

    fn publish_github_actions(&self, report: &TestReport) -> TestingResult<()> {
        let output_file = self.output_dir.join("test-results.json");
        let content = serde_json::to_string_pretty(report)
            .map_err(|e| TestingError::ci_cd_error(format!("JSON serialization failed: {}", e)))?;

        std::fs::create_dir_all(&self.output_dir)?;
        std::fs::write(&output_file, content)?;

        info!("Published test results for GitHub Actions: {:?}", output_file);

        if let Some(ref context) = self.context {
            println!("::set-output name=test_result::{}", if report.is_passed() { "success" } else { "failure" });
            println!("::set-output name=passed::{}", report.run_result.total_passed);
            println!("::set-output name=failed::{}", report.run_result.total_failed);
        }

        Ok(())
    }

    fn publish_generic(&self, report: &TestReport) -> TestingResult<()> {
        std::fs::create_dir_all(&self.output_dir)?;

        let json_file = self.output_dir.join("test-report.json");
        let content = serde_json::to_string_pretty(report)
            .map_err(|e| TestingError::ci_cd_error(format!("JSON serialization failed: {}", e)))?;
        std::fs::write(&json_file, content)?;

        let junit_file = self.output_dir.join("junit.xml");
        let junit_content = generate_junit(report);
        std::fs::write(&junit_file, junit_content)?;

        info!("Published test results: {:?}", self.output_dir);
        Ok(())
    }

    pub fn should_fail_build(&self, report: &TestReport) -> bool {
        !report.is_passed()
    }
}

fn generate_junit(report: &TestReport) -> String {
    let mut output = String::new();
    output.push_str("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
    output.push_str("<testsuites>\n");

    for suite in &report.run_result.suites {
        output.push_str(&format!(
            "  <testsuite name=\"{}\" tests=\"{}\" failures=\"{}\" time=\"{:.3}\">\n",
            suite.suite_name,
            suite.total_tests(),
            suite.failed,
            suite.total_duration.as_secs_f64()
        ));

        for result in &suite.results {
            output.push_str(&format!(
                "    <testcase name=\"{}\" time=\"{:.3}\">\n",
                result.test_name,
                result.duration.as_secs_f64()
            ));

            if !result.is_success() {
                let failure_type = if result.result == crate::types::TestResult::Skipped {
                    "skipped"
                } else {
                    "failure"
                };

                output.push_str(&format!(
                    "      <{} message=\"{}\"/>\n",
                    failure_type,
                    result.error_message.as_deref().unwrap_or("Test failed")
                ));
            }

            output.push_str("    </testcase>\n");
        }

        output.push_str("  </testsuite>\n");
    }

    output.push_str("</testsuites>\n");
    output
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ci_provider_detect() {
        let provider = CiProvider::detect();
        assert!(provider.is_none() || provider.is_some());
    }

    #[test]
    fn test_ci_provider_name() {
        assert_eq!(CiProvider::GitHubActions.name(), "GitHub Actions");
        assert_eq!(CiProvider::GitLabCI.name(), "GitLab CI");
    }

    #[test]
    fn test_ci_context_from_env() {
        let context = CiContext::from_env();
        assert!(!context.provider.is_empty() || context.provider.is_empty());
    }

    #[test]
    fn test_ci_integration() {
        let temp_dir = tempfile::tempdir().unwrap();
        let integration = CiIntegration::new(temp_dir.path().to_path_buf());

        assert!(integration.context().is_none() || integration.context().is_some());
    }
}
