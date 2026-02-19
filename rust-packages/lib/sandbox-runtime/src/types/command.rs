#[derive(Debug, PartialEq)]
pub enum LsFlags {
    Long,
}

#[derive(Debug, PartialEq)]
pub enum Command {
    Pwd,
    Cd { path: String },
    Ls { path: String, flags: Vec<LsFlags> },
    Mkdir { path: String },
    Touch { path: String },
    WriteFile { path: String, content: String },
    ReadFile { path: String },
    Chmod { mode: u16, path: String },
    Js { script: String },
    Unknown(String),
}
