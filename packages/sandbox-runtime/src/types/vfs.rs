use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Clone)]
pub struct Metadata {
    pub permissions: u16,
}

#[derive(Serialize, Deserialize, Clone)]
pub enum FsNode {
    File {
        content: Vec<u8>,
        metadata: Metadata,
    },
    Directory {
        children: HashMap<String, FsNode>,
        metadata: Metadata,
    },
}
