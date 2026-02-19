use fuzzy_matcher::FuzzyMatcher;
use fuzzy_matcher::skim::SkimMatcherV2;

#[derive(Debug, Clone)]
pub struct ElementMatch {
    pub ref_id: String,
    pub role: String,
    pub name: Option<String>,
    pub score: i64,
}

pub fn find_element_by_ref<'a>(
    elements: &'a [crate::types::SnapshotNode],
    ref_id: &str,
) -> Option<&'a crate::types::SnapshotNode> {
    elements.iter().find(|e| e.ref_id == ref_id)
}

pub fn find_element_by_role<'a>(
    elements: &'a [crate::types::SnapshotNode],
    role: &str,
) -> Vec<&'a crate::types::SnapshotNode> {
    elements.iter().filter(|e| e.role == role).collect()
}

pub fn find_element_by_name<'a>(
    elements: &'a [crate::types::SnapshotNode],
    name: &str,
) -> Vec<&'a crate::types::SnapshotNode> {
    elements
        .iter()
        .filter(|e| e.name.as_deref() == Some(name))
        .collect()
}

pub fn fuzzy_find_element<'a>(
    elements: &'a [crate::types::SnapshotNode],
    query: &str,
) -> Vec<ElementMatch> {
    let matcher = SkimMatcherV2::default();
    let mut matches = Vec::new();

    for element in elements {
        if let Some(name) = &element.name {
            if let Some(score) = matcher.fuzzy_match(name, query) {
                matches.push(ElementMatch {
                    ref_id: element.ref_id.clone(),
                    role: element.role.clone(),
                    name: Some(name.clone()),
                    score,
                });
            }
        }
    }

    matches.sort_by(|a, b| b.score.cmp(&a.score));
    matches
}

pub fn find_interactive_elements<'a>(
    elements: &'a [crate::types::SnapshotNode],
) -> Vec<&'a crate::types::SnapshotNode> {
    const INTERACTIVE_ROLES: &[&str] = &[
        "button", "link", "textbox", "checkbox", "radio", "combobox", "listbox", "menuitem", "tab",
    ];

    elements
        .iter()
        .filter(|e| INTERACTIVE_ROLES.contains(&e.role.as_str()))
        .collect()
}
