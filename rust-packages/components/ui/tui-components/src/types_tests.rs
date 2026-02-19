#[cfg(test)]
mod tests {
    use crate::types::{
        AppMode, CommandDescription, CommandId, CommandName, ExecutionPlan, FocusPanel,
        MatchIndices, MatchScore, PlanStatus, PlanStep, Shortcut,
    };

    #[test]
    fn test_app_mode_display() {
        assert_eq!(AppMode::Normal.name(), "NORMAL");
        assert_eq!(AppMode::Insert.name(), "INSERT");
        assert_eq!(AppMode::Command.name(), "COMMAND");
        assert_eq!(AppMode::Search.name(), "SEARCH");
        assert_eq!(AppMode::Plan.name(), "PLAN");
    }

    #[test]
    fn test_app_mode_to_string() {
        assert_eq!(AppMode::Normal.to_string(), "NORMAL");
        assert_eq!(AppMode::Insert.to_string(), "INSERT");
    }

    #[test]
    fn test_focus_panel_name() {
        assert_eq!(FocusPanel::CommandPalette.name(), "Command Palette");
        assert_eq!(FocusPanel::FileExplorer.name(), "File Explorer");
        assert_eq!(FocusPanel::ChatPanel.name(), "Chat Panel");
    }

    #[test]
    fn test_command_id_as_str() {
        let id = CommandId("test_id".to_string());
        assert_eq!(id.as_str(), "test_id");
    }

    #[test]
    fn test_command_id_from_str() {
        let id: CommandId = "test_id".into();
        assert_eq!(id.as_str(), "test_id");
    }

    #[test]
    fn test_command_id_from_string() {
        let id: CommandId = "test_id".to_string().into();
        assert_eq!(id.as_str(), "test_id");
    }

    #[test]
    fn test_command_id_display() {
        let id = CommandId("test_id".to_string());
        assert_eq!(id.to_string(), "test_id");
    }

    #[test]
    fn test_command_name_as_str() {
        let name = CommandName("test_name".to_string());
        assert_eq!(name.as_str(), "test_name");
    }

    #[test]
    fn test_command_name_from_str() {
        let name: CommandName = "test_name".into();
        assert_eq!(name.as_str(), "test_name");
    }

    #[test]
    fn test_command_description_as_str() {
        let desc = CommandDescription("test_desc".to_string());
        assert_eq!(desc.as_str(), "test_desc");
    }

    #[test]
    fn test_shortcut_as_str() {
        let shortcut = Shortcut("Ctrl+C".to_string());
        assert_eq!(shortcut.as_str(), "Ctrl+C");
    }

    #[test]
    fn test_match_score_value() {
        let score = MatchScore(0.85);
        assert_eq!(score.value(), 0.85);
    }

    #[test]
    fn test_match_score_from_f64() {
        let score: MatchScore = 0.85.into();
        assert_eq!(score.value(), 0.85);
    }

    #[test]
    fn test_match_indices_is_empty() {
        let indices = MatchIndices(vec![]);
        assert!(indices.is_empty());
    }

    #[test]
    fn test_match_indices_iter() {
        let indices = MatchIndices(vec![1, 2, 3]);
        let mut iter = indices.iter();
        assert_eq!(iter.next(), Some(&1));
        assert_eq!(iter.next(), Some(&2));
        assert_eq!(iter.next(), Some(&3));
        assert_eq!(iter.next(), None);
    }

    #[test]
    fn test_match_indices_from_vec() {
        let indices: MatchIndices = vec![1, 2, 3].into();
        assert!(!indices.is_empty());
    }

    #[test]
    fn test_execution_plan_creation() {
        let plan = ExecutionPlan {
            id: "plan_1".to_string(),
            description: "Test plan".to_string(),
            status: PlanStatus::Ready,
            steps: vec![PlanStep {
                step_number: 1,
                description: "Step 1".to_string(),
                approved: true,
            }],
        };
        assert_eq!(plan.id, "plan_1");
        assert_eq!(plan.steps.len(), 1);
    }
}
