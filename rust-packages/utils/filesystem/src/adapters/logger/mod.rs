//! Logger adapter module

pub mod structured;
pub mod console;
pub mod file;

pub use structured::*;
pub use console::*;
pub use file::*;
