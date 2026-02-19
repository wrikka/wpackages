#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Mode {
    Normal,
    Insert,
    Select,
    Command,
}

impl Mode {
    pub fn is_normal(&self) -> bool {
        matches!(self, Mode::Normal)
    }

    pub fn is_insert(&self) -> bool {
        matches!(self, Mode::Insert)
    }

    pub fn is_select(&self) -> bool {
        matches!(self, Mode::Select)
    }

    pub fn is_command(&self) -> bool {
        matches!(self, Mode::Command)
    }
}
