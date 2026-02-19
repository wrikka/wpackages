use crate::domain::TextChunk;
use std::collections::HashMap;

pub fn metadata_equals(chunk: &TextChunk, filters: &HashMap<String, String>) -> bool {
    let Some(meta) = chunk.metadata.as_ref() else {
        return false;
    };
    let Some(obj) = meta.as_object() else {
        return false;
    };

    for (k, expected) in filters.iter() {
        let Some(value) = obj.get(k) else {
            return false;
        };
        let actual = if let Some(s) = value.as_str() {
            s.to_string()
        } else {
            value.to_string()
        };
        if &actual != expected {
            return false;
        }
    }

    true
}
