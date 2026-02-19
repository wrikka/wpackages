use crate::error::{TestingError, TestingResult};
use crate::types::{JUnitResult, JUnitTestCase, JUnitTestSuite, ReportFormat, TestReport, TestRunResult};
use handlebars::Handlebars;
use serde_json::json;
use std::path::PathBuf;
use tracing::{debug, info};

pub struct ReportGenerator {
    format: ReportFormat,
    output_dir: PathBuf,
}

impl ReportGenerator {
    pub fn new(format: ReportFormat, output_dir: PathBuf) -> Self {
        Self { format, output_dir }
    }

    pub fn generate(&self, report: &TestReport) -> TestingResult<PathBuf> {
        std::fs::create_dir_all(&self.output_dir)?;

        let filename = match self.format {
            ReportFormat::Text => format!("{}.txt", report.name),
            ReportFormat::Json => format!("{}.json", report.name),
            ReportFormat::Html => format!("{}.html", report.name),
            ReportFormat::JUnit => format!("{}-junit.xml", report.name),
            ReportFormat::Tap => format!("{}.tap", report.name),
        };

        let output_path = self.output_dir.join(&filename);
        let content = self.render(report)?;

        std::fs::write(&output_path, content)?;
        info!("Generated report: {:?}", output_path);

        Ok(output_path)
    }

    fn render(&self, report: &TestReport) -> TestingResult<String> {
        match self.format {
            ReportFormat::Text => self.render_text(report),
            ReportFormat::Json => self.render_json(report),
            ReportFormat::Html => self.render_html(report),
            ReportFormat::JUnit => self.render_junit(report),
            ReportFormat::Tap => self.render_tap(report),
        }
    }

    fn render_text(&self, report: &TestReport) -> TestingResult<String> {
        let mut output = String::new();

        output.push_str(&format!("=== Test Report: {} ===\n\n", report.name));
        output.push_str(&format!("Timestamp: {}\n", report.timestamp));
        output.push_str(&format!("Duration: {:?}\n\n", report.duration));

        output.push_str("Summary:\n");
        output.push_str(&format!(
            "  Tests: {} total, {} passed, {} failed, {} skipped\n",
            report.run_result.total_tests,
            report.run_result.total_passed,
            report.run_result.total_failed,
            report.run_result.total_skipped
        ));
        output.push_str(&format!("  Success Rate: {:.1}%\n\n", report.success_rate() * 100.0));

        if let Some(ref coverage) = report.coverage {
            output.push_str(&format!(
                "Coverage: {:.1}% line, {:.1}% branch, {:.1}% function\n",
                coverage.total_line_coverage,
                coverage.total_branch_coverage,
                coverage.total_function_coverage
            ));
        }

        if !report.run_result.failed_tests().is_empty() {
            output.push_str("\nFailed Tests:\n");
            for result in report.run_result.failed_tests() {
                output.push_str(&format!(
                    "  ✗ {} ({:?})\n",
                    result.test_name, result.duration
                ));
                if let Some(ref error) = result.error_message {
                    output.push_str(&format!("    Error: {}\n", error));
                }
            }
        }

        Ok(output)
    }

    fn render_json(&self, report: &TestReport) -> TestingResult<String> {
        serde_json::to_string_pretty(report)
            .map_err(|e| TestingError::report_error(format!("JSON serialization failed: {}", e)))
    }

