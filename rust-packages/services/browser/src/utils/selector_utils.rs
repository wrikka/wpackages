use regex::Regex;

pub fn parse_ref_selector(selector: &str) -> Option<String> {
    if selector.starts_with('@') {
        Some(selector[1..].to_string())
    } else {
        None
    }
}

pub fn is_ref_selector(selector: &str) -> bool {
    selector.starts_with('@')
}

pub fn is_css_selector(selector: &str) -> bool {
    selector.starts_with('#')
        || selector.starts_with('.')
        || selector.starts_with('[')
        || selector.starts_with(':')
}

pub fn is_xpath_selector(selector: &str) -> bool {
    selector.starts_with('/') || selector.starts_with("./") || selector.starts_with("//")
}

pub fn normalize_selector(selector: &str) -> String {
    selector.trim().to_string()
}

pub fn extract_ref_id(selector: &str) -> Option<String> {
    let re = Regex::new(r"@e(\d+)").ok()?;
    re.captures(selector)
        .and_then(|caps| caps.get(0).map(|m| m.as_str().to_string()))
}
