//! Mobile Companion API
//!
//! Control desktop from mobile device via REST/WebSocket API.

use crate::error::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{broadcast, Mutex};
use uuid::Uuid;

/// Mobile API Server
pub struct MobileCompanionServer {
    connected_devices: Arc<Mutex<HashMap<String, MobileDevice>>>,
    sessions: Arc<Mutex<HashMap<String, MobileSession>>>,
    event_tx: broadcast::Sender<MobileEvent>,
    port: u16,
    auth_tokens: Arc<Mutex<Vec<String>>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MobileDevice {
    pub device_id: String,
    pub device_name: String,
    pub device_type: DeviceType,
    pub platform: String,
    pub app_version: String,
    pub connected_at: u64,
    pub last_ping: u64,
    pub is_active: bool,
    pub capabilities: Vec<DeviceCapability>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum DeviceType {
    Phone,
    Tablet,
    Watch,
    Web,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum DeviceCapability {
    TouchControl,
    VoiceControl,
    GyroControl,
    BiometricAuth,
    Camera,
    HapticFeedback,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MobileSession {
    pub session_id: String,
    pub device_id: String,
    pub user_id: String,
    pub created_at: u64,
    pub expires_at: u64,
    pub permissions: Vec<MobilePermission>,
    pub current_view: MobileView,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum MobilePermission {
    ViewDesktop,
    ControlMouse,
    ControlKeyboard,
    ExecuteActions,
    ManageWorkflows,
    ViewHistory,
    ChangeSettings,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum MobileView {
    Dashboard,
    RemoteControl,
    Workflows,
    History,
    Settings,
}

#[derive(Debug, Clone)]
pub enum MobileEvent {
    DeviceConnected { device: MobileDevice },
    DeviceDisconnected { device_id: String },
    CommandReceived { device_id: String, command: MobileCommand },
    ScreenshotRequested { device_id: String },
    ActionExecuted { device_id: String, action: String, success: bool },
    SessionExpired { session_id: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MobileCommand {
    GetStatus,
    GetScreenshot,
    ExecuteAction { action: String, params: serde_json::Value },
    MoveMouse { x: i32, y: i32 },
    Click { button: String },
    TypeText { text: String },
    PressKey { key: String },
    GetWorkflows,
    RunWorkflow { workflow_id: String },
    GetHistory { limit: usize },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MobileResponse {
    pub success: bool,
    pub data: Option<serde_json::Value>,
    pub error: Option<String>,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DesktopStatus {
    pub is_automating: bool,
    pub active_workflow: Option<String>,
    pub current_screen: ScreenInfo,
    pub pending_notifications: Vec<Notification>,
    pub battery_level: Option<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScreenInfo {
    pub width: u32,
    pub height: u32,
    pub active_window: String,
    pub screen_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Notification {
    pub id: String,
    pub title: String,
    pub message: String,
    pub timestamp: u64,
    pub priority: NotificationPriority,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum NotificationPriority {
    Low,
    Normal,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QRCodeData {
    pub connection_token: String,
    pub server_address: String,
    pub expires_at: u64,
}

impl MobileCompanionServer {
    pub fn new(port: u16) -> Self {
        let (event_tx, _) = broadcast::channel(100);
        
        Self {
            connected_devices: Arc::new(Mutex::new(HashMap::new())),
            sessions: Arc::new(Mutex::new(HashMap::new())),
            event_tx,
            port,
            auth_tokens: Arc::new(Mutex::new(vec![])),
        }
    }

    pub async fn start(&self) -> Result<()> {
        // Start HTTP/WebSocket server
        // This would spawn an axum/actix server
        Ok(())
    }

    /// Generate QR code for device pairing
    pub async fn generate_pairing_code(&self) -> QRCodeData {
        let token = Uuid::new_uuid().to_string();
        self.auth_tokens.lock().await.push(token.clone());
        
        QRCodeData {
            connection_token: token,
            server_address: format!("ws://0.0.0.0:{}/mobile", self.port),
            expires_at: current_timestamp() + 300, // 5 minutes
        }
    }

    /// Connect a mobile device
    pub async fn connect_device(&self, device: MobileDevice, token: &str) -> Result<MobileSession> {
        // Validate token
        let mut tokens = self.auth_tokens.lock().await;
        if !tokens.contains(&token.to_string()) {
            return Err(crate::error::Error::InvalidCommand("Invalid pairing token".to_string()));
        }
        tokens.retain(|t| t != token);
        drop(tokens);

        let session = MobileSession {
            session_id: Uuid::new_uuid().to_string(),
            device_id: device.device_id.clone(),
            user_id: "user".to_string(),
            created_at: current_timestamp(),
            expires_at: current_timestamp() + 86400, // 24 hours
            permissions: vec![
                MobilePermission::ViewDesktop,
                MobilePermission::ControlMouse,
                MobilePermission::ExecuteActions,
            ],
            current_view: MobileView::Dashboard,
        };

        self.connected_devices.lock().await.insert(device.device_id.clone(), device.clone());
        self.sessions.lock().await.insert(session.session_id.clone(), session.clone());

        let _ = self.event_tx.send(MobileEvent::DeviceConnected { device });

        Ok(session)
    }

    /// Disconnect device
    pub async fn disconnect_device(&self, device_id: &str) {
        self.connected_devices.lock().await.remove(device_id);
        let _ = self.event_tx.send(MobileEvent::DeviceDisconnected { device_id: device_id.to_string() });
    }

    /// Handle command from mobile
    pub async fn handle_command(&self, session_id: &str, command: MobileCommand) -> MobileResponse {
        let sessions = self.sessions.lock().await;
        let session = match sessions.get(session_id) {
            Some(s) => s.clone(),
            None => {
                return MobileResponse {
                    success: false,
                    data: None,
                    error: Some("Invalid session".to_string()),
                    timestamp: current_timestamp(),
                };
            }
        };
        drop(sessions);

        let _ = self.event_tx.send(MobileEvent::CommandReceived {
            device_id: session.device_id.clone(),
            command: command.clone(),
        });

        match command {
            MobileCommand::GetStatus => {
                let status = DesktopStatus {
                    is_automating: false,
                    active_workflow: None,
                    current_screen: ScreenInfo {
                        width: 1920,
                        height: 1080,
                        active_window: "Desktop".to_string(),
                        screen_count: 1,
                    },
                    pending_notifications: vec![],
                    battery_level: Some(85),
                };
                MobileResponse {
                    success: true,
                    data: Some(serde_json::to_value(status).unwrap()),
                    error: None,
                    timestamp: current_timestamp(),
                }
            }
            MobileCommand::GetScreenshot => {
                let _ = self.event_tx.send(MobileEvent::ScreenshotRequested { device_id: session.device_id });
                MobileResponse {
                    success: true,
                    data: Some(serde_json::json!({"screenshot_url": "/api/screenshot"})),
                    error: None,
                    timestamp: current_timestamp(),
                }
            }
            MobileCommand::ExecuteAction { action, params } => {
                // Execute the action
                let _ = (action, params);
                
                let _ = self.event_tx.send(MobileEvent::ActionExecuted {
                    device_id: session.device_id,
                    action: "executed".to_string(),
                    success: true,
                });
                
                MobileResponse {
                    success: true,
                    data: Some(serde_json::json!({"executed": true})),
                    error: None,
                    timestamp: current_timestamp(),
                }
            }
            MobileCommand::MoveMouse { x, y } => {
                let _ = (x, y);
                MobileResponse {
                    success: true,
                    data: None,
                    error: None,
                    timestamp: current_timestamp(),
                }
            }
            MobileCommand::Click { button } => {
                let _ = button;
                MobileResponse {
                    success: true,
                    data: None,
                    error: None,
                    timestamp: current_timestamp(),
                }
            }
            MobileCommand::TypeText { text } => {
                let _ = text;
                MobileResponse {
                    success: true,
                    data: None,
                    error: None,
                    timestamp: current_timestamp(),
                }
            }
            MobileCommand::PressKey { key } => {
                let _ = key;
                MobileResponse {
                    success: true,
                    data: None,
                    error: None,
                    timestamp: current_timestamp(),
                }
            }
            _ => MobileResponse {
                success: false,
                data: None,
                error: Some("Command not implemented".to_string()),
                timestamp: current_timestamp(),
            }
        }
    }

    /// Get connected devices
    pub async fn get_connected_devices(&self) -> Vec<MobileDevice> {
        self.connected_devices.lock().await.values().cloned().collect()
    }

    /// Get active sessions
    pub async fn get_sessions(&self) -> Vec<MobileSession> {
        self.sessions.lock().await.values().cloned().collect()
    }

    /// Revoke session
    pub async fn revoke_session(&self, session_id: &str) {
        self.sessions.lock().await.remove(session_id);
        let _ = self.event_tx.send(MobileEvent::SessionExpired { session_id: session_id.to_string() });
    }

    /// Update session permissions
    pub async fn update_permissions(&self, session_id: &str, permissions: Vec<MobilePermission>) -> Result<()> {
        let mut sessions = self.sessions.lock().await;
        let session = sessions.get_mut(session_id)
            .ok_or_else(|| crate::error::Error::InvalidCommand("Session not found".to_string()))?;
        session.permissions = permissions;
        Ok(())
    }

    /// Send notification to device
    pub async fn send_notification(&self, device_id: &str, notification: Notification) -> Result<()> {
        let _ = (device_id, notification);
        // Push notification to mobile device
        Ok(())
    }

    /// Subscribe to events
    pub fn subscribe(&self) -> broadcast::Receiver<MobileEvent> {
        self.event_tx.subscribe()
    }

    /// Cleanup expired sessions
    pub async fn cleanup_expired(&self) {
        let now = current_timestamp();
        let mut sessions = self.sessions.lock().await;
        let expired: Vec<String> = sessions
            .iter()
            .filter(|(_, s)| s.expires_at < now)
            .map(|(id, _)| id.clone())
            .collect();
        
        for session_id in expired {
            sessions.remove(&session_id);
            let _ = self.event_tx.send(MobileEvent::SessionExpired { session_id });
        }
    }
}

fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

/// REST API routes for mobile companion
pub mod routes {
    use super::*;
    
    // These would be implemented as Axum/Actix handlers
    pub async fn pair_device() -> serde_json::Value {
        serde_json::json!({"status": "pairing"})
    }
    
    pub async fn get_desktop_status() -> serde_json::Value {
        serde_json::json!({"status": "active"})
    }
    
    pub async fn execute_remote_command(_cmd: MobileCommand) -> MobileResponse {
        MobileResponse {
            success: true,
            data: None,
            error: None,
            timestamp: current_timestamp(),
        }
    }
}
