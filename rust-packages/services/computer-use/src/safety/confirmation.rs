//! Action Confirmation System
//!
//! Provides safety controls for high-stakes actions including:
//! - Risk-based action classification
//! - User confirmation prompts
//! - Quarantine mode for sensitive operations
//! - Audit logging
//! - Automatic escalation

use crate::error::{Error, Result};
use crate::protocol::Action;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex, oneshot};
use tokio::time::{Duration, timeout};

/// Risk level for an action
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, PartialOrd, Ord)]
pub enum RiskLevel {
    /// No risk, can execute automatically
    None,
    /// Low risk, log but execute
    Low,
    /// Medium risk, may require confirmation based on policy
    Medium,
    /// High risk, always require confirmation
    High,
    /// Critical risk, require multiple confirmations or human-in-the-loop
    Critical,
}

/// Action categories for risk assessment
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ActionCategory {
    Navigation,
    DataEntry,
    FileOperation,
    SystemChange,
    NetworkOperation,
    Financial,
    Destructive,
    Security,
    ExternalCommunication,
}

/// Confirmation policy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfirmationPolicy {
    /// Default risk level for unknown actions
    pub default_risk_level: RiskLevel,
    /// Risk thresholds by category
    pub category_thresholds: HashMap<ActionCategory, RiskLevel>,
    /// Specific action risk levels
    pub action_risks: HashMap<String, RiskLevel>,
    /// Require confirmation for risk levels >= this
    pub confirmation_threshold: RiskLevel,
    /// Auto-approve when in this mode
    pub auto_approve: bool,
    /// Quarantine mode - all actions require confirmation
    pub quarantine_mode: bool,
    /// Escalation settings
    pub escalation: EscalationConfig,
    /// Time window for batch approvals (seconds)
    pub batch_approval_window_secs: u64,
}

