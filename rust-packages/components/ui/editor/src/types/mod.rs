use filesystem::AbsPath;

mod position;

pub mod position;

pub use position::{Position, Range};

#[derive(Debug, Clone)]
pub struct OpenFileTab {
    pub path: AbsPath,
    pub name: String,
    pub text: String,
    pub dirty: bool,
}
