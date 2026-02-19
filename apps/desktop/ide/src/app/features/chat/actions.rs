#[cfg(feature = "dioxus_ui")]
use crate::app::state::IdeState;
#[cfg(feature = "dioxus_ui")]
use crate::types::chat::{ChatMessage, ChatRole};
#[cfg(feature = "dioxus_ui")]
use crate::utils::chat_suggest;

#[cfg(feature = "dioxus_ui")]
#[allow(dead_code)]
pub fn update_chat_input(state: &mut IdeState, new_input: String) {
    state.core.chat.chat_input = new_input;
    chat_suggest::update_chat_suggestions(state);
}

#[cfg(feature = "dioxus_ui")]
#[allow(dead_code)]
pub fn append_chat_message(state: &mut IdeState) {
    let prompt = state.core.chat.chat_input.trim().to_string();
    if prompt.is_empty() {
        return;
    }

    state.core.chat.chat_log.push(ChatMessage {
        role: ChatRole::User,
        content: prompt.clone(),
    });
    state.core.chat.chat_input.clear();

    let p = prompt.to_lowercase();
    let reply = if p.contains("refactor") {
        "# Refactor plan\n\n- Split responsibilities into `types`, `components`, `services`, `app`\n- Add contract tests for service traits\n\n```rust\n// example: introduce a trait for I/O and mock it in tests\ntrait RepoService {\n    fn list(&self) -> Result<Vec<String>, String>;\n}\n```"
    } else if p.contains("lint") {
        "# Lint plan\n\n- Run `cargo fmt`\n- Run `cargo clippy --all-targets --all-features -- -D warnings`\n- Fix warnings instead of ignoring\n"
    } else if p.contains("explain") {
        "# Explanation\n\nThis area contains UI wiring + state updates.\n\n- `state` holds the app model\n- `actions` mutates state based on events\n\n```txt\nUI event -> actions::* -> state update -> re-render\n```"
    } else if p.starts_with('/') {
        "# Workflow\n\nYou started a workflow command.\n\n- Type more after `/` to pick a workflow from suggestions\n"
    } else {
        "# Note\n\nThis is a placeholder assistant response rendered as **Markdown**.\n\n- It supports headings\n- Lists\n- Code blocks\n"
    };

    state.core.chat.chat_log.push(ChatMessage {
        role: ChatRole::Assistant,
        content: reply.to_string(),
    });
}
