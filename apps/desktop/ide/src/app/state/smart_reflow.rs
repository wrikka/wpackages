use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReflowRule {
    pub id: String,
    pub name: String,
    pub language: String,
    pub pattern: String,
    pub replacement: String,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReflowAction {
    pub original: String,
    pub formatted: String,
    pub line_number: usize,
    pub rule_id: String,
}

#[derive(Debug, Clone, Default)]
pub struct SmartReflowState {
    pub rules: Vec<ReflowRule>,
    pub actions_history: Vec<ReflowAction>,
    pub auto_reflow_on_paste: bool,
    pub auto_reflow_on_save: bool,
    pub show_preview: bool,
}

impl SmartReflowState {
    pub fn new() -> Self {
        let mut state = Self::default();
        state.init_default_rules();
        state
    }

    fn init_default_rules(&mut self) {
        self.rules.push(ReflowRule {
            id: "rust-trailing-comma".to_string(),
            name: "Rust Trailing Comma".to_string(),
            language: "rust".to_string(),
            pattern: r"(?m)^(\s+)([^\n,])\s*$".to_string(),
            replacement: r"$1$2,".to_string(),
            enabled: true,
        });

        self.rules.push(ReflowRule {
            id: "typescript-semi".to_string(),
            name: "TypeScript Semicolon".to_string(),
            language: "typescript".to_string(),
            pattern: r"(?m)^(\s+)([^\n;])\s*$".to_string(),
            replacement: r"$1$2;".to_string(),
            enabled: true,
        });

        self.rules.push(ReflowRule {
            id: "python-spacing".to_string(),
            name: "Python Spacing".to_string(),
            language: "python".to_string(),
            pattern: r"([=<>!])([^\s])".to_string(),
            replacement: r"$1 $2".to_string(),
            enabled: true,
        });
    }

    pub fn apply_reflow(&mut self, content: &str, language: &str) -> String {
        let mut result = content.to_string();
        let mut actions = Vec::new();

        for rule in self.rules.iter().filter(|r| r.enabled && r.language == language) {
            let lines: Vec<&str> = result.lines().collect();
            for (idx, line) in lines.iter().enumerate() {
                if line.matches(&rule.pattern).count() > 0 {
                    let formatted = line.replace(&rule.pattern, &rule.replacement);
                    if formatted != *line {
                        actions.push(ReflowAction {
                            original: line.to_string(),
                            formatted: formatted.clone(),
                            line_number: idx + 1,
                            rule_id: rule.id.clone(),
                        });
                    }
                }
            }
        }

        self.actions_history.extend(actions);
        result
    }

    pub fn add_rule(&mut self, rule: ReflowRule) {
        self.rules.push(rule);
    }

    pub fn remove_rule(&mut self, id: &str) {
        self.rules.retain(|r| r.id != id);
    }

    pub fn clear_history(&mut self) {
        self.actions_history.clear();
    }
}
