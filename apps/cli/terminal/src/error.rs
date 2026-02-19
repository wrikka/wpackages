use thiserror::Error;

pub type Result<T> = std::result::Result<T, Error>;
pub type AppError = Error;
pub type AppResult<T> = Result<T>;

#[derive(Error, Debug)]
pub enum Error {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("PTY error: {0}")]
    Pty(String),

    #[error("Config error: {0}")]
    Config(String),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Tauri error: {0}")]
    Tauri(#[from] tauri::Error),

    #[error("WebGPU error: {0}")]
    WebGPU(String),

    #[error("Shell integration error: {0}")]
    ShellIntegration(String),

    #[error("Session error: {0}")]
    Session(String),

    #[error("Tab error: {0}")]
    Tab(String),

    #[error("Pane error: {0}")]
    Pane(String),

    #[error("Theme error: {0}")]
    Theme(String),

    #[error("Profile error: {0}")]
    Profile(String),

    #[error("Clipboard error: {0}")]
    Clipboard(String),

    #[error("Hotkey error: {0}")]
    Hotkey(String),

    #[error("Search error: {0}")]
    Search(String),

    #[error("SSH error: {0}")]
    Ssh(String),

    #[error("AI assistant error: {0}")]
    AiAssistant(String),

    #[error("Knowledge graph error: {0}")]
    KnowledgeGraph(String),

    #[error("Plugin error: {0}")]
    Plugin(String),

    #[error("Collaboration error: {0}")]
    Collaboration(String),

    #[error("Telemetry error: {0}")]
    Telemetry(String),

    #[error("Git error: {0}")]
    Git(String),

    #[error("Context analyzer error: {0}")]
    ContextAnalyzer(String),

    #[error("Remote multiplexer error: {0}")]
    RemoteMultiplexer(String),

    #[error("Graphics error: {0}")]
    Graphics(String),

    #[error("Prompt error: {0}")]
    Prompt(String),

    #[error("Trigger error: {0}")]
    Trigger(String),

    #[error("Shell enhancements error: {0}")]
    ShellEnhancements(String),

    #[error("Shell prompt error: {0}")]
    ShellPrompt(String),

    #[error("Other error: {0}")]
    Other(String),
}
