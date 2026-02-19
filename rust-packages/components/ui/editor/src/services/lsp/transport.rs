use super::LspMessage;
use lsp_types::Hover;
use lsp_types::PublishDiagnosticsParams;
use serde::Deserialize;
use serde_json::Value;
use std::io::{BufRead, BufReader, Read, Write};
use std::process::{ChildStdin, ChildStdout};
use std::sync::mpsc::Sender;

pub(super) fn writer_loop(mut stdin: ChildStdin, rx: std::sync::mpsc::Receiver<Value>) {
    for msg in rx {
        let msg_str = serde_json::to_string(&msg).unwrap();
        let content_length = msg_str.len();
        let header = format!("Content-Length: {}\r\n\r\n", content_length);

        if let Err(e) = stdin.write_all(header.as_bytes()) {
            eprintln!("LSP writer: failed to write header: {}", e);
            break;
        }
        if let Err(e) = stdin.write_all(msg_str.as_bytes()) {
            eprintln!("LSP writer: failed to write message: {}", e);
            break;
        }
        stdin.flush().ok();
    }
}

pub(super) fn reader_loop(stdout: ChildStdout, tx: Sender<LspMessage>) {
    let mut reader = BufReader::new(stdout);
    loop {
        let mut content_length = 0;
        let mut line = String::new();
        if let Ok(bytes_read) = reader.read_line(&mut line) {
            if bytes_read == 0 {
                break; // EOF
            }
            if let Some(stripped) = line.strip_prefix("Content-Length: ") {
                if let Ok(len) = stripped.trim().parse() {
                    content_length = len;
                }
            }
        } else {
            break;
        }

        // Read the empty line separator
        line.clear();
        if reader.read_line(&mut line).is_err() {
            break;
        }

        if content_length > 0 {
            let mut content = vec![0; content_length];
            if reader.read_exact(&mut content).is_err() {
                break;
            }
            let msg: Value = match serde_json::from_slice(&content) {
                Ok(msg) => msg,
                Err(_) => continue, // Ignore malformed messages
            };

            // Check for notifications
            if let Some(method) = msg.get("method").and_then(|m| m.as_str()) {
                if method == "textDocument/publishDiagnostics" {
                    if let Ok(params) = PublishDiagnosticsParams::deserialize(
                        msg.get("params").unwrap_or(&Value::Null),
                    ) {
                        if tx.send(LspMessage::Diagnostics(params)).is_err() {
                            break;
                        }
                    }
                }
            // Check for responses
            } else if msg.get("id").is_some() {
                if let Ok(hover) = Hover::deserialize(msg.get("result").unwrap_or(&Value::Null)) {
                    if tx.send(LspMessage::Hover(hover)).is_err() {
                        break;
                    }
                }
            }
        }
        line.clear();
    }
}
