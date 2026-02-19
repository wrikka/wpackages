//! Visual Workflow Builder (Feature 4)
//!
//! Drag-and-drop UI for creating automations without coding

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Node types in visual workflow
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WorkflowNodeType {
    Start,
    End,
    Action,
    Condition,
    Loop,
    Wait,
    Parallel,
    Merge,
    ErrorHandler,
    SubWorkflow,
    Custom(String),
}

/// Visual workflow node
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowNode {
    pub id: String,
    pub node_type: WorkflowNodeType,
    pub label: String,
    pub description: Option<String>,
    pub position: Position,
    pub size: Size,
    pub properties: HashMap<String, serde_json::Value>,
    pub inputs: Vec<Port>,
    pub outputs: Vec<Port>,
    pub style: NodeStyle,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position {
    pub x: f32,
    pub y: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Size {
    pub width: f32,
    pub height: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Port {
    pub id: String,
    pub label: String,
    pub node_id: String,
    pub port_type: PortType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PortType {
    Control,
    Data,
    Trigger,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct NodeStyle {
    pub color: Option<String>,
    pub icon: Option<String>,
    pub border_width: Option<f32>,
    pub border_color: Option<String>,
}

/// Connection between nodes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowEdge {
    pub id: String,
    pub source: String,
    pub source_port: String,
    pub target: String,
    pub target_port: String,
    pub label: Option<String>,
    pub condition: Option<String>,
    pub style: EdgeStyle,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct EdgeStyle {
    pub color: Option<String>,
    pub width: Option<f32>,
    pub dashed: Option<bool>,
    pub animated: Option<bool>,
}

/// Complete visual workflow
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VisualWorkflow {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub nodes: Vec<WorkflowNode>,
    pub edges: Vec<WorkflowEdge>,
    pub variables: Vec<WorkflowVariable>,
    pub metadata: WorkflowMetadata,
    pub version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowVariable {
    pub name: String,
    pub var_type: VariableType,
    pub default_value: Option<serde_json::Value>,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VariableType {
    String,
    Number,
    Boolean,
    Array,
    Object,
    Element,
    Screenshot,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct WorkflowMetadata {
    pub author: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub tags: Vec<String>,
    pub category: Option<String>,
}

/// Workflow builder state
pub struct WorkflowBuilder {
    current_workflow: Option<VisualWorkflow>,
    selected_node: Option<String>,
    clipboard: Vec<WorkflowNode>,
    undo_stack: Vec<WorkflowState>,
    redo_stack: Vec<WorkflowState>,
    zoom: f32,
    pan: Position,
}

#[derive(Debug, Clone)]
struct WorkflowState {
    nodes: Vec<WorkflowNode>,
    edges: Vec<WorkflowEdge>,
}

impl WorkflowBuilder {
    pub fn new() -> Self {
        Self {
            current_workflow: None,
            selected_node: None,
            clipboard: Vec::new(),
            undo_stack: Vec::new(),
            redo_stack: Vec::new(),
            zoom: 1.0,
            pan: Position { x: 0.0, y: 0.0 },
        }
    }

    /// Create new workflow
    pub fn create_workflow(&mut self, name: &str) -> &mut VisualWorkflow {
        let workflow = VisualWorkflow {
            id: uuid::Uuid::new_v4().to_string(),
            name: name.to_string(),
            description: None,
            nodes: vec![],
            edges: vec![],
            variables: vec![],
            metadata: WorkflowMetadata::default(),
            version: "1.0.0".to_string(),
        };
        self.current_workflow = Some(workflow);
        self.current_workflow.as_mut().unwrap()
    }

    /// Add node to workflow
    pub fn add_node(&mut self, node_type: WorkflowNodeType, position: Position) -> Result<String> {
        let node = self.create_node(node_type, position);
        let id = node.id.clone();

        let workflow = self.current_workflow.as_mut()
            .ok_or_else(|| anyhow::anyhow!("No active workflow"))?;
        workflow.nodes.push(node);

        self.save_state();

        Ok(id)
    }

    /// Connect two nodes
    pub fn connect_nodes(&mut self, source: &str, target: &str, condition: Option<&str>) -> Result<String> {
        let edge = WorkflowEdge {
            id: format!("edge_{}", uuid::Uuid::new_v4().to_string()),
            source: source.to_string(),
            source_port: "out".to_string(),
            target: target.to_string(),
            target_port: "in".to_string(),
            label: condition.map(|c| format!("if {}", c)),
            condition: condition.map(String::from),
            style: EdgeStyle::default(),
        };

        let id = edge.id.clone();

        let workflow = self.current_workflow.as_mut()
            .ok_or_else(|| anyhow::anyhow!("No active workflow"))?;
        workflow.edges.push(edge);

        self.save_state();

        Ok(id)
    }

    /// Delete node
    pub fn delete_node(&mut self, node_id: &str) -> Result<()> {
        let workflow = self.current_workflow.as_mut()
            .ok_or_else(|| anyhow::anyhow!("No active workflow"))?;

        workflow.nodes.retain(|n| n.id != node_id);
        workflow.edges.retain(|e| e.source != node_id && e.target != node_id);

        Ok(())
    }

    /// Move node to new position
    pub fn move_node(&mut self, node_id: &str, new_position: Position) -> Result<()> {
        let workflow = self.current_workflow.as_mut()
            .ok_or_else(|| anyhow::anyhow!("No active workflow"))?;

        if let Some(node) = workflow.nodes.iter_mut().find(|n| n.id == node_id) {
            node.position = new_position;
        }

        Ok(())
    }

    /// Copy selected nodes
    pub fn copy(&mut self, node_ids: &[String]) {
        let workflow = match &self.current_workflow {
            Some(w) => w,
            None => return,
        };

        self.clipboard = workflow
            .nodes
            .iter()
            .filter(|n| node_ids.contains(&n.id))
            .cloned()
            .collect();
    }

    /// Paste copied nodes
    pub fn paste(&mut self, offset: Position) -> Result<Vec<String>> {
        let mut new_ids = Vec::new();
        let mut new_nodes = Vec::new();

        for node in &self.clipboard {
            let mut new_node = node.clone();
            new_node.id = format!("node_{}", uuid::Uuid::new_v4().to_string());
            new_node.position = Position {
                x: node.position.x + offset.x,
                y: node.position.y + offset.y,
            };
            new_ids.push(new_node.id.clone());
            new_nodes.push(new_node);
        }

        let workflow = self.current_workflow.as_mut()
            .ok_or_else(|| anyhow::anyhow!("No active workflow"))?;

        for node in new_nodes {
            workflow.nodes.push(node);
        }

        self.save_state();

        Ok(new_ids)
    }

    /// Undo last action
    pub fn undo(&mut self) -> Result<()> {
        if let Some(state) = self.undo_stack.pop() {
            if let Some(workflow) = &mut self.current_workflow {
                self.redo_stack.push(WorkflowState {
                    nodes: workflow.nodes.clone(),
                    edges: workflow.edges.clone(),
                });
                workflow.nodes = state.nodes;
                workflow.edges = state.edges;
            }
        }
        Ok(())
    }

    /// Redo last undone action
    pub fn redo(&mut self) -> Result<()> {
        if let Some(state) = self.redo_stack.pop() {
            if let Some(workflow) = &mut self.current_workflow {
                self.undo_stack.push(WorkflowState {
                    nodes: workflow.nodes.clone(),
                    edges: workflow.edges.clone(),
                });
                workflow.nodes = state.nodes;
                workflow.edges = state.edges;
            }
        }
        Ok(())
    }

    /// Export workflow to executable script
    pub fn export_to_script(&self) -> Result<String> {
        let workflow = self.current_workflow.as_ref()
            .ok_or_else(|| anyhow::anyhow!("No active workflow"))?;

        let mut script = String::new();
        script.push_str(&format!("// Workflow: {}\n", workflow.name));
        script.push_str("use computer_use::prelude::*;\n\n");
        script.push_str("pub async fn run() -> Result<()> {\n");

        // Generate code from nodes and edges
        for node in &workflow.nodes {
            match &node.node_type {
                WorkflowNodeType::Action => {
                    if let Some(action) = node.properties.get("action") {
                        script.push_str(&format!("    {}\n", action));
                    }
                }
                WorkflowNodeType::Wait => {
                    if let Some(duration) = node.properties.get("duration") {
                        script.push_str(&format!("    tokio::time::sleep(Duration::from_secs({})).await;\n", duration));
                    }
                }
                WorkflowNodeType::Condition => {
                    if let Some(condition) = node.properties.get("condition") {
                        script.push_str(&format!("    if {} {{\n", condition));
                    }
                }
                _ => {}
            }
        }

        script.push_str("    Ok(())\n");
        script.push_str("}\n");

        Ok(script)
    }

    /// Save workflow to file
    pub fn save(&self, path: &str) -> Result<()> {
        let workflow = self.current_workflow.as_ref()
            .ok_or_else(|| anyhow::anyhow!("No active workflow"))?;

        let json = serde_json::to_string_pretty(workflow)?;
        std::fs::write(path, json)?;

        Ok(())
    }

    /// Load workflow from file
    pub fn load(&mut self, path: &str) -> Result<()> {
        let json = std::fs::read_to_string(path)?;
        let workflow: VisualWorkflow = serde_json::from_str(&json)?;
        self.current_workflow = Some(workflow);
        self.undo_stack.clear();
        self.redo_stack.clear();

        Ok(())
    }

    fn create_node(&self, node_type: WorkflowNodeType, position: Position) -> WorkflowNode {
        let id = format!("node_{}", uuid::Uuid::new_v4().to_string());
        let (label, inputs, outputs) = self.node_template(&node_type);

        WorkflowNode {
            id,
            node_type,
            label,
            description: None,
            position,
            size: Size { width: 160.0, height: 80.0 },
            properties: HashMap::new(),
            inputs,
            outputs,
            style: NodeStyle::default(),
        }
    }

    fn node_template(&self, node_type: &WorkflowNodeType) -> (String, Vec<Port>, Vec<Port>) {
        match node_type {
            WorkflowNodeType::Start => (
                "Start".to_string(),
                vec![],
                vec![Port { id: "out".to_string(), label: "→".to_string(), node_id: String::new(), port_type: PortType::Control }],
            ),
            WorkflowNodeType::End => (
                "End".to_string(),
                vec![Port { id: "in".to_string(), label: "←".to_string(), node_id: String::new(), port_type: PortType::Control }],
                vec![],
            ),
            WorkflowNodeType::Action => (
                "Action".to_string(),
                vec![Port { id: "in".to_string(), label: "←".to_string(), node_id: String::new(), port_type: PortType::Control }],
                vec![Port { id: "out".to_string(), label: "→".to_string(), node_id: String::new(), port_type: PortType::Control }],
            ),
            WorkflowNodeType::Condition => (
                "If".to_string(),
                vec![Port { id: "in".to_string(), label: "←".to_string(), node_id: String::new(), port_type: PortType::Control }],
                vec![
                    Port { id: "true".to_string(), label: "True".to_string(), node_id: String::new(), port_type: PortType::Control },
                    Port { id: "false".to_string(), label: "False".to_string(), node_id: String::new(), port_type: PortType::Control },
                ],
            ),
            _ => (
                "Node".to_string(),
                vec![Port { id: "in".to_string(), label: "←".to_string(), node_id: String::new(), port_type: PortType::Control }],
                vec![Port { id: "out".to_string(), label: "→".to_string(), node_id: String::new(), port_type: PortType::Control }],
            ),
        }
    }

    fn save_state(&mut self) {
        if let Some(workflow) = &self.current_workflow {
            self.undo_stack.push(WorkflowState {
                nodes: workflow.nodes.clone(),
                edges: workflow.edges.clone(),
            });
            self.redo_stack.clear();
        }
    }
}
