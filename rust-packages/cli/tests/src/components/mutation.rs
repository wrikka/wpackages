use crate::error::{TestingError, TestingResult};
use std::path::PathBuf;
use std::process::Command;
use tracing::{debug, info, warn};

#[derive(Debug, Clone)]
pub struct MutationConfig {
    pub operators: Vec<MutationOperator>,
    pub exclude_patterns: Vec<String>,
    pub timeout_seconds: u64,
    pub max_mutations: usize,
}

impl Default for MutationConfig {
    fn default() -> Self {
        Self {
            operators: vec![
                MutationOperator::ArithmeticReplace,
                MutationOperator::BooleanReplace,
                MutationOperator::ConditionalReplace,
                MutationOperator::StatementDelete,
            ],
            exclude_patterns: vec!["target/**".to_string(), "tests/**".to_string()],
            timeout_seconds: 30,
            max_mutations: 100,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MutationOperator {
    ArithmeticReplace,
    BooleanReplace,
    ConditionalReplace,
    StatementDelete,
    RelationalReplace,
    LogicalReplace,
    UnaryOperatorInsert,
    ConstantReplace,
}

impl MutationOperator {
    pub fn name(&self) -> &'static str {
        match self {
            Self::ArithmeticReplace => "ArithmeticReplace",
            Self::BooleanReplace => "BooleanReplace",
            Self::ConditionalReplace => "ConditionalReplace",
            Self::StatementDelete => "StatementDelete",
            Self::RelationalReplace => "RelationalReplace",
            Self::LogicalReplace => "LogicalReplace",
            Self::UnaryOperatorInsert => "UnaryOperatorInsert",
            Self::ConstantReplace => "ConstantReplace",
        }
    }
}

#[derive(Debug, Clone)]
pub struct Mutation {
    pub id: String,
    pub file: PathBuf,
    pub line: usize,
    pub column: usize,
    pub original: String,
    pub replacement: String,
    pub operator: MutationOperator,
}

impl Mutation {
    pub fn new(
        file: PathBuf,
        line: usize,
        column: usize,
        original: impl Into<String>,
        replacement: impl Into<String>,
        operator: MutationOperator,
    ) -> Self {
        Self {
            id: format!("{}:{}:{}", file.display(), line, column),
            file,
            line,
            column,
            original: original.into(),
            replacement: replacement.into(),
            operator,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MutationResult {
    Killed,
    Survived,
    Timeout,
    Error,
}

impl MutationResult {
    pub fn is_killed(&self) -> bool {
        matches!(self, Self::Killed)
    }

    pub fn is_survived(&self) -> bool {
        matches!(self, Self::Survived)
    }
}

#[derive(Debug, Clone)]
pub struct MutationScore {
    pub total: usize,
    pub killed: usize,
    pub survived: usize,
    pub timeout: usize,
    pub errors: usize,
}

impl MutationScore {
    pub fn new() -> Self {
        Self {
            total: 0,
            killed: 0,
            survived: 0,
            timeout: 0,
            errors: 0,
        }
    }

    pub fn record(&mut self, result: MutationResult) {
        self.total += 1;
        match result {
            MutationResult::Killed => self.killed += 1,
            MutationResult::Survived => self.survived += 1,
            MutationResult::Timeout => self.timeout += 1,
            MutationResult::Error => self.errors += 1,
        }
    }

    pub fn score(&self) -> f64 {
        if self.total == 0 {
            0.0
        } else {
            self.killed as f64 / self.total as f64 * 100.0
        }
    }

    pub fn summary(&self) -> String {
        format!(
            "Mutation Score: {:.1}% ({}/{}) - {} killed, {} survived, {} timeout, {} errors",
            self.score(),
            self.killed,
            self.total,
            self.killed,
            self.survived,
            self.timeout,
            self.errors
        )
    }
}

impl Default for MutationScore {
    fn default() -> Self {
        Self::new()
    }
}

pub struct MutationTester {
    config: MutationConfig,
}

impl MutationTester {
    pub fn new(config: MutationConfig) -> Self {
        Self { config }
    }

    pub fn with_defaults() -> Self {
        Self::new(MutationConfig::default())
    }

    pub fn generate_mutations(&self, source_dir: &PathBuf) -> TestingResult<Vec<Mutation>> {
        let mut mutations = Vec::new();

        let rust_files = self.find_rust_files(source_dir)?;

        for file in rust_files {
            let content = std::fs::read_to_string(&file)?;
            let file_mutations = self.generate_file_mutations(&file, &content);
            mutations.extend(file_mutations);

            if mutations.len() >= self.config.max_mutations {
                break;
            }
        }

        info!("Generated {} mutations", mutations.len());
        Ok(mutations)
    }

    fn find_rust_files(&self, dir: &PathBuf) -> TestingResult<Vec<PathBuf>> {
        let mut files = Vec::new();

        for entry in walkdir::WalkDir::new(dir)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            let path = entry.path();

            if path.extension().map(|e| e == "rs").unwrap_or(false) {
                let path_str = path.to_string_lossy();
                let excluded = self.config.exclude_patterns.iter().any(|p| {
                    glob_match(p, &path_str)
                });

                if !excluded {
                    files.push(path.to_path_buf());
                }
            }
        }

        Ok(files)
    }

    fn generate_file_mutations(&self, file: &PathBuf, content: &str) -> Vec<Mutation> {
        let mut mutations = Vec::new();

        for (line_idx, line) in content.lines().enumerate() {
            let line_num = line_idx + 1;

            for operator in &self.config.operators {
                let line_mutations = self.apply_operator(file, line_num, line, operator);
                mutations.extend(line_mutations);
            }
        }

        mutations
    }

    fn apply_operator(
        &self,
        file: &PathBuf,
        line_num: usize,
        line: &str,
        operator: &MutationOperator,
    ) -> Vec<Mutation> {
        let mut mutations = Vec::new();

        match operator {
            MutationOperator::ArithmeticReplace => {
                let replacements = [
                    ("+", "-"), ("-", "+"), ("*", "/"), ("/", "*"),
                    ("%", "&"), ("&", "|"), ("|", "^"),
                ];

                for (orig, repl) in replacements {
                    if line.contains(orig) {
                        mutations.push(Mutation::new(
                            file.clone(),
                            line_num,
                            1,
                            orig,
                            repl,
                            *operator,
                        ));
                    }
                }
            }
            MutationOperator::BooleanReplace => {
                let replacements = [("true", "false"), ("false", "true")];
                for (orig, repl) in replacements {
                    if line.contains(orig) {
                        mutations.push(Mutation::new(
                            file.clone(),
                            line_num,
                            1,
                            orig,
                            repl,
                            *operator,
                        ));
                    }
                }
            }
            MutationOperator::ConditionalReplace => {
                let replacements = [
                    ("if", "if !"), ("if !", "if "),
                    (">", "<="), ("<", ">="),
                    (">=", "<"), ("<=", ">"),
                    ("==", "!="), ("!=", "=="),
                ];
                for (orig, repl) in replacements {
                    if line.contains(orig) {
                        mutations.push(Mutation::new(
                            file.clone(),
                            line_num,
                            1,
                            orig,
                            repl,
                            *operator,
                        ));
                    }
                }
            }
            MutationOperator::StatementDelete => {
                if !line.trim().is_empty() && !line.trim().starts_with("//") {
                    mutations.push(Mutation::new(
                        file.clone(),
                        line_num,
                        1,
                        line.trim(),
                        "",
                        *operator,
                    ));
                }
            }
            _ => {}
        }

        mutations
    }

    pub fn run_mutation_test(
        &self,
        mutation: &Mutation,
        test_command: &[&str],
    ) -> TestingResult<MutationResult> {
        let original_content = std::fs::read_to_string(&mutation.file)?;
        let mutated_content = original_content.replacen(
            &mutation.original,
            &mutation.replacement,
            1,
        );

        std::fs::write(&mutation.file, &mutated_content)?;

        let result = self.run_tests(test_command);

        std::fs::write(&mutation.file, &original_content)?;

        result
    }

    fn run_tests(&self, command: &[&str]) -> TestingResult<MutationResult> {
        if command.is_empty() {
            return Ok(MutationResult::Error);
        }

        let output = Command::new(command[0])
            .args(&command[1..])
            .output();

        match output {
            Ok(output) => {
                if output.status.success() {
                    Ok(MutationResult::Survived)
                } else {
                    Ok(MutationResult::Killed)
                }
            }
            Err(_) => Ok(MutationResult::Error),
        }
    }
}

fn glob_match(pattern: &str, text: &str) -> bool {
    let regex_pattern = pattern
        .replace("**", ".*")
        .replace("*", "[^/]*")
        .replace("?", ".");

    regex::Regex::new(&format!("^{}$", regex_pattern))
        .map(|re| re.is_match(text))
        .unwrap_or(false)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mutation_score() {
        let mut score = MutationScore::new();
        score.record(MutationResult::Killed);
        score.record(MutationResult::Killed);
        score.record(MutationResult::Survived);

        assert_eq!(score.total, 3);
        assert!((score.score() - 66.67).abs() < 0.1);
    }

    #[test]
    fn test_mutation_operator_name() {
        assert_eq!(MutationOperator::ArithmeticReplace.name(), "ArithmeticReplace");
    }

    #[test]
    fn test_mutation_result() {
        assert!(MutationResult::Killed.is_killed());
        assert!(!MutationResult::Survived.is_killed());
        assert!(MutationResult::Survived.is_survived());
    }

    #[test]
    fn test_mutation_config_default() {
        let config = MutationConfig::default();
        assert!(!config.operators.is_empty());
        assert_eq!(config.max_mutations, 100);
    }
}
