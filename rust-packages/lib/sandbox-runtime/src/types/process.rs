use std::collections::HashMap;
use std::path::PathBuf;

// Represents an open file
pub struct FileDescriptor {
    pub path: PathBuf,
    // position for read/write would go here
}

// Process Control Block
pub struct Process {
    pub pid: u32,
    pub fd_table: HashMap<u32, FileDescriptor>,
}

impl Process {
    pub fn new(pid: u32) -> Self {
        let mut fd_table = HashMap::new();
        fd_table.insert(
            0,
            FileDescriptor {
                path: PathBuf::from("/dev/stdin"),
            },
        );
        fd_table.insert(
            1,
            FileDescriptor {
                path: PathBuf::from("/dev/stdout"),
            },
        );
        fd_table.insert(
            2,
            FileDescriptor {
                path: PathBuf::from("/dev/stderr"),
            },
        );

        Self { pid, fd_table }
    }
}
