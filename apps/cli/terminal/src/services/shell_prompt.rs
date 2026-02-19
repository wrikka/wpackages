use crate::types::ShellType;

impl ShellType {
    pub fn default_prompt(&self) -> String {
        match self {
            ShellType::Bash => r"\u@\h:\w$ ".to_string(),
            ShellType::Zsh => "%n@%m:%~$ ".to_string(),
            ShellType::Fish => "fish_prompt ".to_string(),
            ShellType::PowerShell => "PS> ".to_string(),
            ShellType::Cmd => "> ".to_string(),
            ShellType::Nushell => "> ".to_string(),
            ShellType::Elvish => "> ".to_string(),
            ShellType::Xonsh => "$ ".to_string(),
        }
    }
}
