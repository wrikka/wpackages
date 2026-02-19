use serde::{Deserialize, Serialize};
use fuzzy_matcher::FuzzyMatcher;
use fuzzy_matcher::skim::SkimMatcherV2;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElementCandidate {
    pub reference: String,
    pub tag_name: String,
    pub text_content: Option<String>,
    pub attributes: std::collections::HashMap<String, String>,
    pub xpath: String,
    pub css_selector: String,
    pub bounding_box: Option<BoundingBox>,
    pub similarity_score: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BoundingBox {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Clone)]
pub struct SmartElementRecovery {
    matcher: SkimMatcherV2,
    similarity_threshold: f64,
}

impl SmartElementRecovery {
    pub fn new(similarity_threshold: f64) -> Self {
        Self {
            matcher: SkimMatcherV2::default(),
            similarity_threshold,
        }
    }

    pub fn find_similar_element(
        &self,
        original_element: &ElementCandidate,
        candidates: &[ElementCandidate],
    ) -> Option<ElementCandidate> {
        let mut best_match: Option<ElementCandidate> = None;
        let mut best_score = self.similarity_threshold;

        for candidate in candidates {
            let score = self.calculate_similarity(original_element, candidate);
            
            if score > best_score {
                best_score = score;
                let mut matched = candidate.clone();
                matched.similarity_score = score;
                best_match = Some(matched);
            }
        }

        best_match
    }

    fn calculate_similarity(
        &self,
        original: &ElementCandidate,
        candidate: &ElementCandidate,
    ) -> f64 {
        let mut total_score = 0.0;
        let mut weight_sum = 0.0;

        let tag_weight = 0.2;
        let text_weight = 0.3;
        let attr_weight = 0.25;
        let position_weight = 0.15;
        let xpath_weight = 0.1;

        if original.tag_name == candidate.tag_name {
            total_score += tag_weight;
        }
        weight_sum += tag_weight;

        if let (Some(orig_text), Some(cand_text)) = 
            (&original.text_content, &candidate.text_content) {
            let text_score = self.calculate_text_similarity(orig_text, cand_text);
            total_score += text_score * text_weight;
        }
        weight_sum += text_weight;

        let attr_score = self.calculate_attribute_similarity(&original.attributes, &candidate.attributes);
        total_score += attr_score * attr_weight;
        weight_sum += attr_weight;

        if let (Some(orig_box), Some(cand_box)) = 
            (&original.bounding_box, &candidate.bounding_box) {
            let position_score = self.calculate_position_similarity(orig_box, cand_box);
            total_score += position_score * position_weight;
        }
        weight_sum += position_weight;

        let xpath_score = self.calculate_xpath_similarity(&original.xpath, &candidate.xpath);
        total_score += xpath_score * xpath_weight;
        weight_sum += xpath_weight;

        if weight_sum > 0.0 {
            total_score / weight_sum
        } else {
            0.0
        }
    }

    fn calculate_text_similarity(&self, text1: &str, text2: &str) -> f64 {
        let text1_lower = text1.to_lowercase();
        let text2_lower = text2.to_lowercase();

        if let Some((score, _)) = self.matcher.fuzzy_match(&text1_lower, &text2_lower) {
            let max_len = text1_lower.len().max(text2_lower.len()) as i64;
            if max_len > 0 {
                score as f64 / max_len as f64
            } else {
                0.0
            }
        } else {
            0.0
        }
    }

    fn calculate_attribute_similarity(
        &self,
        attrs1: &std::collections::HashMap<String, String>,
        attrs2: &std::collections::HashMap<String, String>,
    ) -> f64 {
        let important_attrs = ["id", "class", "name", "type", "role", "aria-label"];
        let mut matches = 0;
        let mut total = 0;

        for attr in &important_attrs {
            total += 1;
            if let (Some(val1), Some(val2)) = (attrs1.get(*attr), attrs2.get(*attr)) {
                if val1 == val2 {
                    matches += 1;
                } else if attr == &"class" {
                    let classes1: std::collections::HashSet<_> = val1.split_whitespace().collect();
                    let classes2: std::collections::HashSet<_> = val2.split_whitespace().collect();
                    let intersection: std::collections::HashSet<_> = 
                        classes1.intersection(&classes2).collect();
                    if !intersection.is_empty() {
                        matches += 1;
                    }
                }
            }
        }

        if total > 0 {
            matches as f64 / total as f64
        } else {
            0.0
        }
    }

