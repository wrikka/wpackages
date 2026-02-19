use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtractionRule {
    pub name: String,
    pub selector: String,
    pub extract_type: ExtractType,
    pub transform: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ExtractType {
    Text,
    Html,
    Attribute(String),
    Count,
    Exists,
    Table,
    List,
    Regex(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtractionResult {
    pub name: String,
    pub value: ExtractedValue,
    pub selector: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum ExtractedValue {
    String(String),
    Number(f64),
    Boolean(bool),
    Array(Vec<ExtractedValue>),
    Object(HashMap<String, ExtractedValue>),
    Null,
}

#[derive(Debug, Clone)]
pub struct DataExtractionDsl {
    rules: Vec<ExtractionRule>,
}

impl DataExtractionDsl {
    pub fn new() -> Self {
        Self { rules: Vec::new() }
    }

    pub fn add_rule(&mut self, rule: ExtractionRule) {
        self.rules.push(rule);
    }

    pub fn parse_dsl(dsl: &str) -> anyhow::Result<Self> {
        let mut extractor = Self::new();
        
        for line in dsl.lines() {
            let line = line.trim();
            if line.is_empty() || line.starts_with('#') {
                continue;
            }
            
            let parts: Vec<&str> = line.splitn(3, ' ').collect();
            if parts.len() < 2 {
                continue;
            }
            
            let name = parts[0].to_string();
            let selector = parts[1].to_string();
            let extract_type = if parts.len() >= 3 {
                Self::parse_extract_type(parts[2])?
            } else {
                ExtractType::Text
            };
            
            extractor.add_rule(ExtractionRule {
                name,
                selector,
                extract_type,
                transform: None,
            });
        }
        
        Ok(extractor)
    }

    fn parse_extract_type(s: &str) -> anyhow::Result<ExtractType> {
        let parts: Vec<&str> = s.splitn(2, ':').collect();
        match parts[0] {
            "text" => Ok(ExtractType::Text),
            "html" => Ok(ExtractType::Html),
            "count" => Ok(ExtractType::Count),
            "exists" => Ok(ExtractType::Exists),
            "table" => Ok(ExtractType::Table),
            "list" => Ok(ExtractType::List),
            "attr" => {
                if parts.len() > 1 {
                    Ok(ExtractType::Attribute(parts[1].to_string()))
                } else {
                    Err(anyhow::anyhow!("Attribute name required for attr type"))
                }
            }
            "regex" => {
                if parts.len() > 1 {
                    Ok(ExtractType::Regex(parts[1].to_string()))
                } else {
                    Err(anyhow::anyhow!("Pattern required for regex type"))
                }
            }
            _ => Ok(ExtractType::Text),
        }
    }

    pub fn extract(&self, html: &str) -> Vec<ExtractionResult> {
        let mut results = Vec::new();
        
        for rule in &self.rules {
            let value = match &rule.extract_type {
                ExtractType::Text => self.extract_text(html, &rule.selector),
                ExtractType::Html => self.extract_html(html, &rule.selector),
                ExtractType::Attribute(attr) => self.extract_attribute(html, &rule.selector, attr),
                ExtractType::Count => self.extract_count(html, &rule.selector),
                ExtractType::Exists => self.extract_exists(html, &rule.selector),
                ExtractType::Table => self.extract_table(html, &rule.selector),
                ExtractType::List => self.extract_list(html, &rule.selector),
                ExtractType::Regex(pattern) => self.extract_regex(html, pattern),
            };
            
            results.push(ExtractionResult {
                name: rule.name.clone(),
                value,
                selector: rule.selector.clone(),
            });
        }
        
        results
    }

    fn extract_text(&self, html: &str, selector: &str) -> ExtractedValue {
        ExtractedValue::String(format!("Extracted text from {}", selector))
    }

    fn extract_html(&self, _html: &str, _selector: &str) -> ExtractedValue {
        ExtractedValue::String("html".to_string())
    }

    fn extract_attribute(&self, _html: &str, _selector: &str, _attr: &str) -> ExtractedValue {
        ExtractedValue::String("attribute".to_string())
    }

    fn extract_count(&self, html: &str, selector: &str) -> ExtractedValue {
        let count = html.matches(selector).count() as f64;
        ExtractedValue::Number(count)
    }

    fn extract_exists(&self, html: &str, selector: &str) -> ExtractedValue {
        ExtractedValue::Boolean(html.contains(selector))
    }

    fn extract_table(&self, _html: &str, _selector: &str) -> ExtractedValue {
        let mut table = HashMap::new();
        table.insert("rows".to_string(), ExtractedValue::Number(0.0));
        ExtractedValue::Object(table)
    }

    fn extract_list(&self, _html: &str, _selector: &str) -> ExtractedValue {
        ExtractedValue::Array(vec![])
    }

    fn extract_regex(&self, html: &str, pattern: &str) -> ExtractedValue {
        let regex = regex::Regex::new(pattern).ok();
        if let Some(re) = regex {
            let matches: Vec<ExtractedValue> = re.find_iter(html)
                .map(|m| ExtractedValue::String(m.as_str().to_string()))
                .collect();
            ExtractedValue::Array(matches)
        } else {
            ExtractedValue::Null
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_dsl() {
        let dsl = r#"
# Extract product information
product_title h1 text
price .price text
count .item count
exists #cart exists
        "#;
        
        let extractor = DataExtractionDsl::parse_dsl(dsl).unwrap();
        assert_eq!(extractor.rules.len(), 4);
    }

    #[test]
    fn test_extract_exists() {
        let dsl = DataExtractionDsl::new();
        let html = "<div id='test'>content</div>";
        
        let result = dsl.extract_exists(html, "id='test'");
        assert!(matches!(result, ExtractedValue::Boolean(true)));
    }
}
