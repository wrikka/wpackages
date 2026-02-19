use crate::error::Result;
use crate::components::WindowComponent;

pub struct WindowService {
    window: WindowComponent,
}

impl WindowService {
    pub fn new(window: WindowComponent) -> Self {
        Self { window }
    }

    pub fn get_size(&self) -> (u32, u32) {
        (self.window.width, self.window.height)
    }
}
