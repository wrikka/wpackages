use crate::error::RuntimeError;
use crate::types::command::Command;
use crate::types::process::Process;
use crate::types::runtime::SandboxRuntime;
use crate::types::vfs::{FsNode, Metadata};
use crate::utils;
use std::collections::HashMap;
use std::path::{Path, PathBuf};

pub struct AppRuntime {
    runtime: SandboxRuntime,
}

impl AppRuntime {
    pub fn new() -> Self {
        let mut root = FsNode::Directory {
            children: HashMap::new(),
            metadata: Metadata { permissions: 0o755 },
        };

        if let FsNode::Directory { children, .. } = &mut root {
            let mut dev_children = HashMap::new();
            dev_children.insert(
                "stdin".to_string(),
                FsNode::File {
                    content: Vec::new(),
                    metadata: Metadata { permissions: 0o666 },
                },
            );
            dev_children.insert(
                "stdout".to_string(),
                FsNode::File {
                    content: Vec::new(),
                    metadata: Metadata { permissions: 0o666 },
                },
            );
            dev_children.insert(
                "stderr".to_string(),
                FsNode::File {
                    content: Vec::new(),
                    metadata: Metadata { permissions: 0o666 },
                },
            );
            children.insert(
                "dev".to_string(),
                FsNode::Directory {
                    children: dev_children,
                    metadata: Metadata { permissions: 0o755 },
                },
            );
        }

        let mut processes = HashMap::new();
        let init_process = Process::new(1);
        processes.insert(1, init_process);

        let runtime = SandboxRuntime {
            root,
            cwd: PathBuf::from("/"),
            next_pid: 2,
            processes,
        };

        Self { runtime }
    }

    pub(crate) fn get_node_mut(&mut self, path: &Path) -> Result<&mut FsNode, RuntimeError> {
        let mut current = &mut self.runtime.root;
        for component in path.strip_prefix("/").unwrap().components() {
            let component_str: &str = component.as_os_str().to_str().unwrap();
            if component_str.is_empty() {
                continue;
            }

            current =
                match current {
                    FsNode::Directory { children, .. } => children
                        .get_mut(component_str)
                        .ok_or_else(|| RuntimeError::NotFound {
                            path: path.to_str().unwrap().to_string(),
                        })?,
                    FsNode::File { .. } => {
                        return Err(RuntimeError::NotADirectory {
                            path: path.to_str().unwrap().to_string(),
                        });
                    }
                }
        }
        Ok(current)
    }

    pub(crate) fn resolve_path(&self, path: &str) -> PathBuf {
        utils::path::resolve_path(&self.runtime.cwd, path)
    }

    pub fn run_command(&mut self, command_str: &str) -> Result<String, RuntimeError> {
        let command = crate::components::parser::parse_command(command_str)?;
        match command {
            Command::Pwd => self.handle_pwd(),
            Command::Cd { path } => self.handle_cd(path),
            Command::Ls { path, flags } => self.handle_ls(path, flags),
            Command::Mkdir { path } => self.handle_mkdir(path),
            Command::Touch { path } => self.handle_touch(path),
            Command::WriteFile { path, content } => self.handle_write_file(path, content),
            Command::ReadFile { path } => self.handle_read_file(path),
            Command::Chmod { mode, path } => self.handle_chmod(mode, path),
            Command::Js { script } => self.handle_js(script),
            Command::Unknown(cmd) => Err(RuntimeError::CommandNotFound(cmd)),
        }
    }

    // Command Handlers
    fn handle_pwd(&self) -> Result<String, RuntimeError> {
        Ok(self.runtime.cwd.to_str().unwrap().to_string())
    }

    fn handle_cd(&mut self, path: String) -> Result<String, RuntimeError> {
        let new_path = self.resolve_path(&path);
        match self.get_node_mut(&new_path) {
            Ok(FsNode::Directory { .. }) => {
                self.runtime.cwd = new_path;
                Ok("".to_string())
            }
            Ok(FsNode::File { .. }) => Err(RuntimeError::NotADirectory { path }),
            Err(e) => Err(e),
        }
    }

