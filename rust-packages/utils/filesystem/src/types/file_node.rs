use crate::components::abs_path::AbsPath;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FileNode {
    pub path: AbsPath,
    pub name: String,
    pub kind: super::FileKind,
    pub size_bytes: Option<u64>,
    pub line_count: Option<usize>,
    pub children: Option<Vec<FileNode>>,
}
