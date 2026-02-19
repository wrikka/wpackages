use super::error::{TerminalError, TerminalResult};
use super::types::TerminalShell;
use std::collections::HashMap;
use tokio::sync::mpsc;

pub struct TerminalSession {
    inner: wpty::PtySession,
    rx: mpsc::Receiver<Vec<u8>>,
}

impl std::fmt::Debug for TerminalSession {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("TerminalSession")
            .field("inner", &"<pty>")
            .finish()
    }
}

impl TerminalSession {
    pub fn try_read(&mut self) -> Option<String> {
        let mut buf = Vec::new();
        while let Ok(chunk) = self.rx.try_recv() {
            buf.extend_from_slice(&chunk);
        }
        if buf.is_empty() {
            return None;
        }
        Some(String::from_utf8_lossy(&buf).to_string())
    }
}

#[derive(Default, Debug)]
pub struct PtyService {
    sessions: HashMap<String, TerminalSession>,
}

impl PtyService {
    pub async fn ensure_shell(
        &mut self,
        tab_id: &str,
        shell: TerminalShell,
        rows: u16,
        cols: u16,
    ) -> TerminalResult<()> {
        if self.sessions.contains_key(tab_id) {
            return Ok(());
        }

        let sess = spawn_shell(shell, rows, cols).await?;
        self.sessions.insert(tab_id.to_string(), sess);
        Ok(())
    }

    pub fn disconnect(&mut self, tab_id: &str) {
        self.sessions.remove(tab_id);
    }

    pub fn try_read(&mut self, tab_id: &str) -> Option<String> {
        self.sessions.get_mut(tab_id)?.try_read()
    }

    pub async fn write_line(&mut self, tab_id: &str, line: &str) -> TerminalResult<()> {
        let Some(sess) = self.sessions.get_mut(tab_id) else {
            return Ok(());
        };
        write(sess, &(line.to_string() + "\r\n")).await
    }
}

pub async fn spawn_shell(shell: TerminalShell, rows: u16, cols: u16) -> TerminalResult<TerminalSession> {
    let (exec, args): (&str, Vec<String>) = match shell {
        TerminalShell::Pwsh => ("pwsh", vec!["-NoLogo".to_string()]),
        TerminalShell::Cmd => ("cmd.exe", vec![]),
        TerminalShell::Bash => ("bash", vec![]),
    };

    let cfg = wpty::PtyConfig {
        command: exec.to_string(),
        args,
        cwd: None,
        initial_command: None,
        rows,
        cols,
    };

    let (tx, rx) = mpsc::channel::<Vec<u8>>(100);
    let inner = wpty::PtySession::spawn(&cfg, tx, |_title| {})
        .await
        .map_err(|e| TerminalError::Pty(e.to_string()))?;

    Ok(TerminalSession { inner, rx })
}

async fn write(session: &TerminalSession, data: &str) -> TerminalResult<()> {
    session.inner.write(data.as_bytes()).await.map_err(|e| TerminalError::Pty(e.to_string()))?; 
    Ok(())
}

pub async fn resize(session: &TerminalSession, rows: u16, cols: u16) -> TerminalResult<()> {
    session.inner.resize(rows, cols).await.map_err(|e| TerminalError::Pty(e.to_string()))?; 
    Ok(())
}
