use anyhow::Result;
use serde::{Deserialize, Serialize};
use tokio::{
    io::{AsyncBufReadExt, AsyncReadExt, AsyncWriteExt, BufReader},
    process::{Child, Command},
    sync::mpsc,
};

// Basic DAP message structures
#[derive(Serialize, Deserialize, Debug)]
struct Request {
    seq: u64,
    #[serde(rename = "type")]
    typ: String,
    command: String,
    // arguments: ...
}

#[derive(Serialize, Deserialize, Debug)]
struct Response {
    seq: u64,
    request_seq: u64,
    success: bool,
    command: String,
    // body: ...
}

#[derive(Serialize, Deserialize, Debug)]
struct Event {
    seq: u64,
    #[serde(rename = "type")]
    typ: String,
    event: String,
    // body: ...
}

pub struct DebuggerService {
    child: Option<Child>,
    // For sending requests to the debug adapter
    request_tx: Option<mpsc::Sender<String>>,
}

impl Default for DebuggerService {
    fn default() -> Self {
        Self {
            child: None,
            request_tx: None,
        }
    }
}

impl DebuggerService {
    pub async fn new(program: &str) -> Result<Self> {
        let mut child = Command::new(program)
            .stdin(std::process::Stdio::piped())
            .stdout(std::process::Stdio::piped())
            .spawn()?;

        let stdout = child
            .stdout
            .take()
            .ok_or_else(|| anyhow::anyhow!("Failed to take stdout from child process"))?;
        let mut stdout = BufReader::new(stdout);
        let mut stdin = child
            .stdin
            .take()
            .ok_or_else(|| anyhow::anyhow!("Failed to take stdin from child process"))?;

        let (request_tx, mut request_rx) = mpsc::channel::<String>(32);

        // Task to write requests to the DA's stdin
        tokio::spawn(async move {
            while let Some(request_str) = request_rx.recv().await {
                if stdin.write_all(request_str.as_bytes()).await.is_err() {
                    break;
                }
            }
        });

        // Task to read responses/events from the DA's stdout
        tokio::spawn(async move {
            loop {
                let mut headers = String::new();
                let mut content_length = 0;

                loop {
                    let mut header_line = String::new();
                    match stdout.read_line(&mut header_line).await {
                        Ok(0) => return, // Connection closed
                        Ok(_) => {}
                        Err(e) => {
                            tracing::error!("Failed to read DAP header: {}", e);
                            return;
                        }
                    }
                    if header_line == "\r\n" {
                        break; // End of headers
                    }
                    if header_line.starts_with("Content-Length: ") {
                        if let Some(len_str) = header_line.strip_prefix("Content-Length: ") {
                            if let Ok(len) = len_str.trim().parse::<usize>() {
                                content_length = len;
                            }
                        }
                    }
                    headers.push_str(&header_line);
                }

                if content_length > 0 {
                    let mut body = vec![0; content_length];
                    if stdout.read_exact(&mut body).await.is_err() {
                        return; // Connection closed or error
                    }
                    let body_str = String::from_utf8_lossy(&body);
                    tracing::debug!("DAP Message Body: {}", body_str);
                    // Here you would parse the JSON body and send it to the app state
                }
            }
        });

        Ok(Self {
            child: Some(child),
            request_tx: Some(request_tx),
        })
    }

    // Example of sending an 'initialize' request
    pub async fn initialize(&self) -> Result<()> {
        if let Some(request_tx) = &self.request_tx {
            let init_request = serde_json::to_string(&Request {
                seq: 1,
                typ: "request".to_string(),
                command: "initialize".to_string(),
            })?;
            request_tx.send(init_request).await?;
        }
        Ok(())
    }
}

impl Drop for DebuggerService {
    fn drop(&mut self) {
        if let Some(child) = &mut self.child {
            let _ = child.start_kill();
        }
    }
}
