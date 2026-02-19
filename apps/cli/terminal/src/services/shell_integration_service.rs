use crate::error::{AppError, AppResult};
use crate::types::{
    OSCSequence, OSCSequenceType, ShellInfo, ShellIntegration, ShellIntegrationFeatures,
    ShellState, ShellType,
};
use dashmap::DashMap;
use serde::Serialize;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Runtime};
use tokio::sync::RwLock;

#[derive(Clone, Serialize)]
pub struct ShellIntegrationEvent {
    pub event_type: ShellIntegrationEventType,
    pub tab_id: Option<String>,
    pub sequence: Option<OSCSequence>,
    pub shell_state: Option<ShellState>,
}

#[derive(Clone, Serialize)]
pub enum ShellIntegrationEventType {
    SequenceReceived,
    CommandStarted,
    CommandFinished,
    PromptDetected,
    WorkingDirectoryChanged,
    ShellInfoUpdated,
}

#[derive(Clone)]
pub struct ShellIntegrationService {
    shell_states: Arc<DashMap<String, ShellState>>,
    enabled: Arc<RwLock<bool>>,
}

impl Default for ShellIntegrationService {
    fn default() -> Self {
        Self::new()
    }
}

impl ShellIntegrationService {
    pub fn new() -> Self {
        Self {
            shell_states: Arc::new(DashMap::new()),
            enabled: Arc::new(RwLock::new(true)),
        }
    }

    pub async fn is_enabled(&self) -> bool {
        *self.enabled.read().await
    }

    pub async fn set_enabled(&self, enabled: bool) {
        *self.enabled.write().await = enabled;
    }

    pub async fn initialize_shell_state(&self, tab_id: String, shell_type: ShellType) {
        let shell_state = ShellState {
            info: ShellInfo {
                shell_type: shell_type.clone(),
                path: shell_type.as_str().to_string(),
                version: None,
                integration: ShellIntegration {
                    enabled: true,
                    shell_type,
                    features: ShellIntegrationFeatures::default(),
                },
                ..Default::default()
            },
            ..Default::default()
        };

        self.shell_states.insert(tab_id, shell_state);
    }

    pub async fn get_shell_state(&self, tab_id: &str) -> Option<ShellState> {
        self.shell_states.get(tab_id).map(|s| s.clone())
    }

