pub fn join_path(base: &str, segment: &str) -> String {
    if base.is_empty() {
        segment.to_string()
    } else {
        format!("{}.{}", base, segment)
    }
}

pub fn join_index_path(base: &str, index: usize) -> String {
    if base.is_empty() {
        format!("[{}]", index)
    } else {
        format!("{}[{}]", base, index)
    }
}
