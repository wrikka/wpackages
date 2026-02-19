use super::types::Command;

pub struct CommandPalette {
    commands: Vec<Command>,
    filter: String,
    selected_index: usize,
    is_visible: bool,
}

impl Default for CommandPalette {
    fn default() -> Self {
        Self::new()
    }
}

impl CommandPalette {
    pub fn new() -> Self {
        let commands = vec![
            Command::Save,
            Command::Quit,
            Command::OpenFile,
            Command::NewFile,
            Command::Find,
            Command::Replace,
            Command::GotoLine,
            Command::Format,
            Command::Run,
            Command::Build,
            Command::Test,
            Command::GitCommit,
            Command::GitPush,
            Command::GitPull,
            Command::GitStatus,
            Command::GitBranch,
            Command::GitStash,
            Command::GitCheckout,
            Command::GitMerge,
            Command::GitRebase,
            Command::ToggleLineNumbers,
            Command::ToggleWordWrap,
            Command::ToggleSyntax,
            Command::Theme("dark".to_string()),
            Command::Help,
            Command::SelectWord,
            Command::SelectAllOccurrences,
            Command::SelectLine,
            Command::SelectAllLines,
            Command::ExpandSelection,
            Command::ShrinkSelection,
            Command::ClearSelections,
            Command::TextObjectWord,
            Command::TextObjectLine,
            Command::TextObjectBlock,
            Command::TextObjectFunction,
            Command::TextObjectClass,
            Command::AddSurround,
            Command::ChangeSurround,
            Command::DeleteSurround,
            Command::GoToDefinition,
            Command::GetHover,
            Command::GetCompletions,
            Command::GetDiagnostics,
            Command::ListPlugins,
            Command::ListThemes,
        ];

        Self {
            commands,
            filter: String::new(),
            selected_index: 0,
            is_visible: false,
        }
    }

    pub fn is_visible(&self) -> bool {
        self.is_visible
    }

    pub fn set_visible(&mut self, visible: bool) {
        self.is_visible = visible;
        if visible {
            self.filter.clear();
            self.selected_index = 0;
        }
    }

    pub fn filter(&self) -> &str {
        &self.filter
    }

    pub fn set_filter(&mut self, filter: String) {
        self.filter = filter;
        self.selected_index = 0;
    }

    pub fn selected_index(&self) -> usize {
        self.selected_index
    }

    pub fn filtered_commands(&self) -> Vec<&Command> {
        self.commands
            .iter()
            .filter(|cmd| {
                let name = cmd.name().to_lowercase();
                name.contains(&self.filter.to_lowercase())
            })
            .collect()
    }

    pub fn selected_command(&self) -> Option<&Command> {
        let filtered = self.filtered_commands();
        filtered.get(self.selected_index).copied()
    }

    pub fn move_up(&mut self) {
        let filtered_len = self.filtered_commands().len();
        if filtered_len > 0 && self.selected_index > 0 {
            self.selected_index -= 1;
        }
    }

    pub fn move_down(&mut self) {
        let filtered_len = self.filtered_commands().len();
        if self.selected_index + 1 < filtered_len {
            self.selected_index += 1;
        }
    }
}
