use crate::error::{TestingError, TestingResult};
use crate::types::{FilterCondition, FilterDsl, FilterExpression, FilterOperator, TestCase};
use regex::Regex;
use std::collections::HashSet;

pub struct TestFilter {
    expression: Option<FilterExpression>,
    include_patterns: Vec<String>,
    exclude_patterns: Vec<String>,
    tags: HashSet<String>,
    exclude_tags: HashSet<String>,
}

impl TestFilter {
    pub fn new() -> Self {
        Self {
            expression: None,
            include_patterns: Vec::new(),
            exclude_patterns: Vec::new(),
            tags: HashSet::new(),
            exclude_tags: HashSet::new(),
        }
    }

    pub fn from_dsl(dsl: &FilterDsl) -> TestingResult<Self> {
        Ok(Self {
            expression: dsl.expression().cloned(),
            include_patterns: Vec::new(),
            exclude_patterns: Vec::new(),
            tags: HashSet::new(),
            exclude_tags: HashSet::new(),
        })
    }

    pub fn parse(query: &str) -> TestingResult<Self> {
        let dsl = FilterDsl::parse(query)
            .map_err(|e| TestingError::filter_parse_error(e.to_string()))?;
        Self::from_dsl(&dsl)
    }

    pub fn include_pattern(mut self, pattern: &str) -> Self {
        self.include_patterns.push(pattern.to_string());
        self
    }

    pub fn exclude_pattern(mut self, pattern: &str) -> Self {
        self.exclude_patterns.push(pattern.to_string());
        self
    }

    pub fn tag(mut self, tag: &str) -> Self {
        self.tags.insert(tag.to_string());
        self
    }

    pub fn exclude_tag(mut self, tag: &str) -> Self {
        self.exclude_tags.insert(tag.to_string());
        self
    }

    pub fn matches(&self, test: &TestCase) -> bool {
        if !self.matches_tags(test) {
            return false;
        }

        if !self.matches_patterns(test) {
            return false;
        }

        if let Some(ref expr) = self.expression {
            return self.matches_expression(test, expr);
        }

        true
    }

    fn matches_tags(&self, test: &TestCase) -> bool {
        if !self.tags.is_empty() {
            let has_any_tag = self.tags.iter().any(|t| test.has_tag(t));
            if !has_any_tag {
                return false;
            }
        }

        if !self.exclude_tags.is_empty() {
            let has_excluded = self.exclude_tags.iter().any(|t| test.has_tag(t));
            if has_excluded {
                return false;
            }
        }

        true
    }

    fn matches_patterns(&self, test: &TestCase) -> bool {
        if !self.include_patterns.is_empty() {
            let matches_any = self.include_patterns.iter().any(|p| {
                pattern_matches(p, &test.name) || pattern_matches(p, test.id.as_str())
            });
            if !matches_any {
                return false;
            }
        }

        if !self.exclude_patterns.is_empty() {
            let matches_any = self.exclude_patterns.iter().any(|p| {
                pattern_matches(p, &test.name) || pattern_matches(p, test.id.as_str())
            });
            if matches_any {
                return false;
            }
        }

        true
    }

    fn matches_expression(&self, test: &TestCase, expr: &FilterExpression) -> bool {
        let condition_results: Vec<bool> = expr
            .conditions
            .iter()
            .map(|c| self.matches_condition(test, c))
            .collect();

        let sub_results: Vec<bool> = expr
            .sub_expressions
            .iter()
            .map(|e| self.matches_expression(test, e))
            .collect();

        let all_results: Vec<bool> = condition_results.into_iter().chain(sub_results).collect();

        match expr.operator {
            FilterOperator::And => all_results.iter().all(|&r| r),
            FilterOperator::Or => all_results.iter().any(|&r| r),
            FilterOperator::Not => !all_results.iter().all(|&r| r),
        }
    }

