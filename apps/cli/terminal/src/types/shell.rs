use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub enum ShellType {
    Bash,
    Zsh,
    Fish,
    PowerShell,
    Cmd,
    Nu,
    Elvish,
    Other(String),
}

impl ShellType {
    pub fn from_path(path: &str) -> Self {
        let path_lower = path.to_lowercase();
        if path_lower.contains("bash") {
            Self::Bash
        } else if path_lower.contains("zsh") {
            Self::Zsh
        } else if path_lower.contains("fish") {
            Self::Fish
        } else if path_lower.contains("powershell") || path_lower.contains("pwsh") {
            Self::PowerShell
        } else if path_lower.contains("cmd.exe") {
            Self::Cmd
        } else if path_lower.contains("nu") {
            Self::Nu
        } else if path_lower.contains("elvish") {
            Self::Elvish
        } else {
            Self::Other(path.to_string())
        }
    }

    pub fn as_str(&self) -> &str {
        match self {
            Self::Bash => "bash",
            Self::Zsh => "zsh",
            Self::Fish => "fish",
            Self::PowerShell => "powershell",
            Self::Cmd => "cmd",
            Self::Nu => "nu",
            Self::Elvish => "elvish",
            Self::Other(s) => s,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ShellCommand {
    pub command: String,
    pub args: Vec<String>,
    pub working_dir: Option<String>,
    pub env_vars: HashMap<String, String>,
}

impl Default for ShellCommand {
    fn default() -> Self {
        Self {
            command: String::new(),
            args: vec![],
            working_dir: None,
            env_vars: HashMap::new(),
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ShellPrompt {
    pub raw: String,
    pub rendered: String,
    pub segments: Vec<PromptSegment>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct PromptSegment {
    pub kind: PromptSegmentKind,
    pub text: String,
    pub style: PromptStyle,
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub enum PromptSegmentKind {
    User,
    Host,
    Path,
    Git,
    Time,
    Duration,
    Status,
    Custom(String),
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct PromptStyle {
    pub foreground: Option<String>,
    pub background: Option<String>,
    pub bold: bool,
    pub italic: bool,
    pub underline: bool,
}

impl Default for PromptStyle {
    fn default() -> Self {
        Self {
            foreground: None,
            background: None,
            bold: false,
            italic: false,
            underline: false,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ShellIntegration {
    pub enabled: bool,
    pub shell_type: ShellType,
    pub features: ShellIntegrationFeatures,
}

impl Default for ShellIntegration {
    fn default() -> Self {
        Self {
            enabled: true,
            shell_type: if cfg!(windows) {
                ShellType::PowerShell
            } else {
                ShellType::Bash
            },
            features: ShellIntegrationFeatures::default(),
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ShellIntegrationFeatures {
    pub command_tracking: bool,
    pub prompt_tracking: bool,
    pub cwd_tracking: bool,
    pub exit_code_tracking: bool,
    pub command_duration: bool,
}

impl Default for ShellIntegrationFeatures {
    fn default() -> Self {
        Self {
            command_tracking: true,
            prompt_tracking: true,
            cwd_tracking: true,
            exit_code_tracking: true,
            command_duration: true,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ShellInfo {
    pub shell_type: ShellType,
    pub path: String,
    pub version: Option<String>,
    pub integration: ShellIntegration,
    pub current_working_dir: Option<String>,
    pub last_command: Option<String>,
    pub last_exit_code: Option<i32>,
}

impl Default for ShellInfo {
    fn default() -> Self {
        Self {
            shell_type: if cfg!(windows) {
                ShellType::PowerShell
            } else {
                ShellType::Bash
            },
            path: if cfg!(windows) {
                "powershell.exe".to_string()
            } else {
                "/bin/bash".to_string()
            },
            version: None,
            integration: ShellIntegration::default(),
            current_working_dir: None,
            last_command: None,
            last_exit_code: None,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct OSCSequence {
    pub sequence_type: OSCSequenceType,
    pub params: Vec<String>,
    pub raw: String,
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub enum OSCSequenceType {
    CommandStart,
    CommandFinish,
    PromptStart,
    PromptEnd,
    CwdChange,
    SetWindowTitle,
    SetIcon,
    SetWorkingDirectory,
    Other(String),
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ShellState {
    pub info: ShellInfo,
    pub prompt: Option<ShellPrompt>,
    pub cwd: Option<String>,
    pub command_line: Option<String>,
    pub is_executing: bool,
}

impl Default for ShellState {
    fn default() -> Self {
        Self {
            info: ShellInfo::default(),
            prompt: None,
            cwd: None,
            command_line: None,
            is_executing: false,
        }
    }
}
