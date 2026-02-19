use anyhow::Result;
use std::process::Stdio;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader, Lines};
use tokio::process::{Child, ChildStdin, ChildStdout, Command};

pub struct ReplService {
    child: Option<Child>,
    stdin: Option<ChildStdin>,
    stdout_lines: Option<Lines<BufReader<ChildStdout>>>,
}

impl Default for ReplService {
    fn default() -> Self {
        Self {
            child: None,
            stdin: None,
            stdout_lines: None,
        }
    }
}

impl ReplService {
    pub async fn new(command: &str) -> Result<Self> {
        let mut child = Command::new(command)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()?;

        let stdin = child.stdin.take();
        let stdout = child.stdout.take();
        let stdout_lines = stdout.map(|s| BufReader::new(s).lines());

        Ok(Self {
            child: Some(child),
            stdin,
            stdout_lines,
        })
    }

    pub async fn send_command(&mut self, cmd: &str) -> Result<()> {
        if let Some(stdin) = &mut self.stdin {
            stdin.write_all(format!("{}\n", cmd).as_bytes()).await?;
        }
        Ok(())
    }

    pub async fn read_output(&mut self) -> Result<Option<String>> {
        if let Some(lines) = &mut self.stdout_lines {
            Ok(lines.next_line().await?)
        } else {
            Ok(None)
        }
    }
}

impl Drop for ReplService {
    fn drop(&mut self) {
        if let Some(child) = &mut self.child {
            let _ = child.start_kill();
        }
    }
}
