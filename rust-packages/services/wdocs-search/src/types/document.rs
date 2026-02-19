use rustc_hash::FxHashMap;
use serde::{Deserialize, Serialize};

pub type DocId = u64;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Document {
    pub id: DocId,
    pub fields: FxHashMap<String, String>,
}
