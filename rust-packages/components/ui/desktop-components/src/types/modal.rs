#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ModalKind {
    Git,
    GitHub,
    Extensions,
    Settings,
}

impl ModalKind {
    pub fn title(self) -> &'static str {
        match self {
            Self::Git => "Git",
            Self::GitHub => "GitHub",
            Self::Extensions => "Extensions",
            Self::Settings => "Settings",
        }
    }
}