    fn calculate_position_similarity(
        &self,
        box1: &BoundingBox,
        box2: &BoundingBox,
    ) -> f64 {
        let x_diff = (box1.x - box2.x).abs();
        let y_diff = (box1.y - box2.y).abs();
        
        let position_threshold = 100.0;
        
        let x_score = 1.0 - (x_diff / position_threshold).min(1.0);
        let y_score = 1.0 - (y_diff / position_threshold).min(1.0);
        
        (x_score + y_score) / 2.0
    }

    fn calculate_xpath_similarity(&self, xpath1: &str, xpath2: &str) -> f64 {
        let parts1: Vec<_> = xpath1.split('/').collect();
        let parts2: Vec<_> = xpath2.split('/').collect();
        
        let min_len = parts1.len().min(parts2.len());
        if min_len == 0 {
            return 0.0;
        }
        
        let mut matches = 0;
        for i in 0..min_len {
            if parts1[i] == parts2[i] {
                matches += 1;
            } else if parts1[i].split('[').next() == parts2[i].split('[').next() {
                matches += 0.5;
            }
        }
        
        matches as f64 / min_len as f64
    }

    pub fn recover_with_context(
        &self,
        failed_selector: &str,
        error_context: &str,
        snapshot: &str,
        historical_elements: &[ElementCandidate],
    ) -> anyhow::Result<ElementCandidate> {
        let current_elements = self.parse_snapshot_to_elements(snapshot)?;
        
        let original = historical_elements.iter()
            .find(|e| e.reference == failed_selector || e.css_selector == failed_selector)
            .cloned()
            .ok_or_else(|| anyhow::anyhow!("Original element not found in history"))?;

        if let Some(recovered) = self.find_similar_element(&original, &current_elements) {
            Ok(recovered)
        } else {
            Err(anyhow::anyhow!(
                "Could not recover element after {} attempts. Error: {}",
                historical_elements.len(),
                error_context
            ))
        }
    }

    fn parse_snapshot_to_elements(&self, _snapshot: &str) -> anyhow::Result<Vec<ElementCandidate>> {
        Ok(Vec::new())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_text_similarity() {
        let recovery = SmartElementRecovery::new(0.7);
        
        let score1 = recovery.calculate_text_similarity("Submit", "Submit");
        assert!(score1 > 0.9);
        
        let score2 = recovery.calculate_text_similarity("Submit", "Submit Form");
        assert!(score2 > 0.5);
        
        let score3 = recovery.calculate_text_similarity("Submit", "Cancel");
        assert!(score3 < 0.5);
    }

    #[test]
    fn test_attribute_similarity() {
        let recovery = SmartElementRecovery::new(0.7);
        
        let mut attrs1 = std::collections::HashMap::new();
        attrs1.insert("id".to_string(), "login-btn".to_string());
        attrs1.insert("class".to_string(), "btn primary".to_string());
        
        let mut attrs2 = std::collections::HashMap::new();
        attrs2.insert("id".to_string(), "login-btn".to_string());
        attrs2.insert("class".to_string(), "btn secondary".to_string());
        
        let score = recovery.calculate_attribute_similarity(&attrs1, &attrs2);
        assert!(score > 0.5);
    }

    #[test]
    fn test_position_similarity() {
        let recovery = SmartElementRecovery::new(0.7);
        
        let box1 = BoundingBox { x: 100.0, y: 200.0, width: 50.0, height: 30.0 };
        let box2 = BoundingBox { x: 105.0, y: 205.0, width: 50.0, height: 30.0 };
        
        let score = recovery.calculate_position_similarity(&box1, &box2);
        assert!(score > 0.9);
    }
}
