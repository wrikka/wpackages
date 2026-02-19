//! Feature 12: Natural Language Scripting

use crate::types::Action;

pub struct ParsedScript { pub commands: Vec<(Action, String)> }

pub struct NLParser;

impl NLParser {
    pub fn new() -> Self { Self }
    pub fn parse(&self, text: &str) -> ParsedScript {
        let commands = if text.contains("snapshot") {
            vec![(Action::Snapshot, "".into())]
        } else if text.contains("click") {
            vec![(Action::Click, text.replace("click", "").trim().into())]
        } else { vec![] };
        ParsedScript { commands }
    }
}
impl Default for NLParser { fn default() -> Self { Self::new() } }