    fn matches_condition(&self, test: &TestCase, condition: &FilterCondition) -> bool {
        let result = match condition {
            FilterCondition::Tag { tag, .. } => test.has_tag(tag),
            FilterCondition::Priority { min_priority, .. } => {
                let min = parse_priority(min_priority);
                test.priority >= min
            }
            FilterCondition::Name { pattern, .. } => {
                pattern_matches(pattern, &test.name) || pattern_matches(pattern, test.id.as_str())
            }
            FilterCondition::File { pattern, .. } => {
                pattern_matches(pattern, &test.file_path.to_string_lossy())
            }
            FilterCondition::Slow { .. } => test.is_slow(),
            FilterCondition::Flaky { .. } => test.is_flaky(),
            FilterCondition::Skipped { .. } => test.is_skipped(),
        };

        match condition {
            FilterCondition::Tag { negate: true, .. } => !result,
            FilterCondition::Priority { negate: true, .. } => !result,
            FilterCondition::Name { negate: true, .. } => !result,
            FilterCondition::File { negate: true, .. } => !result,
            FilterCondition::Slow { negate: true } => !result,
            FilterCondition::Flaky { negate: true } => !result,
            FilterCondition::Skipped { negate: true } => !result,
            _ => result,
        }
    }

    pub fn filter<'a>(&self, tests: &'a [TestCase]) -> Vec<&'a TestCase> {
        tests.iter().filter(|t| self.matches(t)).collect()
    }

    pub fn filter_owned(&self, tests: Vec<TestCase>) -> Vec<TestCase> {
        tests.into_iter().filter(|t| self.matches(t)).collect()
    }
}

impl Default for TestFilter {
    fn default() -> Self {
        Self::new()
    }
}

fn parse_priority(s: &str) -> crate::types::TestPriority {
    match s.to_lowercase().as_str() {
        "low" => crate::types::TestPriority::Low,
        "high" => crate::types::TestPriority::High,
        "critical" => crate::types::TestPriority::Critical,
        _ => crate::types::TestPriority::Normal,
    }
}

fn pattern_matches(pattern: &str, text: &str) -> bool {
    if pattern.contains('*') || pattern.contains('?') {
        let glob_pattern = pattern.replace('*', ".*").replace('?', ".");
        if let Ok(re) = Regex::new(&format!("^{}$", glob_pattern)) {
            return re.is_match(text);
        }
    }

    if let Ok(re) = Regex::new(pattern) {
        return re.is_match(text);
    }

    text.contains(pattern)
}

pub fn filter() -> TestFilter {
    TestFilter::new()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn create_test(id: &str, name: &str, tags: Vec<&str>) -> TestCase {
        let mut tc = TestCase::new(id, name, PathBuf::from("test.rs"), 1);
        for tag in tags {
            tc = tc.with_tag(tag);
        }
        tc
    }

    #[test]
    fn test_filter_tags() {
        let filter = TestFilter::new().tag("unit");

        let tests = vec![
            create_test("t1", "test1", vec!["unit"]),
            create_test("t2", "test2", vec!["integration"]),
        ];

        let filtered = filter.filter(&tests);
        assert_eq!(filtered.len(), 1);
        assert_eq!(filtered[0].id.as_str(), "t1");
    }

    #[test]
    fn test_filter_pattern() {
        let filter = TestFilter::new().include_pattern("add*");

        let tests = vec![
            create_test("t1", "test_add", vec![]),
            create_test("t2", "test_subtract", vec![]),
        ];

        let filtered = filter.filter(&tests);
        assert_eq!(filtered.len(), 1);
    }

    #[test]
    fn test_filter_exclude() {
        let filter = TestFilter::new().exclude_tag("slow");

        let tests = vec![
            create_test("t1", "test1", vec!["fast"]),
            create_test("t2", "test2", vec!["slow"]),
        ];

        let filtered = filter.filter(&tests);
        assert_eq!(filtered.len(), 1);
    }

    #[test]
    fn test_filter_dsl() {
        let filter = TestFilter::parse("@unit && @fast").unwrap();

        let tests = vec![
            create_test("t1", "test1", vec!["unit", "fast"]),
            create_test("t2", "test2", vec!["unit", "slow"]),
        ];

        let filtered = filter.filter(&tests);
        assert_eq!(filtered.len(), 1);
    }
}
