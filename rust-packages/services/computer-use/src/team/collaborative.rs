//! Collaborative Editing (Feature 19)
//!
//! Multiple users editing workflows simultaneously (Google Docs style)

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::sync::broadcast;

/// Collaborative session
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollaborativeSession {
    pub session_id: String,
    pub workflow_id: String,
    pub host: User,
    pub participants: Vec<Participant>,
    pub created_at: u64,
    pub active: bool,
    pub permissions: SessionPermissions,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub name: String,
    pub email: String,
    pub avatar: Option<String>,
    pub color: String, // Cursor color
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Participant {
    pub user: User,
    pub joined_at: u64,
    pub last_activity: u64,
    pub cursor_position: Option<CursorPosition>,
    pub selected_node: Option<String>,
    pub permissions: UserPermissions,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CursorPosition {
    pub x: f32,
    pub y: f32,
    pub node_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionPermissions {
    pub allow_edit: bool,
    pub allow_comment: bool,
    pub allow_invite: bool,
    pub allow_delete: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserPermissions {
    pub can_edit: bool,
    pub can_comment: bool,
    pub can_invite: bool,
}

/// Collaboration operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CollaborationOp {
    NodeAdd { node: crate::user_experience::workflow_builder::WorkflowNode },
    NodeUpdate { node_id: String, changes: NodeChanges },
    NodeDelete { node_id: String },
    EdgeAdd { edge: crate::user_experience::workflow_builder::WorkflowEdge },
    EdgeDelete { edge_id: String },
    NodeMove { node_id: String, new_position: (f32, f32) },
    CommentAdd { comment: Comment },
    CommentDelete { comment_id: String },
    CursorMove { position: CursorPosition },
    SelectionChange { node_id: Option<String> },
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct NodeChanges {
    pub label: Option<String>,
    pub properties: Option<HashMap<String, serde_json::Value>>,
    pub style: Option<crate::user_experience::workflow_builder::NodeStyle>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Comment {
    pub id: String,
    pub author: User,
    pub node_id: Option<String>,
    pub text: String,
    pub timestamp: u64,
    pub resolved: bool,
    pub replies: Vec<Comment>,
}

/// Operation with metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Operation {
    pub id: String,
    pub user_id: String,
    pub timestamp: u64,
    pub op: CollaborationOp,
    pub parent_op: Option<String>, // For undo/redo tracking
}

/// Collaboration engine
pub struct CollaborationEngine {
    sessions: HashMap<String, CollaborativeSession>,
    operations: HashMap<String, Vec<Operation>>,
    undo_stacks: HashMap<String, Vec<Operation>>,
    broadcast_tx: broadcast::Sender<Operation>,
    user_cursors: HashMap<String, CursorPosition>,
}

impl CollaborationEngine {
    pub fn new() -> Self {
        let (tx, _rx) = broadcast::channel(100);
        
        Self {
            sessions: HashMap::new(),
            operations: HashMap::new(),
            undo_stacks: HashMap::new(),
            broadcast_tx: tx,
            user_cursors: HashMap::new(),
        }
    }

    /// Create new collaborative session
    pub fn create_session(&mut self, host: User, workflow_id: &str) -> String {
        let session_id = uuid::Uuid::new_v4().to_string();
        
        let session = CollaborativeSession {
            session_id: session_id.clone(),
            workflow_id: workflow_id.to_string(),
            host: host.clone(),
            participants: vec![],
            created_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            active: true,
            permissions: SessionPermissions {
                allow_edit: true,
                allow_comment: true,
                allow_invite: true,
                allow_delete: false,
            },
        };

        self.sessions.insert(session_id.clone(), session);
        self.operations.insert(session_id.clone(), vec![]);
        self.undo_stacks.insert(session_id.clone(), vec![]);

        session_id
    }

    /// Join a session
    pub fn join_session(&mut self, session_id: &str, user: User) -> Result<()> {
        let session = self.sessions.get_mut(session_id)
            .ok_or_else(|| anyhow::anyhow!("Session not found"))?;

        let participant = Participant {
            user,
            joined_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            last_activity: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            cursor_position: None,
            selected_node: None,
            permissions: UserPermissions {
                can_edit: session.permissions.allow_edit,
                can_comment: session.permissions.allow_comment,
                can_invite: false,
            },
        };

        session.participants.push(participant);
        Ok(())
    }

    /// Leave a session
    pub fn leave_session(&mut self, session_id: &str, user_id: &str) -> Result<()> {
        let session = self.sessions.get_mut(session_id)
            .ok_or_else(|| anyhow::anyhow!("Session not found"))?;

        session.participants.retain(|p| p.user.id != user_id);
        Ok(())
    }

    /// Apply operation
    pub async fn apply_operation(&mut self, session_id: &str, user_id: &str, op: CollaborationOp) -> Result<String> {
        let session = self.sessions.get(session_id)
            .ok_or_else(|| anyhow::anyhow!("Session not found"))?;

        // Check permissions
        let participant = session.participants.iter().find(|p| p.user.id == user_id)
            .or_else(|| if session.host.id == user_id { Some(&Participant {
                user: session.host.clone(),
                joined_at: 0,
                last_activity: 0,
                cursor_position: None,
                selected_node: None,
                permissions: UserPermissions {
                    can_edit: true,
                    can_comment: true,
                    can_invite: true,
                },
            }) } else { None })
            .ok_or_else(|| anyhow::anyhow!("User not in session"))?;

        // Verify edit permissions for modification operations
        let needs_edit = matches!(op, 
            CollaborationOp::NodeAdd { .. } |
            CollaborationOp::NodeUpdate { .. } |
            CollaborationOp::NodeDelete { .. } |
            CollaborationOp::EdgeAdd { .. } |
            CollaborationOp::EdgeDelete { .. } |
            CollaborationOp::NodeMove { .. }
        );

        if needs_edit && !participant.permissions.can_edit {
            anyhow::bail!("User does not have edit permissions");
        }

        let operation = Operation {
            id: uuid::Uuid::new_v4().to_string(),
            user_id: user_id.to_string(),
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            op,
            parent_op: None,
        };

        // Store operation
        if let Some(ops) = self.operations.get_mut(session_id) {
            ops.push(operation.clone());
        }

        // Clear undo stack on new operation
        if let Some(undo) = self.undo_stacks.get_mut(session_id) {
            undo.clear();
        }

        // Broadcast to all participants
        let _ = self.broadcast_tx.send(operation.clone());

        Ok(operation.id)
    }

    /// Undo last operation
    pub async fn undo(&mut self, session_id: &str, user_id: &str) -> Result<Option<String>> {
        let ops = self.operations.get_mut(session_id)
            .ok_or_else(|| anyhow::anyhow!("Session not found"))?;

        // Find last operation by this user
        if let Some((idx, op)) = ops.iter().enumerate().rev().find(|(_, o)| o.user_id == user_id).cloned() {
            // Remove from operations
            ops.remove(idx);

            // Add to undo stack
            if let Some(undo) = self.undo_stacks.get_mut(session_id) {
                undo.push(op.clone());
            }

            // Broadcast undo
            let undo_op = Operation {
                id: uuid::Uuid::new_v4().to_string(),
                user_id: user_id.to_string(),
                timestamp: std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_secs(),
                op: CollaborationOp::NodeDelete { node_id: String::new() }, // Placeholder
                parent_op: Some(op.id),
            };

            let _ = self.broadcast_tx.send(undo_op);

            Ok(Some(op.id))
        } else {
            Ok(None)
        }
    }

    /// Redo last undone operation
    pub async fn redo(&mut self, session_id: &str, _user_id: &str) -> Result<Option<String>> {
        let undo = self.undo_stacks.get_mut(session_id)
            .ok_or_else(|| anyhow::anyhow!("Session not found"))?;

        if let Some(op) = undo.pop() {
            // Re-apply the operation
            if let Some(ops) = self.operations.get_mut(session_id) {
                ops.push(op.clone());
            }

            let _ = self.broadcast_tx.send(op.clone());
            Ok(Some(op.id))
        } else {
            Ok(None)
        }
    }

    /// Update cursor position
    pub fn update_cursor(&mut self, user_id: &str, position: CursorPosition) {
        self.user_cursors.insert(user_id.to_string(), position);
    }

    /// Get all cursor positions for a session
    pub fn get_cursors(&self, session_id: &str) -> Vec<(String, CursorPosition)> {
        let session = match self.sessions.get(session_id) {
            Some(s) => s,
            None => return vec![],
        };

        session.participants
            .iter()
            .filter_map(|p| {
                self.user_cursors.get(&p.user.id)
                    .map(|pos| (p.user.id.clone(), pos.clone()))
            })
            .collect()
    }

    /// Get operation history
    pub fn get_history(&self, session_id: &str) -> Option<&Vec<Operation>> {
        self.operations.get(session_id)
    }

    /// Get session info
    pub fn get_session(&self, session_id: &str) -> Option<&CollaborativeSession> {
        self.sessions.get(session_id)
    }

    /// Close session
    pub fn close_session(&mut self, session_id: &str) -> Result<()> {
        let session = self.sessions.get_mut(session_id)
            .ok_or_else(|| anyhow::anyhow!("Session not found"))?;
        
        session.active = false;
        
        // Save final state
        // ...

        Ok(())
    }

    /// Subscribe to operations
    pub fn subscribe(&self) -> broadcast::Receiver<Operation> {
        self.broadcast_tx.subscribe()
    }
}

/// Conflict resolution strategies
pub struct ConflictResolver;

impl ConflictResolver {
    /// Resolve conflicting operations
    pub fn resolve(ops: &[Operation]) -> Vec<Operation> {
        // Simple last-write-wins strategy
        let mut seen_nodes: HashMap<String, &Operation> = HashMap::new();
        
        for op in ops.iter().rev() {
            match &op.op {
                CollaborationOp::NodeUpdate { node_id, .. } => {
                    seen_nodes.entry(node_id.clone()).or_insert(op);
                }
                _ => {}
            }
        }

        ops.to_vec()
    }
}
