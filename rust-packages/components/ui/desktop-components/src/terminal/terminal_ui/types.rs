#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TerminalShell {
    Pwsh,
    Cmd,
    Bash,
}

impl TerminalShell {
    pub fn label(self) -> &'static str {
        match self {
            Self::Pwsh => "pwsh",
            Self::Cmd => "cmd",
            Self::Bash => "bash",
        }
    }
}

#[derive(Debug, Clone)]
pub struct TerminalTab {
    pub tab_id: String,
    pub title: String,
    pub buffer: String,
    pub input: String,
    pub connected: bool,
    pub shell: TerminalShell,
    pub session_id: Option<u32>,
}

impl TerminalTab {
    pub fn new(tab_id: String, shell: TerminalShell, title: String) -> Self {
        Self {
            tab_id,
            title,
            buffer: String::new(),
            input: String::new(),
            connected: false,
            shell,
            session_id: None,
        }
    }
}

#[derive(Debug, Clone)]
pub struct TerminalState {
    pub show_terminal: bool,
    pub tabs: Vec<TerminalTab>,
    pub active_tab: Option<usize>,
}

impl Default for TerminalState {
    fn default() -> Self {
        let tab = TerminalTab::new(
            "pwsh-1".to_string(),
            TerminalShell::Pwsh,
            "pwsh".to_string(),
        );
        Self {
            show_terminal: false,
            tabs: vec![tab],
            active_tab: Some(0),
        }
    }
}
