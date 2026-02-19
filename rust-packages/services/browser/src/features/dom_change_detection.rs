use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DOMElementState {
    pub element_ref: String,
    pub tag_name: String,
    pub attributes: HashMap<String, String>,
    pub text_content: String,
    pub inner_html: String,
    pub bounding_rect: DOMRect,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DOMRect {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DOMChange {
    pub change_type: ChangeType,
    pub element_ref: String,
    pub old_value: Option<String>,
    pub new_value: Option<String>,
    pub attribute_name: Option<String>,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ChangeType {
    Added,
    Removed,
    AttributeChanged,
    TextChanged,
    Moved,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DOMChangeEvent {
    pub changes: Vec<DOMChange>,
    pub snapshot_id: String,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct DOMChangeDetector {
    snapshots: Vec<DOMSnapshot>,
    current_snapshot_id: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DOMSnapshot {
    pub id: String,
    pub elements: HashMap<String, DOMElementState>,
    pub timestamp: DateTime<Utc>,
}

impl DOMChangeDetector {
    pub fn new() -> Self {
        Self {
            snapshots: Vec::new(),
            current_snapshot_id: 0,
        }
    }

    pub fn capture_snapshot(&mut self, elements: Vec<DOMElementState>) -> DOMSnapshot {
        let mut element_map = HashMap::new();
        for element in elements {
            element_map.insert(element.element_ref.clone(), element);
        }

        let snapshot = DOMSnapshot {
            id: format!("snapshot_{}", self.current_snapshot_id),
            elements: element_map,
            timestamp: Utc::now(),
        };

        self.snapshots.push(snapshot.clone());
        self.current_snapshot_id += 1;

        snapshot
    }

    pub fn detect_changes(&self, from_snapshot_id: &str, to_snapshot_id: &str) -> Vec<DOMChange> {
        let from = self.snapshots.iter().find(|s| s.id == from_snapshot_id);
        let to = self.snapshots.iter().find(|s| s.id == to_snapshot_id);

        if let (Some(from_snap), Some(to_snap)) = (from, to) {
            self.compare_snapshots(from_snap, to_snap)
        } else {
            Vec::new()
        }
    }

    fn compare_snapshots(&self, from: &DOMSnapshot, to: &DOMSnapshot) -> Vec<DOMChange> {
        let mut changes = Vec::new();

        for (ref_id, to_element) in &to.elements {
            if let Some(from_element) = from.elements.get(ref_id) {
                let element_changes = self.compare_elements(from_element, to_element);
                changes.extend(element_changes);
            } else {
                changes.push(DOMChange {
                    change_type: ChangeType::Added,
                    element_ref: ref_id.clone(),
                    old_value: None,
                    new_value: Some(to_element.inner_html.clone()),
                    attribute_name: None,
                    timestamp: Utc::now(),
                });
            }
        }

        for (ref_id, from_element) in &from.elements {
            if !to.elements.contains_key(ref_id) {
                changes.push(DOMChange {
                    change_type: ChangeType::Removed,
                    element_ref: ref_id.clone(),
                    old_value: Some(from_element.inner_html.clone()),
                    new_value: None,
                    attribute_name: None,
                    timestamp: Utc::now(),
                });
            }
        }

        changes
    }

    fn compare_elements(&self, from: &DOMElementState, to: &DOMElementState) -> Vec<DOMChange> {
        let mut changes = Vec::new();

        for (attr_name, to_value) in &to.attributes {
            match from.attributes.get(attr_name) {
                Some(from_value) if from_value != to_value => {
                    changes.push(DOMChange {
                        change_type: ChangeType::AttributeChanged,
                        element_ref: to.element_ref.clone(),
                        old_value: Some(from_value.clone()),
                        new_value: Some(to_value.clone()),
                        attribute_name: Some(attr_name.clone()),
                        timestamp: Utc::now(),
                    });
                }
                None => {
                    changes.push(DOMChange {
                        change_type: ChangeType::AttributeChanged,
                        element_ref: to.element_ref.clone(),
                        old_value: None,
                        new_value: Some(to_value.clone()),
                        attribute_name: Some(attr_name.clone()),
                        timestamp: Utc::now(),
                    });
                }
                _ => {}
            }
        }

        if from.text_content != to.text_content {
            changes.push(DOMChange {
                change_type: ChangeType::TextChanged,
                element_ref: to.element_ref.clone(),
                old_value: Some(from.text_content.clone()),
                new_value: Some(to.text_content.clone()),
                attribute_name: None,
                timestamp: Utc::now(),
            });
        }

        let position_threshold = 5.0;
        let x_diff = (from.bounding_rect.x - to.bounding_rect.x).abs();
        let y_diff = (from.bounding_rect.y - to.bounding_rect.y).abs();

        if x_diff > position_threshold || y_diff > position_threshold {
            changes.push(DOMChange {
                change_type: ChangeType::Moved,
                element_ref: to.element_ref.clone(),
                old_value: Some(format!("x:{}, y:{}", from.bounding_rect.x, from.bounding_rect.y)),
                new_value: Some(format!("x:{}, y:{}", to.bounding_rect.x, to.bounding_rect.y)),
                attribute_name: None,
                timestamp: Utc::now(),
            });
        }

        changes
    }

    pub fn get_element_history(&self, element_ref: &str) -> Vec<&DOMElementState> {
        self.snapshots.iter()
            .filter_map(|s| s.elements.get(element_ref))
            .collect()
    }

    pub fn watch_element(&self, _element_ref: &str) -> ElementWatcher {
        ElementWatcher {
            element_ref: _element_ref.to_string(),
            last_check: Utc::now(),
        }
    }

    pub fn get_latest_snapshot(&self) -> Option<&DOMSnapshot> {
        self.snapshots.last()
    }
}

#[derive(Debug, Clone)]
pub struct ElementWatcher {
    element_ref: String,
    last_check: DateTime<Utc>,
}

impl ElementWatcher {
    pub fn has_changed_since(&self, detector: &DOMChangeDetector, since: DateTime<Utc>) -> bool {
        let history = detector.get_element_history(&self.element_ref);
        history.iter().any(|state| state.timestamp > since)
    }
}
