use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeOwner {
    pub name: String,
    pub email: String,
    pub patterns: Vec<String>,
    pub team: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileOwnership {
    pub file_path: String,
    pub owners: Vec<CodeOwner>,
    pub primary_owner: Option<CodeOwner>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OwnershipStats {
    pub owner: String,
    pub file_count: usize,
    pub line_count: usize,
    pub percentage: f32,
}

#[derive(Debug, Clone, Default)]
pub struct CodeOwnershipState {
    pub owners: Vec<CodeOwner>,
    pub file_ownership: HashMap<String, FileOwnership>,
    pub ownership_stats: Vec<OwnershipStats>,
    pub show_dashboard: bool,
    pub group_by_team: bool,
}

impl CodeOwnershipState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn add_owner(&mut self, owner: CodeOwner) {
        self.owners.push(owner);
    }

    pub fn remove_owner(&mut self, name: &str) {
        self.owners.retain(|o| o.name != name);
    }

    pub fn set_file_ownership(&mut self, file_path: String, ownership: FileOwnership) {
        self.file_ownership.insert(file_path, ownership);
    }

    pub fn get_owners_for_file(&self, file_path: &str) -> Option<&FileOwnership> {
        self.file_ownership.get(file_path)
    }

    pub fn calculate_stats(&mut self) {
        self.ownership_stats.clear();
        let mut owner_map: HashMap<String, usize> = HashMap::new();
        let mut total_files = 0;

        for ownership in self.file_ownership.values() {
            total_files += 1;
            for owner in &ownership.owners {
                *owner_map.entry(owner.name.clone()).or_insert(0) += 1;
            }
        }

        for (owner_name, count) in owner_map {
            self.ownership_stats.push(OwnershipStats {
                owner: owner_name,
                file_count: count,
                line_count: 0,
                percentage: count as f32 / total_files as f32 * 100.0,
            });
        }

        self.ownership_stats.sort_by(|a, b| b.percentage.partial_cmp(&a.percentage).unwrap());
    }

    pub fn get_top_owners(&self, limit: usize) -> Vec<&OwnershipStats> {
        self.ownership_stats.iter().take(limit).collect()
    }
}
