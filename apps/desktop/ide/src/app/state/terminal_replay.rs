use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TerminalSession {
    pub id: u32,
    pub name: String,
    pub commands: Vec<TerminalCommand>,
    pub outputs: Vec<TerminalOutput>,
    pub created_at: String,
    pub working_dir: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TerminalCommand {
    pub command: String,
    pub timestamp: String,
    pub exit_code: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TerminalOutput {
    pub content: String,
    pub timestamp: String,
    pub stream: OutputStream,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum OutputStream {
    Stdout,
    Stderr,
}

#[derive(Debug, Clone, Default)]
pub struct TerminalReplayState {
    pub sessions: Vec<TerminalSession>,
    pub current_session_id: Option<u32>,
    pub is_replaying: bool,
    pub replay_position: usize,
    pub auto_record: bool,
}

impl TerminalReplayState {
    pub fn new() -> Self {
        Self {
            sessions: Vec::new(),
            current_session_id: None,
            is_replaying: false,
            replay_position: 0,
            auto_record: true,
        }
    }

    pub fn start_recording(&mut self, id: u32, name: String, working_dir: String) {
        self.sessions.push(TerminalSession {
            id,
            name,
            commands: Vec::new(),
            outputs: Vec::new(),
            created_at: chrono::Utc::now().to_rfc3339(),
            working_dir,
        });
        self.current_session_id = Some(id);
    }

    pub fn record_command(&mut self, command: String) {
        if let Some(session) = self.current_session() {
            session.commands.push(TerminalCommand {
                command,
                timestamp: chrono::Utc::now().to_rfc3339(),
                exit_code: None,
            });
        }
    }

    pub fn record_output(&mut self, content: String, stream: OutputStream) {
        if let Some(session) = self.current_session() {
            session.outputs.push(TerminalOutput {
                content,
                timestamp: chrono::Utc::now().to_rfc3339(),
                stream,
            });
        }
    }

    pub fn stop_recording(&mut self) {
        self.current_session_id = None;
    }

    pub fn start_replay(&mut self, session_id: u32) {
        if let Some(_) = self.sessions.iter().find(|s| s.id == session_id) {
            self.current_session_id = Some(session_id);
            self.is_replaying = true;
            self.replay_position = 0;
        }
    }

    pub fn stop_replay(&mut self) {
        self.is_replaying = false;
        self.replay_position = 0;
    }

    pub fn get_next_command(&mut self) -> Option<&TerminalCommand> {
        if let Some(session) = self.current_session() {
            if self.replay_position < session.commands.len() {
                let cmd = &session.commands[self.replay_position];
                self.replay_position += 1;
                Some(cmd)
            } else {
                None
            }
        } else {
            None
        }
    }

    pub fn current_session(&mut self) -> Option<&mut TerminalSession> {
        self.current_session_id.and_then(|id| {
            self.sessions.iter_mut().find(|s| s.id == id)
        })
    }

    pub fn delete_session(&mut self, id: u32) {
        self.sessions.retain(|s| s.id != id);
    }
}
