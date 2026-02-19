use super::{mode::AppMode, panel::FocusPanel, state::FocusState, visibility::PanelVisibility};

#[test]
fn test_focus_panel_navigation() {
    let panel = FocusPanel::FileExplorer;
    assert_eq!(panel.next(), FocusPanel::ChatPanel);
    assert_eq!(panel.prev(), FocusPanel::InputField);
}

#[test]
fn test_focus_state_default() {
    let state = FocusState::default();
    assert_eq!(state.focused_panel, FocusPanel::FileExplorer);
    assert_eq!(state.mode, AppMode::Normal);
}

#[test]
fn test_focus_navigation() {
    let mut state = FocusState::new();
    state.focus_next();
    assert_eq!(state.focused_panel, FocusPanel::ChatPanel);
    state.focus_prev();
    assert_eq!(state.focused_panel, FocusPanel::FileExplorer);
}

#[test]
fn test_command_palette() {
    let mut state = FocusState::new();
    state.show_command_palette();
    assert!(state.is_command_palette_visible());
    assert_eq!(state.focused_panel, FocusPanel::CommandPalette);
    assert_eq!(state.mode, AppMode::Command);

    state.hide_command_palette();
    assert!(!state.is_command_palette_visible());
    assert_eq!(state.focused_panel, FocusPanel::InputField);
    assert_eq!(state.mode, AppMode::Normal);
}

#[test]
fn test_panel_visibility() {
    let mut visibility = PanelVisibility::new();
    assert!(visibility.file_explorer);

    visibility.toggle(FocusPanel::FileExplorer);
    assert!(!visibility.file_explorer);

    assert_eq!(visibility.visible_count(), 0);
}

#[test]
fn test_mode_input_check() {
    assert!(AppMode::Insert.is_input_mode());
    assert!(AppMode::Command.is_input_mode());
    assert!(AppMode::Search.is_input_mode());
    assert!(!AppMode::Normal.is_input_mode());
}
