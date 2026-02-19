use crate::types::ActionRecord;

#[derive(Debug, Clone)]
pub enum ActionResult {
    Success,
    Failure(String),
}

#[derive(Debug, Clone)]
pub struct ExecutionContext {
    pub session_id: String,
    pub action_history: Vec<ActionRecord>,
}

impl ExecutionContext {
    pub fn new(session_id: impl Into<String>) -> Self {
        Self {
            session_id: session_id.into(),
            action_history: Vec::new(),
        }
    }

    pub fn record_action(&mut self, record: ActionRecord) {
        self.action_history.push(record);
    }

    pub fn last_action(&self) -> Option<&ActionRecord> {
        self.action_history.last()
    }
}

pub fn validate_selector(selector: &str) -> bool {
    !selector.is_empty()
        && (selector.starts_with('@')
            || selector.starts_with('#')
            || selector.starts_with('.')
            || selector.starts_with('['))
}

pub fn parse_ref_id(selector: &str) -> Option<String> {
    if selector.starts_with("@e") {
        Some(selector.to_string())
    } else {
        None
    }
}