    pub async fn update_shell_info<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        tab_id: String,
        shell_info: ShellInfo,
    ) -> AppResult<()> {
        if let Some(mut state) = self.shell_states.get_mut(&tab_id) {
            state.info = shell_info.clone();

            self.emit_event(
                &app_handle,
                ShellIntegrationEvent {
                    event_type: ShellIntegrationEventType::ShellInfoUpdated,
                    tab_id: Some(tab_id),
                    sequence: None,
                    shell_state: Some(state.clone()),
                },
            )?;
        }

        Ok(())
    }

    pub async fn handle_osc_sequence<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        tab_id: String,
        sequence: OSCSequence,
    ) -> AppResult<()> {
        if !self.is_enabled().await {
            return Ok(());
        }

        match sequence.sequence_type {
            OSCSequenceType::CommandStart => {
                self.handle_command_start(&tab_id, &sequence).await?;
            }
            OSCSequenceType::CommandFinish => {
                self.handle_command_finish(&tab_id, &sequence).await?;
            }
            OSCSequenceType::PromptStart => {
                self.handle_prompt_start(&tab_id).await?;
            }
            OSCSequenceType::PromptEnd => {
                self.handle_prompt_end(&tab_id).await?;
            }
            OSCSequenceType::CwdChange => {
                self.handle_cwd_change(&tab_id, &sequence).await?;
            }
            OSCSequenceType::SetWindowTitle => {
                // Handle window title change
            }
            OSCSequenceType::SetIcon => {
                // Handle icon change
            }
            OSCSequenceType::SetWorkingDirectory => {
                self.handle_cwd_change(&tab_id, &sequence).await?;
            }
            OSCSequenceType::Other(_) => {}
        }

        self.emit_event(
            &app_handle,
            ShellIntegrationEvent {
                event_type: ShellIntegrationEventType::SequenceReceived,
                tab_id: Some(tab_id),
                sequence: Some(sequence),
                shell_state: None,
            },
        )?;

        Ok(())
    }

    async fn handle_command_start(&self, tab_id: &str, sequence: &OSCSequence) -> AppResult<()> {
        if let Some(mut state) = self.shell_states.get_mut(tab_id) {
            state.is_executing = true;
            state.command_line = sequence.params.first().cloned();
            state.info.last_command = sequence.params.first().cloned();
        }
        Ok(())
    }

    async fn handle_command_finish(&self, tab_id: &str, sequence: &OSCSequence) -> AppResult<()> {
        if let Some(mut state) = self.shell_states.get_mut(tab_id) {
            state.is_executing = false;
            state.command_line = None;

            // Parse exit code
            if let Some(exit_code_str) = sequence.params.first() {
                if let Ok(exit_code) = exit_code_str.parse::<i32>() {
                    state.info.last_exit_code = Some(exit_code);
                }
            }
        }
        Ok(())
    }

    async fn handle_prompt_start(&self, tab_id: &str) -> AppResult<()> {
        if let Some(mut state) = self.shell_states.get_mut(tab_id) {
            state.is_executing = false;
        }
        Ok(())
    }

    async fn handle_prompt_end(&self, tab_id: &str) -> AppResult<()> {
        if let Some(mut state) = self.shell_states.get_mut(tab_id) {
            state.is_executing = false;
        }
        Ok(())
    }

    async fn handle_cwd_change(&self, tab_id: &str, sequence: &OSCSequence) -> AppResult<()> {
        if let Some(mut state) = self.shell_states.get_mut(tab_id) {
            if let Some(cwd) = sequence.params.first() {
                state.cwd = Some(cwd.clone());
                state.info.current_working_dir = Some(cwd.clone());
            }
        }
        Ok(())
    }

    pub async fn get_working_directory(&self, tab_id: &str) -> Option<String> {
        self.shell_states.get(tab_id).and_then(|s| s.cwd.clone())
    }

    pub async fn get_last_command(&self, tab_id: &str) -> Option<String> {
        self.shell_states
            .get(tab_id)
            .and_then(|s| s.info.last_command.clone())
    }

    pub async fn get_last_exit_code(&self, tab_id: &str) -> Option<i32> {
        self.shell_states
            .get(tab_id)
            .and_then(|s| s.info.last_exit_code)
    }

    pub async fn is_executing(&self, tab_id: &str) -> bool {
        self.shell_states
            .get(tab_id)
            .map(|s| s.is_executing)
            .unwrap_or(false)
    }

    pub async fn get_shell_info(&self, tab_id: &str) -> Option<ShellInfo> {
        self.shell_states.get(tab_id).map(|s| s.info.clone())
    }

    pub async fn remove_shell_state(&self, tab_id: &str) {
        self.shell_states.remove(tab_id);
    }

    pub async fn get_all_shell_states(&self) -> Vec<(String, ShellState)> {
        self.shell_states
            .iter()
            .map(|entry| (entry.key().clone(), entry.value().clone()))
            .collect()
    }

    fn emit_event<R: Runtime>(
        &self,
        app_handle: &AppHandle<R>,
        event: ShellIntegrationEvent,
    ) -> AppResult<()> {
        app_handle
            .emit("shell-integration-event", event)
            .map_err(|e| {
                AppError::Other(format!("Failed to emit shell integration event: {}", e))
            })?;
        Ok(())
    }

    pub fn parse_osc_sequence(&self, data: &[u8]) -> Option<OSCSequence> {
        let data_str = String::from_utf8_lossy(data);

        // OSC sequence format: \x1b] <params> ; <ST> or \x07
        if !data_str.starts_with("\x1b]") {
            return None;
        }

        let content = &data_str[2..];
        let (params, sequence_type) = if let Some(pos) = content.find(';') {
            let params_str = &content[..pos];
            let rest = &content[pos + 1..];

            // Remove ST (String Terminator) or BEL
            let rest = rest.trim_end_matches('\x07').trim_end_matches("\x1b\\");

            let params: Vec<String> = params_str.split(':').map(|s| s.to_string()).collect();

            let sequence_type = if let Some(code) = params.first() {
                match code.as_str() {
                    "633" => {
                        // iTerm2/fish shell integration
                        if params.len() >= 2 {
                            match params[1].as_str() {
                                "A" => OSCSequenceType::CommandStart,
                                "B" => OSCSequenceType::CommandFinish,
                                "C" => OSCSequenceType::PromptStart,
                                "D" => OSCSequenceType::PromptEnd,
                                _ => OSCSequenceType::Other(code.clone()),
                            }
                        } else {
                            OSCSequenceType::Other(code.clone())
                        }
                    }
                    "7" => OSCSequenceType::SetWorkingDirectory,
                    "133" => {
                        // Generic shell integration
                        if params.len() >= 2 {
                            match params[1].as_str() {
                                "A" => OSCSequenceType::PromptStart,
                                "B" => OSCSequenceType::CommandStart,
                                "C" => OSCSequenceType::CommandFinish,
                                "D" => OSCSequenceType::PromptEnd,
                                _ => OSCSequenceType::Other(params[1].clone()),
                            }
                        } else {
                            OSCSequenceType::Other(code.clone())
                        }
                    }
                    "0" | "1" | "2" => OSCSequenceType::SetWindowTitle,
                    _ => OSCSequenceType::Other(code.clone()),
                }
            } else {
                OSCSequenceType::Other("unknown".to_string())
            };

            Some(OSCSequence {
                sequence_type,
                params,
                raw: data_str.to_string(),
            })
        } else {
            None
        };

        sequence_type
    }

    pub async fn process_osc_data<R: Runtime>(
        &self,
        app_handle: AppHandle<R>,
        tab_id: String,
        data: &[u8],
    ) -> AppResult<()> {
        if let Some(sequence) = self.parse_osc_sequence(data) {
            self.handle_osc_sequence(app_handle, tab_id, sequence)
                .await?;
        }
        Ok(())
    }
}
