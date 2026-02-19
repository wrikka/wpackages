pub use crate::types::ui::ModalKind;
use command_palette::app::PaletteState;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum CenterPanel {
    #[default]
    Editor,
    Git,
    Extensions,
    Settings,
    GitHub,
}

#[derive(Default)]
pub struct UiState {
    pub center_tab: CenterPanel,
    pub active_modal: Option<ModalKind>,
    pub notifications: usize,
    pub last_error: Option<String>,
    pub palette: PaletteState,
    pub show_command_palette: bool,
}
