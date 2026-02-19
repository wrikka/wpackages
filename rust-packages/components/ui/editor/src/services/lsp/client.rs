use super::LspMessage;
use crate::types::OpenFileTab;
use lsp_types::{
    ClientCapabilities, DidChangeTextDocumentParams, DidOpenTextDocumentParams,
    DidSaveTextDocumentParams, HoverParams, InitializeParams, Position,
    TextDocumentContentChangeEvent, TextDocumentIdentifier, TextDocumentItem,
    TextDocumentPositionParams, Url, VersionedTextDocumentIdentifier, WorkspaceFolder,
};
use serde_json::{json, Value};
use std::process::{Child, Command, Stdio};
use std::sync::mpsc::{self, Receiver, Sender};
use std::thread;

use super::transport::{reader_loop, writer_loop};

pub struct LspService {
    writer_tx: Sender<Value>,
    pub message_rx: Receiver<LspMessage>,
    request_id_counter: i64,
    _child: Child,
}

impl LspService {
    pub fn new() -> Self {
        let mut child = Command::new("rust-analyzer")
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .spawn()
            .expect("Failed to spawn rust-analyzer");

        let stdin = child.stdin.take().unwrap();
        let stdout = child.stdout.take().unwrap();

        let (writer_tx, writer_rx) = mpsc::channel::<Value>();
        let (message_tx, message_rx) = mpsc::channel::<LspMessage>();

        let _writer_thread = thread::spawn(move || writer_loop(stdin, writer_rx));
        let _reader_thread = thread::spawn(move || reader_loop(stdout, message_tx));

        let workspace_folder = WorkspaceFolder {
            uri: Url::from_file_path(std::env::current_dir().unwrap()).unwrap(),
            name: "wterminal".to_string(),
        };

        let initialize_params = InitializeParams {
            process_id: Some(std::process::id()),
            workspace_folders: Some(vec![workspace_folder]),
            capabilities: ClientCapabilities::default(),
            ..Default::default()
        };

        let request = json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": initialize_params
        });
        writer_tx.send(request).unwrap();

        Self {
            writer_tx,
            message_rx,
            request_id_counter: 1,
            _child: child,
        }
    }

    pub fn did_open(&self, tab: &OpenFileTab) {
        let params = DidOpenTextDocumentParams {
            text_document: TextDocumentItem::new(
                Url::from_file_path(tab.path.as_path()).unwrap(),
                "rust".to_string(), // This should be dynamic
                1,
                tab.text.clone(),
            ),
        };
        let notification = json!({
            "jsonrpc": "2.0",
            "method": "textDocument/didOpen",
            "params": params
        });
        self.writer_tx.send(notification).unwrap();
    }

    pub fn did_save(&self, tab: &OpenFileTab) {
        let params = DidSaveTextDocumentParams {
            text_document: TextDocumentIdentifier::new(
                Url::from_file_path(tab.path.as_path()).unwrap(),
            ),
            text: Some(tab.text.clone()),
        };
        let notification = json!({
            "jsonrpc": "2.0",
            "method": "textDocument/didSave",
            "params": params
        });
        self.writer_tx.send(notification).unwrap();
    }

    pub fn hover(&mut self, tab: &OpenFileTab, position: Position) {
        let params = HoverParams {
            text_document_position_params: TextDocumentPositionParams {
                text_document: TextDocumentIdentifier::new(
                    Url::from_file_path(tab.path.as_path()).unwrap(),
                ),
                position,
            },
            work_done_progress_params: Default::default(),
        };

        self.request_id_counter += 1;
        let request = json!({
            "jsonrpc": "2.0",
            "id": self.request_id_counter,
            "method": "textDocument/hover",
            "params": params
        });
        self.writer_tx.send(request).unwrap();
    }

    pub fn did_change(&self, tab: &OpenFileTab) {
        let params = DidChangeTextDocumentParams {
            text_document: VersionedTextDocumentIdentifier::new(
                Url::from_file_path(tab.path.as_path()).unwrap(),
                1, // Version should be tracked
            ),
            content_changes: vec![TextDocumentContentChangeEvent {
                range: None, // Sending the full text for now
                range_length: None,
                text: tab.text.clone(),
            }],
        };
        let notification = json!({
            "jsonrpc": "2.0",
            "method": "textDocument/didChange",
            "params": params
        });
        self.writer_tx.send(notification).unwrap();
    }
}

impl Default for LspService {
    fn default() -> Self {
        Self::new()
    }
}
