//! services/debug_service.rs

use crate::types::debug::DebugMessage;
use futures_util::{SinkExt, StreamExt};
use std::sync::{Arc, Mutex};
use tokio::sync::broadcast;
use warp::ws::{Message, WebSocket};
use warp::Filter;

/// Manages the WebSocket server for the real-time visual debugger.
#[derive(Clone)]
pub struct DebugService {
    tx: broadcast::Sender<String>,
}

impl DebugService {
    /// Creates a new `DebugService` and starts its server.
    pub fn new() -> Self {
        let (tx, _) = broadcast::channel(100);
        let tx_clone = tx.clone();

        tokio::spawn(async move {
            let ws_route = warp::path("ws")
                .and(warp::ws())
                .map(move |ws: warp::ws::Ws| {
                    let tx = tx_clone.clone();
                    ws.on_upgrade(move |websocket| handle_connection(websocket, tx))
                });

            warp::serve(ws_route).run(([127, 0, 0, 1], 3030)).await;
        });

        Self { tx }
    }

    /// Broadcasts a debug message to all connected clients.
    pub fn broadcast(&self, message: &DebugMessage) {
        let payload = serde_json::to_string(message).unwrap();
        if self.tx.send(payload).is_err() {
            // No receivers, which is fine.
        }
    }
}

async fn handle_connection(websocket: WebSocket, tx: broadcast::Sender<String>) {
    let (mut ws_tx, _) = websocket.split();
    let mut rx = tx.subscribe();

    while let Ok(msg) = rx.recv().await {
        if ws_tx.send(Message::text(msg)).await.is_err() {
            // Client disconnected.
            break;
        }
    }
}

impl Default for DebugService {
    fn default() -> Self {
        Self::new()
    }
}
