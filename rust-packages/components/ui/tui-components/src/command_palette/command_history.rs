pub struct CommandHistory {
    entries: Vec<String>,
    max_size: usize,
}

impl CommandHistory {
    pub fn new(max_size: usize) -> Self {
        Self {
            entries: Vec::new(),
            max_size,
        }
    }

    pub fn add(&mut self, entry: String) {
        if entry.trim().is_empty() {
            return;
        }

        if let Some(pos) = self.entries.iter().position(|h| h == &entry) {
            self.entries.remove(pos);
        }
        self.entries.push(entry);

        if self.entries.len() > self.max_size {
            self.entries.remove(0);
        }
    }

    pub fn get(&self, index: usize) -> Option<&String> {
        self.entries.get(index)
    }

    pub fn len(&self) -> usize {
        self.entries.len()
    }

    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }

    pub fn last_index(&self) -> Option<usize> {
        if self.is_empty() {
            None
        } else {
            Some(self.entries.len() - 1)
        }
    }
}

impl Default for CommandHistory {
    fn default() -> Self {
        Self::new(50)
    }
}