impl Default for ConfirmationPolicy {
    fn default() -> Self {
        let mut category_thresholds = HashMap::new();
        category_thresholds.insert(ActionCategory::Navigation, RiskLevel::None);
        category_thresholds.insert(ActionCategory::DataEntry, RiskLevel::Low);
        category_thresholds.insert(ActionCategory::FileOperation, RiskLevel::Medium);
        category_thresholds.insert(ActionCategory::SystemChange, RiskLevel::High);
        category_thresholds.insert(ActionCategory::NetworkOperation, RiskLevel::Medium);
        category_thresholds.insert(ActionCategory::Financial, RiskLevel::Critical);
        category_thresholds.insert(ActionCategory::Destructive, RiskLevel::Critical);
        category_thresholds.insert(ActionCategory::Security, RiskLevel::High);
        category_thresholds.insert(ActionCategory::ExternalCommunication, RiskLevel::High);

        let mut action_risks = HashMap::new();
        action_risks.insert("click".to_string(), RiskLevel::None);
        action_risks.insert("type".to_string(), RiskLevel::Low);
        action_risks.insert("delete".to_string(), RiskLevel::High);
        action_risks.insert("kill".to_string(), RiskLevel::High);
        action_risks.insert("launch".to_string(), RiskLevel::Low);

        Self {
            default_risk_level: RiskLevel::Medium,
            category_thresholds,
            action_risks,
            confirmation_threshold: RiskLevel::High,
            auto_approve: false,
            quarantine_mode: false,
            escalation: EscalationConfig::default(),
            batch_approval_window_secs: 300,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EscalationConfig {
    /// Number of consecutive rejections before escalation
    pub rejection_threshold: u32,
    /// Risk level that triggers immediate escalation
    pub immediate_escalation_level: RiskLevel,
    /// Whether to notify on escalation
    pub notify_on_escalation: bool,
    /// Callback URL for escalation
    pub escalation_callback_url: Option<String>,
}

impl Default for EscalationConfig {
    fn default() -> Self {
        Self {
            rejection_threshold: 3,
            immediate_escalation_level: RiskLevel::Critical,
            notify_on_escalation: true,
            escalation_callback_url: None,
        }
    }
}

/// Confirmation request sent to user
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfirmationRequest {
    pub request_id: String,
    pub action: Action,
    pub action_params: serde_json::Value,
    pub risk_level: RiskLevel,
    pub category: ActionCategory,
    pub description: String,
    pub context: ActionContext,
    pub timestamp: u64,
    pub timeout_secs: u64,
    pub suggested_action: SuggestedAction,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionContext {
    pub current_application: String,
    pub active_window_title: String,
    pub recent_actions: Vec<String>,
    pub session_duration_secs: u64,
    pub is_first_time_action: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SuggestedAction {
    Approve,
    Reject,
    Modify(serde_json::Value),
    RequestHuman,
}

/// User response to confirmation request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConfirmationResponse {
    Approved { approved_by: String, approval_method: ApprovalMethod },
    Rejected { rejected_by: String, reason: Option<String> },
    Modified { modified_params: serde_json::Value, approved_by: String },
    Timeout,
    Escalated { escalated_to: String, reason: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ApprovalMethod {
    Password(String),
    Biometric,
    HardwareKey,
    TOTP(String),
    SimpleConfirmation,
}

/// Result of confirmation process
#[derive(Debug, Clone)]
pub enum ConfirmationResult {
    /// Action is approved and can proceed
    Approved { response: ConfirmationResponse },
    /// Action is rejected
    Rejected { response: ConfirmationResponse },
    /// Action params were modified
    Modified { new_params: serde_json::Value },
    /// Confirmation timed out
    Timeout,
    /// Action was escalated
    Escalated { to: String },
}

/// Action confirmation manager
pub struct ActionConfirmationManager {
    policy: Arc<Mutex<ConfirmationPolicy>>,
    /// Pending confirmation requests
    pending_requests: Arc<Mutex<HashMap<String, oneshot::Sender<ConfirmationResponse>>>>,
    /// Statistics
    stats: Arc<Mutex<ConfirmationStats>>,
    /// Notification channel
    notification_tx: mpsc::Sender<ConfirmationRequest>,
    /// Audit log
    audit_log: Arc<Mutex<Vec<AuditEntry>>>,
    /// Batch approval tracking
    batch_approvals: Arc<Mutex<HashMap<String, BatchApproval>>>,
}

#[derive(Debug, Clone)]
struct ConfirmationStats {
    total_requests: u64,
    auto_approved: u64,
    user_approved: u64,
    rejected: u64,
    timed_out: u64,
    escalated: u64,
}

#[derive(Debug, Clone)]
struct AuditEntry {
    timestamp: u64,
    request_id: String,
    action: String,
    risk_level: RiskLevel,
    decision: String,
    user: Option<String>,
    reason: Option<String>,
}

#[derive(Debug, Clone)]
struct BatchApproval {
    pattern_hash: String,
    risk_level: RiskLevel,
    approved_at: u64,
    expires_at: u64,
    approved_by: String,
}

impl ActionConfirmationManager {
    pub fn new(policy: ConfirmationPolicy) -> (Self, mpsc::Receiver<ConfirmationRequest>) {
        let (notification_tx, notification_rx) = mpsc::channel(100);
        
        let manager = Self {
            policy: Arc::new(Mutex::new(policy)),
            pending_requests: Arc::new(Mutex::new(HashMap::new())),
            stats: Arc::new(Mutex::new(ConfirmationStats {
                total_requests: 0,
                auto_approved: 0,
                user_approved: 0,
                rejected: 0,
                timed_out: 0,
                escalated: 0,
            })),
            notification_tx,
            audit_log: Arc::new(Mutex::new(vec![])),
            batch_approvals: Arc::new(Mutex::new(HashMap::new())),
        };

        (manager, notification_rx)
    }

    /// Assess risk level for an action
    pub async fn assess_risk(&self, action: &Action, params: &serde_json::Value) -> (RiskLevel, ActionCategory) {
        let policy = self.policy.lock().await;
        
        // Get category for this action
        let category = self.categorize_action(action);
        
        // Check specific action risk
        let action_name = format!("{:?}", action).to_lowercase();
        if let Some(&risk) = policy.action_risks.get(&action_name) {
            return (risk, category);
        }
        
        // Check category threshold
        if let Some(&risk) = policy.category_thresholds.get(&category) {
            return (risk, category);
        }
        
        // Check for high-risk parameters
        let risk = self.assess_param_risk(action, params, policy.default_risk_level);
        
        (risk, category)
    }

    /// Request confirmation for an action
    pub async fn request_confirmation(
        &self,
        action: Action,
        params: serde_json::Value,
        context: ActionContext,
    ) -> Result<ConfirmationResult> {
        let policy = self.policy.lock().await;
        
        // Check if we're in quarantine mode
        if policy.quarantine_mode {
            drop(policy);
            return self.send_confirmation_request(action, params, context).await;
        }
        
        // Assess risk
        let (risk_level, category) = self.assess_risk(&action, &params).await;
        
        // Check auto-approve settings
        if policy.auto_approve && risk_level < policy.confirmation_threshold {
            self.stats.lock().await.auto_approved += 1;
            return Ok(ConfirmationResult::Approved {
                response: ConfirmationResponse::Approved {
                    approved_by: "auto".to_string(),
                    approval_method: ApprovalMethod::SimpleConfirmation,
                },
            });
        }
        
        // Check if below confirmation threshold
        if risk_level < policy.confirmation_threshold {
            self.stats.lock().await.auto_approved += 1;
            return Ok(ConfirmationResult::Approved {
                response: ConfirmationResponse::Approved {
                    approved_by: "threshold".to_string(),
                    approval_method: ApprovalMethod::SimpleConfirmation,
                },
            });
        }
        
        // Check for batch approval
        let pattern_hash = self.compute_pattern_hash(&action, &params);
        let batch_approvals = self.batch_approvals.lock().await;
        if let Some(approval) = batch_approvals.get(&pattern_hash) {
            let now = current_timestamp();
            if approval.expires_at > now && approval.risk_level == risk_level {
                drop(batch_approvals);
                self.stats.lock().await.auto_approved += 1;
                return Ok(ConfirmationResult::Approved {
                    response: ConfirmationResponse::Approved {
                        approved_by: format!("batch: {}", approval.approved_by),
                        approval_method: ApprovalMethod::SimpleConfirmation,
                    },
                });
            }
        }
        drop(batch_approvals);
        drop(policy);
        
        // Send confirmation request
        self.send_confirmation_request_with_risk(action, params, context, risk_level, category).await
    }

    async fn send_confirmation_request(
        &self,
        action: Action,
        params: serde_json::Value,
        context: ActionContext,
    ) -> Result<ConfirmationResult> {
        let (risk_level, category) = self.assess_risk(&action, &params).await;
        self.send_confirmation_request_with_risk(action, params, context, risk_level, category).await
    }

    async fn send_confirmation_request_with_risk(
        &self,
        action: Action,
        params: serde_json::Value,
        context: ActionContext,
        risk_level: RiskLevel,
        category: ActionCategory,
    ) -> Result<ConfirmationResult> {
        let request_id = uuid::Uuid::new_uuid().to_string();
        let (tx, rx) = oneshot::channel();
        
        self.pending_requests.lock().await.insert(request_id.clone(), tx);
        
        let description = self.describe_action(&action, &params);
        
        let request = ConfirmationRequest {
            request_id: request_id.clone(),
            action: action.clone(),
            action_params: params.clone(),
            risk_level,
            category,
            description,
            context,
            timestamp: current_timestamp(),
            timeout_secs: 60,
            suggested_action: SuggestedAction::Approve,
        };
        
        // Send notification
        let _ = self.notification_tx.send(request).await;
        
        self.stats.lock().await.total_requests += 1;
        
        // Wait for response with timeout
        let policy = self.policy.lock().await;
        let timeout_duration = Duration::from_secs(request.timeout_secs);
        drop(policy);
        
        match timeout(timeout_duration, rx).await {
            Ok(Ok(response)) => {
                self.handle_response(&request_id, &action, risk_level, &response).await
            }
            _ => {
                self.stats.lock().await.timed_out += 1;
                self.log_audit(&request_id, &format!("{:?}", action), risk_level, "timeout", None, None).await;
                Ok(ConfirmationResult::Timeout)
            }
        }
    }

    /// Handle user response
    async fn handle_response(
        &self,
        request_id: &str,
        action: &Action,
        risk_level: RiskLevel,
        response: &ConfirmationResponse,
    ) -> Result<ConfirmationResult> {
        match response {
            ConfirmationResponse::Approved { approved_by, .. } => {
                self.stats.lock().await.user_approved += 1;
                self.log_audit(request_id, &format!("{:?}", action), risk_level, "approved", Some(approved_by.clone()), None).await;
                
                // Record batch approval for future similar actions
                let policy = self.policy.lock().await;
                if risk_level >= policy.confirmation_threshold {
                    let pattern_hash = self.compute_pattern_hash(action, &serde_json::json!({}));
                    let now = current_timestamp();
                    let batch = BatchApproval {
                        pattern_hash: pattern_hash.clone(),
                        risk_level,
                        approved_at: now,
                        expires_at: now + (policy.batch_approval_window_secs * 1000),
                        approved_by: approved_by.clone(),
                    };
                    self.batch_approvals.lock().await.insert(pattern_hash, batch);
                }
                
                Ok(ConfirmationResult::Approved { response: response.clone() })
            }
            ConfirmationResponse::Rejected { rejected_by, reason } => {
                self.stats.lock().await.rejected += 1;
                self.log_audit(request_id, &format!("{:?}", action), risk_level, "rejected", Some(rejected_by.clone()), reason.clone()).await;
                
                // Check for escalation
                let stats = self.stats.lock().await;
                let policy = self.policy.lock().await;
                if stats.rejected >= policy.escalation.rejection_threshold as u64 {
                    drop(stats);
                    drop(policy);
                    return Ok(ConfirmationResult::Escalated { to: "admin".to_string() });
                }
                
                Ok(ConfirmationResult::Rejected { response: response.clone() })
            }
            ConfirmationResponse::Modified { modified_params, approved_by } => {
                self.stats.lock().await.user_approved += 1;
                self.log_audit(request_id, &format!("{:?}", action), risk_level, "modified", Some(approved_by.clone()), None).await;
                Ok(ConfirmationResult::Modified { new_params: modified_params.clone() })
            }
            ConfirmationResponse::Escalated { escalated_to, .. } => {
                self.stats.lock().await.escalated += 1;
                self.log_audit(request_id, &format!("{:?}", action), risk_level, "escalated", None, None).await;
                Ok(ConfirmationResult::Escalated { to: escalated_to.clone() })
            }
            ConfirmationResponse::Timeout => {
                self.stats.lock().await.timed_out += 1;
                Ok(ConfirmationResult::Timeout)
            }
        }
    }

    /// Submit user response to a pending confirmation
    pub async fn submit_response(&self, request_id: &str, response: ConfirmationResponse) -> Result<()> {
        if let Some(tx) = self.pending_requests.lock().await.remove(request_id) {
            let _ = tx.send(response);
        }
        Ok(())
    }

    /// Get current statistics
    pub async fn get_stats(&self) -> ConfirmationStats {
        self.stats.lock().await.clone()
    }

    /// Get audit log
    pub async fn get_audit_log(&self, limit: usize) -> Vec<AuditEntry> {
        let log = self.audit_log.lock().await;
        log.iter().rev().take(limit).cloned().collect()
    }

    /// Update policy
    pub async fn update_policy(&self, policy: ConfirmationPolicy) {
        *self.policy.lock().await = policy;
    }

    /// Enable quarantine mode
    pub async fn enable_quarantine(&self) {
        self.policy.lock().await.quarantine_mode = true;
    }

    /// Disable quarantine mode
    pub async fn disable_quarantine(&self) {
        self.policy.lock().await.quarantine_mode = false;
    }

    /// Cancel all pending requests
    pub async fn cancel_all_pending(&self) {
        let mut pending = self.pending_requests.lock().await;
        for (_, tx) in pending.drain() {
            let _ = tx.send(ConfirmationResponse::Rejected {
                rejected_by: "system".to_string(),
                reason: Some("Cancelled by system".to_string()),
            });
        }
    }

    // Helper methods
    fn categorize_action(&self, action: &Action) -> ActionCategory {
        match action {
            Action::Click | Action::Move | Action::Swipe => ActionCategory::Navigation,
            Action::Type | Action::Press | Action::KeyDown | Action::KeyUp => ActionCategory::DataEntry,
            Action::Snapshot | Action::Screenshot | Action::Ocr => ActionCategory::Navigation,
            Action::Launch | Action::Kill | Action::HandleFileDialog => ActionCategory::SystemChange,
            Action::SetClipboard | Action::GetClipboard => ActionCategory::DataEntry,
            Action::FocusWindow | Action::Minimize | Action::Maximize | Action::Close => ActionCategory::SystemChange,
            _ => ActionCategory::Navigation,
        }
    }

    fn assess_param_risk(&self, _action: &Action, params: &serde_json::Value, default: RiskLevel) -> RiskLevel {
        // Check for high-risk parameters
        let params_str = params.to_string().to_lowercase();
        
        if params_str.contains("delete") || params_str.contains("remove") || params_str.contains("format") {
            return RiskLevel::High;
        }
        if params_str.contains("password") || params_str.contains("secret") || params_str.contains("token") {
            return RiskLevel::Critical;
        }
        if params_str.contains("payment") || params_str.contains("purchase") || params_str.contains("$") {
            return RiskLevel::Critical;
        }
        if params_str.contains("email") || params_str.contains("send") {
            return RiskLevel::High;
        }
        
        default
    }

    fn describe_action(&self, action: &Action, params: &serde_json::Value) -> String {
        let action_str = format!("{:?}", action);
        let params_str = params.to_string();
        format!("{} with params: {}", action_str, params_str)
    }

    fn compute_pattern_hash(&self, action: &Action, params: &serde_json::Value) -> String {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};
        
        let mut hasher = DefaultHasher::new();
        format!("{:?}", action).hash(&mut hasher);
        params.to_string().hash(&mut hasher);
        format!("{:x}", hasher.finish())
    }

    async fn log_audit(&self, request_id: &str, action: &str, risk_level: RiskLevel, decision: &str, user: Option<String>, reason: Option<String>) {
        let entry = AuditEntry {
            timestamp: current_timestamp(),
            request_id: request_id.to_string(),
            action: action.to_string(),
            risk_level,
            decision: decision.to_string(),
            user,
            reason,
        };
        self.audit_log.lock().await.push(entry);
    }
}

fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

impl Default for ConfirmationStats {
    fn default() -> Self {
        Self {
            total_requests: 0,
            auto_approved: 0,
            user_approved: 0,
            rejected: 0,
            timed_out: 0,
            escalated: 0,
        }
    }
}

/// Helper to create high-security policy
pub fn high_security_policy() -> ConfirmationPolicy {
    ConfirmationPolicy {
        confirmation_threshold: RiskLevel::Low,
        quarantine_mode: false,
        ..Default::default()
    }
}

/// Helper to create permissive policy (for trusted environments)
pub fn permissive_policy() -> ConfirmationPolicy {
    let mut policy = ConfirmationPolicy::default();
    policy.confirmation_threshold = RiskLevel::Critical;
    policy.auto_approve = true;
    policy
}
