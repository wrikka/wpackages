#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ChatRole {
    User,
    Assistant,
}

#[derive(Debug, Clone)]
pub struct ChatMessage {
    pub role: ChatRole,
    pub content: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum ChatSuggestKind {
    #[default]
    None,
    Files,
    Workflows,
}

#[derive(Default, Debug, Clone)]
pub struct ChatState {
    pub chat_input: String,
    pub chat_log: Vec<ChatMessage>,
    pub chat_suggest_open: bool,
    pub chat_suggest_kind: ChatSuggestKind,
    pub chat_suggest_selected: usize,
    pub workflows_cache: Vec<String>,
}
