use crate::error::Result;
use crate::uia;

pub fn handle_ui_tree(params: &serde_json::Value) -> Result<Option<serde_json::Value>> {
    uia::ui_tree(params)
}
