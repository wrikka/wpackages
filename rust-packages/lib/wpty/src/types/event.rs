use napi_derive::napi;
use serde::Deserialize;

#[napi(object)]
#[derive(Debug, Clone, Deserialize)]
pub struct ExitEvent {
    pub exit_code: i32,
    pub signal: Option<u32>,
    pub killed: Option<bool>,
    pub error: Option<String>,
}

#[napi]
#[derive(Debug, Clone)]
pub enum ShellIntegrationCommand {
    Prompt,
    CommandStart,
    CommandEnd,
    Cwd,
}

#[napi(object)]
#[derive(Debug, Clone)]
pub struct ShellIntegrationEvent {
    pub command: ShellIntegrationCommand,
    pub cwd: Option<String>,
}
