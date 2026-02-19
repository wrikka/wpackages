use crate::error::Result;

pub struct WindowComponent {
    pub width: u32,
    pub height: u32,
}

impl WindowComponent {
    pub fn new(width: u32, height: u32) -> Self {
        Self { width, height }
    }

    pub fn resize(&mut self, width: u32, height: u32) -> Result<()> {
        self.width = width;
        self.height = height;
        Ok(())
    }
}
