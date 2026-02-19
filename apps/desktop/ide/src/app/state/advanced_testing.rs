use crate::types::advanced_testing::{AdvancedTestingClient, TestConfiguration, TestReport};

#[derive(Debug, Clone, Default)]
pub struct AdvancedTestingState {
    pub client: AdvancedTestingClient,
    pub config: TestConfiguration,
    pub last_report: Option<TestReport>,
    pub running: bool,
}

impl AdvancedTestingState {
    pub fn new() -> Self {
        Self {
            client: AdvancedTestingClient::new(),
            config: TestConfiguration::new(),
            last_report: None,
            running: false,
        }
    }

    pub fn with_client(mut self, client: AdvancedTestingClient) -> Self {
        self.client = client;
        self
    }

    pub fn with_config(mut self, config: TestConfiguration) -> Self {
        self.config = config;
        self
    }

    pub fn with_last_report(mut self, report: TestReport) -> Self {
        self.last_report = Some(report);
        self
    }

    pub fn with_running(mut self, running: bool) -> Self {
        self.running = running;
        self
    }

    pub fn set_config(&mut self, config: TestConfiguration) {
        self.config = config;
    }

    pub fn set_last_report(&mut self, report: TestReport) {
        self.last_report = Some(report);
    }

    pub fn set_running(&mut self, running: bool) {
        self.running = running;
    }

    pub fn is_running(&self) -> bool {
        self.running
    }

    pub fn get_success_rate(&self) -> f64 {
        if let Some(report) = &self.last_report {
            report.success_rate()
        } else {
            0.0
        }
    }

    pub fn get_coverage(&self) -> f64 {
        if let Some(report) = &self.last_report {
            report.overall_coverage()
        } else {
            0.0
        }
    }
}