    fn render_html(&self, report: &TestReport) -> TestingResult<String> {
        let mut handlebars = Handlebars::new();

        let template = r#"<!DOCTYPE html>
<html>
<head>
    <title>Test Report: {{name}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; }
        .passed { color: green; }
        .failed { color: red; }
        .skipped { color: orange; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #4CAF50; color: white; }
    </style>
</head>
<body>
    <h1>Test Report: {{name}}</h1>
    <div class="summary">
        <p><strong>Timestamp:</strong> {{timestamp}}</p>
        <p><strong>Duration:</strong> {{duration}}</p>
        <p><strong>Total Tests:</strong> {{total_tests}}</p>
        <p class="passed"><strong>Passed:</strong> {{total_passed}}</p>
        <p class="failed"><strong>Failed:</strong> {{total_failed}}</p>
        <p class="skipped"><strong>Skipped:</strong> {{total_skipped}}</p>
        <p><strong>Success Rate:</strong> {{success_rate}}%</p>
    </div>
</body>
</html>"#;

        handlebars.register_template_string("report", template).unwrap();

        let data = json!({
            "name": report.name,
            "timestamp": report.timestamp.to_string(),
            "duration": format!("{:?}", report.duration),
            "total_tests": report.run_result.total_tests,
            "total_passed": report.run_result.total_passed,
            "total_failed": report.run_result.total_failed,
            "total_skipped": report.run_result.total_skipped,
            "success_rate": format!("{:.1}", report.success_rate() * 100.0)
        });

        handlebars
            .render("report", &data)
            .map_err(|e| TestingError::report_error(format!("HTML rendering failed: {}", e)))
    }

    fn render_junit(&self, report: &TestReport) -> TestingResult<String> {
        let mut output = String::new();
        output.push_str("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        output.push_str("<testsuites>\n");

        for suite in &report.run_result.suites {
            let junit_suite = JUnitTestSuite::from_test_suite(suite);
            output.push_str(&format!(
                "  <testsuite name=\"{}\" tests=\"{}\" failures=\"{}\" errors=\"{}\" skipped=\"{}\" time=\"{:.3}\">\n",
                junit_suite.name,
                junit_suite.tests,
                junit_suite.failures,
                junit_suite.errors,
                junit_suite.skipped,
                junit_suite.time
            ));

            for tc in &junit_suite.test_cases {
                output.push_str(&format!(
                    "    <testcase name=\"{}\" classname=\"{}\" time=\"{:.3}\">\n",
                    tc.name, tc.classname, tc.time
                ));

                match &tc.result {
                    JUnitResult::Passed => {}
                    JUnitResult::Failed { message } => {
                        output.push_str(&format!("      <failure message=\"{}\"/>\n", escape_xml(message)));
                    }
                    JUnitResult::Error { message } => {
                        output.push_str(&format!("      <error message=\"{}\"/>\n", escape_xml(message)));
                    }
                    JUnitResult::Skipped { message } => {
                        output.push_str(&format!("      <skipped message=\"{}\"/>\n", escape_xml(message)));
                    }
                }

                output.push_str("    </testcase>\n");
            }

            output.push_str("  </testsuite>\n");
        }

        output.push_str("</testsuites>\n");
        Ok(output)
    }

    fn render_tap(&self, report: &TestReport) -> TestingResult<String> {
        let mut output = String::new();
        output.push_str(&format!("1..{}\n", report.run_result.total_tests));

        let mut test_num = 1;
        for suite in &report.run_result.suites {
            for result in &suite.results {
                let status = if result.is_success() { "ok" } else { "not ok" };
                output.push_str(&format!("{} {} - {}\n", status, test_num, result.test_name));
                test_num += 1;
            }
        }

        Ok(output)
    }
}

fn escape_xml(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}

impl JUnitTestSuite {
    fn from_test_suite(suite: &crate::types::TestSuiteResult) -> Self {
        let test_cases: Vec<JUnitTestCase> = suite
            .results
            .iter()
            .map(|r| JUnitTestCase {
                name: r.test_name.clone(),
                classname: suite.suite_name.clone(),
                time: r.duration.as_secs_f64(),
                result: match r.result {
                    crate::types::TestResult::Passed => JUnitResult::Passed,
                    crate::types::TestResult::Failed => JUnitResult::Failed {
                        message: r.error_message.clone().unwrap_or_default(),
                    },
                    crate::types::TestResult::Error => JUnitResult::Error {
                        message: r.error_message.clone().unwrap_or_default(),
                    },
                    crate::types::TestResult::Skipped => JUnitResult::Skipped {
                        message: r.error_message.clone().unwrap_or_default(),
                    },
                    crate::types::TestResult::TimedOut => JUnitResult::Error {
                        message: "Test timed out".to_string(),
                    },
                },
            })
            .collect();

        Self {
            name: suite.suite_name.clone(),
            tests: suite.total_tests(),
            failures: suite.failed,
            errors: suite.errors,
            skipped: suite.skipped,
            time: suite.total_duration.as_secs_f64(),
            test_cases,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{TestExecutionResult, TestSuiteResult};
    use std::path::PathBuf;
    use std::time::Duration;
    use tempfile::TempDir;

    fn create_test_report() -> TestReport {
        let mut run_result = TestRunResult::new();
        let mut suite = TestSuiteResult::new("suite1", "Test Suite");

        let test = crate::types::TestCase::new("t1", "test_one", PathBuf::from("test.rs"), 1);
        suite.add_result(TestExecutionResult::passed(&test, Duration::from_millis(100)));

        run_result.add_suite_result(suite);
        TestReport::new("Test Run", run_result)
    }

    #[test]
    fn test_text_report() {
        let temp_dir = TempDir::new().unwrap();
        let generator = ReportGenerator::new(ReportFormat::Text, temp_dir.path().to_path_buf());

        let report = create_test_report();
        let path = generator.generate(&report).unwrap();

        assert!(path.exists());
        let content = std::fs::read_to_string(path).unwrap();
        assert!(content.contains("Test Report"));
    }

    #[test]
    fn test_json_report() {
        let temp_dir = TempDir::new().unwrap();
        let generator = ReportGenerator::new(ReportFormat::Json, temp_dir.path().to_path_buf());

        let report = create_test_report();
        let path = generator.generate(&report).unwrap();

        assert!(path.exists());
    }

    #[test]
    fn test_junit_report() {
        let temp_dir = TempDir::new().unwrap();
        let generator = ReportGenerator::new(ReportFormat::JUnit, temp_dir.path().to_path_buf());

        let report = create_test_report();
        let path = generator.generate(&report).unwrap();

        assert!(path.exists());
        let content = std::fs::read_to_string(path).unwrap();
        assert!(content.contains("<?xml"));
    }
}
