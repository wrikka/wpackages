use serde_json::Value;

pub fn extract_string(value: &Value, path: &str) -> Option<String> {
    value
        .pointer(path)
        .and_then(|v| v.as_str().map(|s| s.to_string()))
}

pub fn extract_array(value: &Value, path: &str) -> Option<Vec<Value>> {
    value.pointer(path).and_then(|v| v.as_array().cloned())
}

pub fn extract_object(value: &Value, path: &str) -> Option<serde_json::Map<String, Value>> {
    value.pointer(path).and_then(|v| v.as_object().cloned())
}

pub fn merge_objects(base: &Value, overlay: &Value) -> Value {
    if let (Value::Object(base_map), Value::Object(overlay_map)) = (base, overlay) {
        let mut merged = base_map.clone();
        for (key, value) in overlay_map {
            merged.insert(key.clone(), value.clone());
        }
        Value::Object(merged)
    } else {
        overlay.clone()
    }
}
