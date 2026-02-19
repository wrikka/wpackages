use crate::types::Tool;
use uuid::Uuid;

pub struct ToolComponent;

impl ToolComponent {
    pub fn create(name: String, description: String) -> Tool {
        Tool {
            id: Uuid::new_v4(),
            name,
            description,
            enabled: true,
        }
    }

    pub fn enable(tool: &mut Tool) {
        tool.enabled = true;
    }

    pub fn disable(tool: &mut Tool) {
        tool.enabled = false;
    }

    pub fn is_enabled(&self, tool: &Tool) -> bool {
        tool.enabled
    }
}
