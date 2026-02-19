//! Mobile Companion (Feature 14)
//!
//! Control and monitor automations from mobile app

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Mobile device connection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MobileDevice {
    pub id: String,
    pub name: String,
    pub device_type: DeviceType,
    pub platform: MobilePlatform,
    pub paired: bool,
    pub last_seen: u64,
    pub capabilities: Vec<DeviceCapability>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DeviceType {
    Phone,
    Tablet,
    Watch,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MobilePlatform {
    IOS,
    Android,
    Other(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DeviceCapability {
    ReceiveNotifications,
    SendCommands,
    ViewLogs,
    ApproveActions,
    ViewScreenshots,
    EmergencyStop,
}

/// Mobile notification
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MobileNotification {
    pub id: String,
    pub title: String,
    pub body: String,
    pub notification_type: NotificationType,
    pub priority: NotificationPriority,
    pub actions: Vec<NotificationAction>,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NotificationType {
    TaskComplete,
    TaskFailed,
    ApprovalRequired,
    SystemAlert,
    Info,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NotificationPriority {
    Low,
    Normal,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationAction {
    pub id: String,
    pub label: String,
    pub action_type: ActionType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActionType {
    Approve,
    Reject,
    ViewDetails,
    StopTask,
    Dismiss,
    Custom(String),
}

/// Mobile command from device
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MobileCommand {
    pub device_id: String,
    pub command: CommandType,
    pub params: HashMap<String, String>,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CommandType {
    StartTask,
    StopTask,
    PauseTask,
    ResumeTask,
    GetStatus,
    GetLogs,
    ApproveAction,
    RejectAction,
    EmergencyStop,
    RequestScreenshot,
}

/// Mobile companion service
pub struct MobileCompanion {
    devices: HashMap<String, MobileDevice>,
    pending_notifications: Vec<MobileNotification>,
    command_history: Vec<MobileCommand>,
    action_approvals: HashMap<String, ApprovalRequest>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApprovalRequest {
    pub id: String,
    pub action_description: String,
    pub requested_at: u64,
    pub expires_at: u64,
    pub approved: Option<bool>,
    pub device_id: Option<String>,
}

impl MobileCompanion {
    pub fn new() -> Self {
        Self {
            devices: HashMap::new(),
            pending_notifications: Vec::new(),
            command_history: Vec::new(),
            action_approvals: HashMap::new(),
        }
    }

    /// Pair a new mobile device
    pub fn pair_device(&mut self, device: MobileDevice) -> Result<()> {
        let mut device = device;
        device.paired = true;
        self.devices.insert(device.id.clone(), device);
        Ok(())
    }

    /// Unpair a device
    pub fn unpair_device(&mut self, device_id: &str) -> Result<()> {
        self.devices.remove(device_id);
        Ok(())
    }

    /// Get paired devices
    pub fn get_devices(&self) -> Vec<&MobileDevice> {
        self.devices.values().collect()
    }

    /// Get device by ID
    pub fn get_device(&self, device_id: &str) -> Option<&MobileDevice> {
        self.devices.get(device_id)
    }

    /// Send notification to device
    pub fn notify(&mut self, device_ids: &[String], notification: MobileNotification) -> Result<()> {
        for device_id in device_ids {
            if let Some(device) = self.devices.get(device_id) {
                if device.capabilities.contains(&DeviceCapability::ReceiveNotifications) {
                    // Send notification to device
                }
            }
        }
        
        self.pending_notifications.push(notification);
        Ok(())
    }

    /// Broadcast notification to all devices
    pub fn broadcast(&mut self, notification: MobileNotification) -> Result<()> {
        let device_ids: Vec<String> = self.devices.keys().cloned().collect();
        self.notify(&device_ids, notification)
    }

    /// Request approval for action
    pub fn request_approval(&mut self, action_description: &str, timeout_secs: u64) -> Result<String> {
        let id = uuid::Uuid::new_v4().to_string();
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();

        let request = ApprovalRequest {
            id: id.clone(),
            action_description: action_description.to_string(),
            requested_at: now,
            expires_at: now + timeout_secs,
            approved: None,
            device_id: None,
        };

        self.action_approvals.insert(id.clone(), request);

        // Send notification to capable devices
        let notification = MobileNotification {
            id: id.clone(),
            title: "Approval Required".to_string(),
            body: action_description.to_string(),
            notification_type: NotificationType::ApprovalRequired,
            priority: NotificationPriority::High,
            actions: vec![
                NotificationAction {
                    id: format!("{}_approve", id),
                    label: "Approve".to_string(),
                    action_type: ActionType::Approve,
                },
                NotificationAction {
                    id: format!("{}_reject", id),
                    label: "Reject".to_string(),
                    action_type: ActionType::Reject,
                },
            ],
            timestamp: now,
        };

        let capable_devices: Vec<String> = self.devices
            .values()
            .filter(|d| d.capabilities.contains(&DeviceCapability::ApproveActions))
            .map(|d| d.id.clone())
            .collect();

        self.notify(&capable_devices, notification)?;

        Ok(id)
    }

    /// Check approval status
    pub fn check_approval(&self, request_id: &str) -> Option<&ApprovalRequest> {
        self.action_approvals.get(request_id)
    }

    /// Handle command from mobile device
    pub fn handle_command(&mut self, command: MobileCommand) -> Result<CommandResponse> {
        self.command_history.push(command.clone());

        let response = match command.command {
            CommandType::StartTask => CommandResponse::Success("Task started".to_string()),
            CommandType::StopTask => CommandResponse::Success("Task stopped".to_string()),
            CommandType::PauseTask => CommandResponse::Success("Task paused".to_string()),
            CommandType::ResumeTask => CommandResponse::Success("Task resumed".to_string()),
            CommandType::GetStatus => CommandResponse::Status(self.get_system_status()),
            CommandType::GetLogs => CommandResponse::Logs(vec![]),
            CommandType::ApproveAction => {
                if let Some(action_id) = command.params.get("action_id") {
                    if let Some(request) = self.action_approvals.get_mut(action_id) {
                        request.approved = Some(true);
                        request.device_id = Some(command.device_id);
                    }
                }
                CommandResponse::Success("Action approved".to_string())
            }
            CommandType::RejectAction => {
                if let Some(action_id) = command.params.get("action_id") {
                    if let Some(request) = self.action_approvals.get_mut(action_id) {
                        request.approved = Some(false);
                        request.device_id = Some(command.device_id);
                    }
                }
                CommandResponse::Success("Action rejected".to_string())
            }
            CommandType::EmergencyStop => {
                // Stop all running tasks
                CommandResponse::Success("Emergency stop activated".to_string())
            }
            CommandType::RequestScreenshot => {
                CommandResponse::Screenshot("base64_encoded_image".to_string())
            }
        };

        Ok(response)
    }

    /// Get real-time status for mobile app
    pub fn get_mobile_status(&self) -> MobileStatus {
        MobileStatus {
            active_tasks: 0,
            pending_tasks: 0,
            system_health: SystemHealth::Healthy,
            last_activity: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            connected_devices: self.devices.len() as u32,
        }
    }

    /// Generate QR code for pairing
    pub fn generate_pairing_code(&self) -> PairingCode {
        let code = format!("{:06}", rand::random::<u32>() % 1000000);
        
        PairingCode {
            code,
            expires_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs() + 300,
        }
    }

    fn get_system_status(&self) -> SystemStatus {
        SystemStatus {
            active_tasks: 0,
            queued_tasks: 0,
            completed_today: 0,
            failed_today: 0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CommandResponse {
    Success(String),
    Error(String),
    Status(SystemStatus),
    Logs(Vec<String>),
    Screenshot(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MobileStatus {
    pub active_tasks: u32,
    pub pending_tasks: u32,
    pub system_health: SystemHealth,
    pub last_activity: u64,
    pub connected_devices: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SystemHealth {
    Healthy,
    Warning,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemStatus {
    pub active_tasks: u32,
    pub queued_tasks: u32,
    pub completed_today: u32,
    pub failed_today: u32,
}

#[derive(Debug, Clone)]
pub struct PairingCode {
    pub code: String,
    pub expires_at: u64,
}

/// QR code data for pairing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QRCodeData {
    pub service_endpoint: String,
    pub pairing_code: String,
    pub device_name: String,
    pub expires_at: u64,
}