    fn handle_ls(
        &mut self,
        path: String,
        flags: Vec<crate::types::command::LsFlags>,
    ) -> Result<String, RuntimeError> {
        let path = self.resolve_path(&path);
        match self.get_node_mut(&path) {
            Ok(FsNode::Directory { children, .. }) => {
                let mut entries: Vec<_> = children.iter().collect();
                entries.sort_by_key(|(name, _)| (*name).clone());
                let output = entries
                    .iter()
                    .map(|(name, node)| {
                        if flags.contains(&crate::types::command::LsFlags::Long) {
                            let (metadata, type_char) = match node {
                                FsNode::File { metadata, .. } => (metadata, 'f'),
                                FsNode::Directory { metadata, .. } => (metadata, 'd'),
                            };
                            format!("{} {:o} {}", type_char, metadata.permissions, name)
                        } else {
                            name.to_string()
                        }
                    })
                    .collect::<Vec<String>>()
                    .join("\n");
                Ok(output)
            }
            _ => Err(RuntimeError::NotFound {
                path: path.to_str().unwrap().to_string(),
            }),
        }
    }

    fn handle_mkdir(&mut self, path: String) -> Result<String, RuntimeError> {
        let path = self.resolve_path(&path);
        let parent_path = path.parent().unwrap();
        let basename = path.file_name().unwrap().to_str().unwrap().to_string();
        match self.get_node_mut(parent_path) {
            Ok(FsNode::Directory { children, .. }) => {
                let new_dir = FsNode::Directory {
                    children: std::collections::HashMap::new(),
                    metadata: Metadata { permissions: 0o755 },
                };
                children.insert(basename, new_dir);
                Ok("".to_string())
            }
            _ => Err(RuntimeError::CannotCreateDirectory {
                path: path.to_str().unwrap().to_string(),
            }),
        }
    }

    fn handle_touch(&mut self, path: String) -> Result<String, RuntimeError> {
        let path = self.resolve_path(&path);
        let parent_path = path.parent().unwrap();
        let basename = path.file_name().unwrap().to_str().unwrap().to_string();
        match self.get_node_mut(parent_path) {
            Ok(FsNode::Directory { children, .. }) => {
                let new_file = FsNode::File {
                    content: Vec::new(),
                    metadata: Metadata { permissions: 0o644 },
                };
                children.insert(basename, new_file);
                Ok("".to_string())
            }
            _ => Err(RuntimeError::CannotCreateFile {
                path: path.to_str().unwrap().to_string(),
            }),
        }
    }

    fn handle_write_file(&mut self, path: String, content: String) -> Result<String, RuntimeError> {
        let path = self.resolve_path(&path);
        match self.get_node_mut(&path) {
            Ok(FsNode::File {
                content: file_content,
                ..
            }) => {
                *file_content = content.as_bytes().to_vec();
                Ok("".to_string())
            }
            _ => Err(RuntimeError::CannotWrite {
                path: path.to_str().unwrap().to_string(),
            }),
        }
    }

    fn handle_read_file(&mut self, path: String) -> Result<String, RuntimeError> {
        let path = self.resolve_path(&path);
        match self.get_node_mut(&path) {
            Ok(FsNode::File { content, .. }) => Ok(String::from_utf8_lossy(content).to_string()),
            _ => Err(RuntimeError::CannotRead {
                path: path.to_str().unwrap().to_string(),
            }),
        }
    }

    fn handle_chmod(&mut self, mode: u16, path: String) -> Result<String, RuntimeError> {
        let path = self.resolve_path(&path);
        match self.get_node_mut(&path) {
            Ok(node) => {
                let metadata = match node {
                    FsNode::File { metadata, .. } => metadata,
                    FsNode::Directory { metadata, .. } => metadata,
                };
                metadata.permissions = mode;
                Ok("".to_string())
            }
            Err(e) => Err(e),
        }
    }

    fn handle_js(&mut self, script: String) -> Result<String, RuntimeError> {
        let mut context = boa_engine::Context::default();
        match context.eval(boa_engine::Source::from_bytes(script.as_bytes())) {
            Ok(res) => Ok(res
                .to_string(&mut context)
                .unwrap()
                .to_std_string()
                .unwrap()),
            Err(e) => Err(RuntimeError::JsError(e.to_string())),
        }
    }
}
