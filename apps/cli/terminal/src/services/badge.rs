use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Badge {
    pub id: String,
    pub name: String,
    pub value: String,
    pub color: String,
    pub position: BadgePosition,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BadgePosition {
    Left,
    Right,
}

pub struct BadgeSystem {
    badges: Arc<RwLock<HashMap<String, Badge>>>,
    active_badges: Arc<RwLock<Vec<String>>>,
}

impl BadgeSystem {
    pub fn new() -> Self {
        Self {
            badges: Arc::new(RwLock::new(HashMap::new())),
            active_badges: Arc::new(RwLock::new(Vec::new())),
        }
    }

    pub fn add_badge(&self, badge: Badge) {
        self.badges.write().insert(badge.id.clone(), badge);
    }

    pub fn remove_badge(&self, badge_id: &str) {
        self.badges.write().remove(badge_id);
        self.active_badges.write().retain(|id| id != badge_id);
    }

    pub fn activate_badge(&self, badge_id: &str, value: String) {
        if let Some(mut badge) = self.badges.write().get_mut(badge_id) {
            badge.value = value;
            badge.enabled = true;

            if !self.active_badges.read().contains(&badge_id.to_string()) {
                self.active_badges.write().push(badge_id.to_string());
            }
        }
    }

    pub fn deactivate_badge(&self, badge_id: &str) {
        if let Some(mut badge) = self.badges.write().get_mut(badge_id) {
            badge.enabled = false;
        }
        self.active_badges.write().retain(|id| id != badge_id);
    }

    pub fn get_active_badges(&self) -> Vec<Badge> {
        let active_ids = self.active_badges.read().clone();
        let badges = self.badges.read();

        active_ids
            .iter()
            .filter_map(|id| badges.get(id).filter(|b| b.enabled).cloned())
            .collect()
    }

    pub fn get_badge(&self, badge_id: &str) -> Option<Badge> {
        self.badges.read().get(badge_id).cloned()
    }

    pub fn get_all_badges(&self) -> Vec<Badge> {
        self.badges.read().values().cloned().collect()
    }
}

impl Default for BadgeSystem {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_badge_system() {
        let system = BadgeSystem::new();

        let badge = Badge {
            id: "git".to_string(),
            name: "Git Branch".to_string(),
            value: "main".to_string(),
            color: "green".to_string(),
            position: BadgePosition::Right,
            enabled: true,
        };

        system.add_badge(badge);
        system.activate_badge("git", "develop".to_string());

        let active = system.get_active_badges();
        assert_eq!(active.len(), 1);
        assert_eq!(active[0].value, "develop");
    }
}
