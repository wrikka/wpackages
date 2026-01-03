use super::process::Process;
use super::vfs::FsNode;
use std::collections::HashMap;
use std::path::PathBuf;

pub struct SandboxRuntime {
    pub(crate) root: FsNode,
    pub(crate) cwd: PathBuf,
    pub(crate) next_pid: u32,
    pub(crate) processes: HashMap<u32, Process>,
}
