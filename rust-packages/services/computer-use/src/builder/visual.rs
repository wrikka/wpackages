//! Visual Task Builder UI
//!
//! Provides a web-based UI for building automation workflows visually
//! using drag-and-drop components with live preview.

use crate::error::{Error, Result};
use crate::protocol::{Action, Command};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{broadcast, Mutex};
use uuid::Uuid;

/// Task Builder Server
pub struct TaskBuilderServer {
    projects: Arc<Mutex<HashMap<String, TaskProject>>>,
    event_tx: broadcast::Sender<BuilderEvent>,
    port: u16,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskProject {
    pub id: String,
    pub name: String,
    pub description: String,
    pub created_at: u64,
    pub modified_at: u64,
    pub canvas: TaskCanvas,
    pub variables: Vec<TaskVariable>,
    pub preview_mode: PreviewMode,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskCanvas {
    pub nodes: Vec<TaskNode>,
    pub connections: Vec<NodeConnection>,
    pub zoom: f64,
    pub offset_x: f64,
    pub offset_y: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskNode {
    pub id: String,
    pub node_type: NodeType,
    pub label: String,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub config: NodeConfig,
    pub inputs: Vec<Port>,
    pub outputs: Vec<Port>,
    pub color: String,
    pub icon: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NodeType {
    Trigger,
    Action,
    Condition,
    Loop,
    Wait,
    Variable,
    Extract,
    Transform,
    Output,
    Subflow,
    Comment,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeConfig {
    pub action: Option<Action>,
    pub params: serde_json::Value,
    pub condition: Option<String>,
    pub variable_name: Option<String>,
    pub subflow_id: Option<String>,
    pub comment: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Port {
    pub id: String,
    pub name: String,
    pub port_type: PortType,
    pub connected: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PortType {
    ControlFlow,
    Data,
    Trigger,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeConnection {
    pub id: String,
    pub source_node_id: String,
    pub source_port_id: String,
    pub target_node_id: String,
    pub target_port_id: String,
    pub color: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskVariable {
    pub name: String,
    pub var_type: VariableType,
    pub default_value: Option<String>,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VariableType {
    String,
    Number,
    Boolean,
    List,
    Object,
    Path,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum PreviewMode {
    Design,
    Preview,
    Debug,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BuilderEvent {
    NodeAdded { project_id: String, node: TaskNode },
    NodeRemoved { project_id: String, node_id: String },
    NodeMoved { project_id: String, node_id: String, x: f64, y: f64 },
    NodeUpdated { project_id: String, node_id: String, config: NodeConfig },
    ConnectionAdded { project_id: String, connection: NodeConnection },
    ConnectionRemoved { project_id: String, connection_id: String },
    ProjectUpdated { project_id: String },
    PreviewStarted { project_id: String },
    PreviewStep { project_id: String, node_id: String, status: ExecutionStatus },
    PreviewCompleted { project_id: String, success: bool },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExecutionStatus {
    Pending,
    Running,
    Success,
    Error(String),
    Skipped,
}

impl TaskBuilderServer {
    pub fn new(port: u16) -> Self {
        let (event_tx, _) = broadcast::channel(100);
        
        Self {
            projects: Arc::new(Mutex::new(HashMap::new())),
            event_tx,
            port,
        }
    }

    pub async fn start(&self) -> Result<()> {
        // HTTP server would start here
        // For now, just initialize with sample project
        let sample = self.create_sample_project();
        self.projects.lock().await.insert(sample.id.clone(), sample);
        Ok(())
    }

    /// Create a new project
    pub async fn create_project(&self, name: &str, description: &str) -> TaskProject {
        let project = TaskProject {
            id: Uuid::new_uuid().to_string(),
            name: name.to_string(),
            description: description.to_string(),
            created_at: current_timestamp(),
            modified_at: current_timestamp(),
            canvas: TaskCanvas {
                nodes: vec![],
                connections: vec![],
                zoom: 1.0,
                offset_x: 0.0,
                offset_y: 0.0,
            },
            variables: vec![],
            preview_mode: PreviewMode::Design,
        };
        
        self.projects.lock().await.insert(project.id.clone(), project.clone());
        project
    }

    /// Add node to canvas
    pub async fn add_node(
        &self,
        project_id: &str,
        node_type: NodeType,
        x: f64,
        y: f64,
    ) -> Result<TaskNode> {
        let mut projects = self.projects.lock().await;
        let project = projects.get_mut(project_id)
            .ok_or_else(|| Error::InvalidCommand(format!("Project {} not found", project_id)))?;

        let node = create_default_node(node_type, x, y);
        project.canvas.nodes.push(node.clone());
        project.modified_at = current_timestamp();
        
        let _ = self.event_tx.send(BuilderEvent::NodeAdded {
            project_id: project_id.to_string(),
            node: node.clone(),
        });
        
        Ok(node)
    }

    /// Move node on canvas
    pub async fn move_node(&self, project_id: &str, node_id: &str, x: f64, y: f64) -> Result<()> {
        let mut projects = self.projects.lock().await;
        let project = projects.get_mut(project_id)
            .ok_or_else(|| Error::InvalidCommand(format!("Project {} not found", project_id)))?;

        if let Some(node) = project.canvas.nodes.iter_mut().find(|n| n.id == node_id) {
            node.x = x;
            node.y = y;
            project.modified_at = current_timestamp();
            
            let _ = self.event_tx.send(BuilderEvent::NodeMoved {
                project_id: project_id.to_string(),
                node_id: node_id.to_string(),
                x,
                y,
            });
        }
        
        Ok(())
    }

    /// Update node configuration
    pub async fn update_node_config(
        &self,
        project_id: &str,
        node_id: &str,
        config: NodeConfig,
    ) -> Result<()> {
        let mut projects = self.projects.lock().await;
        let project = projects.get_mut(project_id)
            .ok_or_else(|| Error::InvalidCommand(format!("Project {} not found", project_id)))?;

        if let Some(node) = project.canvas.nodes.iter_mut().find(|n| n.id == node_id) {
            node.config = config.clone();
            project.modified_at = current_timestamp();
            
            let _ = self.event_tx.send(BuilderEvent::NodeUpdated {
                project_id: project_id.to_string(),
                node_id: node_id.to_string(),
                config,
            });
        }
        
        Ok(())
    }

    /// Add connection between nodes
    pub async fn add_connection(
        &self,
        project_id: &str,
        source_node: &str,
        source_port: &str,
        target_node: &str,
        target_port: &str,
    ) -> Result<NodeConnection> {
        let mut projects = self.projects.lock().await;
        let project = projects.get_mut(project_id)
            .ok_or_else(|| Error::InvalidCommand(format!("Project {} not found", project_id)))?;

        let connection = NodeConnection {
            id: Uuid::new_uuid().to_string(),
            source_node_id: source_node.to_string(),
            source_port_id: source_port.to_string(),
            target_node_id: target_node.to_string(),
            target_port_id: target_port.to_string(),
            color: "#6366f1".to_string(),
        };

        project.canvas.connections.push(connection.clone());
        project.modified_at = current_timestamp();

        let _ = self.event_tx.send(BuilderEvent::ConnectionAdded {
            project_id: project_id.to_string(),
            connection: connection.clone(),
        });

        Ok(connection)
    }

    /// Convert project to executable workflow
    pub async fn export_to_workflow(&self, project_id: &str) -> Result<Vec<Command>> {
        let projects = self.projects.lock().await;
        let project = projects.get(project_id)
            .ok_or_else(|| Error::InvalidCommand(format!("Project {} not found", project_id)))?;

        let mut commands = vec![];
        
        // Topological sort of nodes based on connections
        let sorted_nodes = self.topological_sort(&project.canvas);
        
        for node in sorted_nodes {
            if let Some(command) = node_to_command(&node) {
                commands.push(command);
            }
        }

        Ok(commands)
    }

    /// Start preview mode
    pub async fn start_preview(&self, project_id: &str) -> Result<()> {
        let _ = self.event_tx.send(BuilderEvent::PreviewStarted {
            project_id: project_id.to_string(),
        });
        
        // Execute workflow in preview mode with visual feedback
        Ok(())
    }

    /// Get project
    pub async fn get_project(&self, project_id: &str) -> Option<TaskProject> {
        self.projects.lock().await.get(project_id).cloned()
    }

    /// List all projects
    pub async fn list_projects(&self) -> Vec<TaskProject> {
        self.projects.lock().await.values().cloned().collect()
    }

    /// Delete project
    pub async fn delete_project(&self, project_id: &str) -> Result<()> {
        self.projects.lock().await.remove(project_id)
            .ok_or_else(|| Error::InvalidCommand(format!("Project {} not found", project_id)))?;
        Ok(())
    }

    /// Subscribe to builder events
    pub fn subscribe(&self) -> broadcast::Receiver<BuilderEvent> {
        self.event_tx.subscribe()
    }

    fn topological_sort(&self, canvas: &TaskCanvas) -> Vec<&TaskNode> {
        // Simple topological sort based on connections
        let mut sorted = vec![];
        let mut visited = std::collections::HashSet::new();
        
        for node in &canvas.nodes {
            if !visited.contains(&node.id) {
                self.visit_node(node, canvas, &mut visited, &mut sorted);
            }
        }
        
        sorted
    }

    fn visit_node<'a>(
        &'a self,
        node: &'a TaskNode,
        canvas: &'a TaskCanvas,
        visited: &mut std::collections::HashSet<String>,
        sorted: &mut Vec<&'a TaskNode>,
    ) {
        visited.insert(node.id.clone());
        
        // Find all outgoing connections
        for conn in &canvas.connections {
            if conn.source_node_id == node.id {
                if let Some(target) = canvas.nodes.iter().find(|n| n.id == conn.target_node_id) {
                    if !visited.contains(&target.id) {
                        self.visit_node(target, canvas, visited, sorted);
                    }
                }
            }
        }
        
        sorted.push(node);
    }

    fn create_sample_project(&self) -> TaskProject {
        TaskProject {
            id: "sample-1".to_string(),
            name: "Sample Automation".to_string(),
            description: "A sample automation workflow".to_string(),
            created_at: current_timestamp(),
            modified_at: current_timestamp(),
            canvas: TaskCanvas {
                nodes: vec![
                    TaskNode {
                        id: "node-1".to_string(),
                        node_type: NodeType::Trigger,
                        label: "Manual Trigger".to_string(),
                        x: 100.0,
                        y: 100.0,
                        width: 180.0,
                        height: 60.0,
                        config: NodeConfig {
                            action: None,
                            params: serde_json::json!({}),
                            condition: None,
                            variable_name: None,
                            subflow_id: None,
                            comment: None,
                        },
                        inputs: vec![],
                        outputs: vec![Port {
                            id: "out-1".to_string(),
                            name: "Next".to_string(),
                            port_type: PortType::ControlFlow,
                            connected: true,
                        }],
                        color: "#10b981".to_string(),
                        icon: "play".to_string(),
                    },
                    TaskNode {
                        id: "node-2".to_string(),
                        node_type: NodeType::Action,
                        label: "Take Screenshot".to_string(),
                        x: 350.0,
                        y: 100.0,
                        width: 180.0,
                        height: 60.0,
                        config: NodeConfig {
                            action: Some(Action::Screenshot),
                            params: serde_json::json!({}),
                            condition: None,
                            variable_name: None,
                            subflow_id: None,
                            comment: None,
                        },
                        inputs: vec![Port {
                            id: "in-1".to_string(),
                            name: "Input".to_string(),
                            port_type: PortType::ControlFlow,
                            connected: true,
                        }],
                        outputs: vec![Port {
                            id: "out-1".to_string(),
                            name: "Next".to_string(),
                            port_type: PortType::ControlFlow,
                            connected: false,
                        }],
                        color: "#3b82f6".to_string(),
                        icon: "camera".to_string(),
                    },
                ],
                connections: vec![NodeConnection {
                    id: "conn-1".to_string(),
                    source_node_id: "node-1".to_string(),
                    source_port_id: "out-1".to_string(),
                    target_node_id: "node-2".to_string(),
                    target_port_id: "in-1".to_string(),
                    color: "#6366f1".to_string(),
                }],
                zoom: 1.0,
                offset_x: 0.0,
                offset_y: 0.0,
            },
            variables: vec![],
            preview_mode: PreviewMode::Design,
        }
    }
}

fn create_default_node(node_type: NodeType, x: f64, y: f64) -> TaskNode {
    let (label, color, icon) = match node_type {
        NodeType::Trigger => ("Trigger".to_string(), "#10b981".to_string(), "play".to_string()),
        NodeType::Action => ("Action".to_string(), "#3b82f6".to_string(), "zap".to_string()),
        NodeType::Condition => ("Condition".to_string(), "#f59e0b".to_string(), "git-branch".to_string()),
        NodeType::Loop => ("Loop".to_string(), "#8b5cf6".to_string(), "refresh-cw".to_string()),
        NodeType::Wait => ("Wait".to_string(), "#64748b".to_string(), "clock".to_string()),
        NodeType::Variable => ("Variable".to_string(), "#ec4899".to_string(), "box".to_string()),
        NodeType::Extract => ("Extract".to_string(), "#14b8a6".to_string(), "scissors".to_string()),
        NodeType::Transform => ("Transform".to_string(), "#06b6d4".to_string(), "shuffle".to_string()),
        NodeType::Output => ("Output".to_string(), "#22c55e".to_string(), "check-circle".to_string()),
        NodeType::Subflow => ("Subflow".to_string(), "#6366f1".to_string(), "layers".to_string()),
        NodeType::Comment => ("Comment".to_string(), "#94a3b8".to_string(), "message-square".to_string()),
    };

    TaskNode {
        id: Uuid::new_uuid().to_string(),
        node_type,
        label,
        x,
        y,
        width: 180.0,
        height: 60.0,
        config: NodeConfig {
            action: None,
            params: serde_json::json!({}),
            condition: None,
            variable_name: None,
            subflow_id: None,
            comment: None,
        },
        inputs: vec![Port {
            id: format!("in-{}", Uuid::new_uuid()),
            name: "Input".to_string(),
            port_type: PortType::ControlFlow,
            connected: false,
        }],
        outputs: vec![Port {
            id: format!("out-{}", Uuid::new_uuid()),
            name: "Output".to_string(),
            port_type: PortType::ControlFlow,
            connected: false,
        }],
        color,
        icon,
    }
}

fn node_to_command(node: &TaskNode) -> Option<Command> {
    node.config.action.as_ref().map(|action| {
        Command::new(action.clone(), node.config.params.clone())
    })
}

fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}
