use std::time::{Duration, Instant};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ToastKind {
    Info,
    Success,
    Warning,
    Error,
}

#[derive(Debug, Clone)]
pub struct Toast {
    pub kind: ToastKind,
    pub content: String,
    pub duration: Duration,
    pub(crate) created_at: Instant,
}

impl Toast {
    pub fn new(kind: ToastKind, content: impl Into<String>) -> Self {
        Self {
            kind,
            content: content.into(),
            duration: Duration::from_secs(5),
            created_at: Instant::now(),
        }
    }

    pub fn with_duration(mut self, duration: Duration) -> Self {
        self.duration = duration;
        self
    }
}

#[derive(Default, Debug, Clone)]
pub struct Toasts {
    toasts: Vec<Toast>,
}

impl Toasts {
    pub fn add(&mut self, toast: Toast) {
        self.toasts.push(toast);
    }

    pub fn get_mut(&mut self) -> &mut Vec<Toast> {
        &mut self.toasts
    }
}
