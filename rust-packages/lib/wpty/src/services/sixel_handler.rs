pub struct SixelHandler {
    on_sixel: Box<dyn Fn(Vec<u8>) + Send>,
    is_collecting: bool,
    buffer: Vec<u8>,
}

impl SixelHandler {
    pub fn new(on_sixel: Box<dyn Fn(Vec<u8>) + Send>) -> Self {
        Self {
            on_sixel,
            is_collecting: false,
            buffer: Vec::new(),
        }
    }

    pub fn hook(&mut self) {
        self.is_collecting = true;
        self.buffer.clear();
    }

    pub fn put(&mut self, byte: u8) {
        if self.is_collecting {
            self.buffer.push(byte);
        }
    }

    pub fn unhook(&mut self) {
        if self.is_collecting {
            (self.on_sixel)(std::mem::take(&mut self.buffer));
        }
        self.is_collecting = false;
        self.buffer.clear();
    }
}
