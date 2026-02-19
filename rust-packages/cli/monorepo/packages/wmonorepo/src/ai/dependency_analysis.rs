// Dependency impact analysis

pub struct DependencyAnalyzer;

impl DependencyAnalyzer {
    pub fn analyze_impact(file_path: &str) -> ImpactReport {
        ImpactReport {
            file_path: file_path.to_string(),
            impact_score: if file_path.contains("index") {
                100
            } else if file_path.contains("utils") {
                75
            } else {
                50
            },
        }
    }
}

#[derive(Debug, Clone)]
pub struct ImpactReport {
    pub file_path: String,
    pub impact_score: u32,
}
