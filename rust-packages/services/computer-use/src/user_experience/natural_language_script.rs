//! Natural Language to Script (Feature 18)
//!
//! Convert natural language descriptions into executable automation scripts

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Parsed intent from natural language
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParsedIntent {
    pub intent: String,
    pub confidence: f32,
    pub entities: Vec<Entity>,
    pub actions: Vec<ActionStep>,
    pub original_text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Entity {
    pub entity_type: String,
    pub value: String,
    pub start_pos: usize,
    pub end_pos: usize,
    pub confidence: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionStep {
    pub action_type: String,
    pub target: Option<String>,
    pub parameters: HashMap<String, String>,
    pub sequence: usize,
}

/// Generated script
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneratedScript {
    pub natural_language: String,
    pub code: String,
    pub language: String,
    pub steps: Vec<ScriptStep>,
    pub estimated_duration_ms: u64,
    pub confidence: f32,
    pub warnings: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScriptStep {
    pub line_number: usize,
    pub code: String,
    pub explanation: String,
}

/// NL to Script engine
pub struct NLScriptEngine {
    patterns: Vec<IntentPattern>,
    templates: HashMap<String, CodeTemplate>,
    examples: Vec<NLExample>,
}

#[derive(Debug, Clone)]
struct IntentPattern {
    intent: String,
    keywords: Vec<String>,
    entity_patterns: Vec<EntityPattern>,
    template_key: String,
}

#[derive(Debug, Clone)]
struct EntityPattern {
    entity_type: String,
    patterns: Vec<String>,
}

#[derive(Debug, Clone)]
struct CodeTemplate {
    key: String,
    template: String,
    requires: Vec<String>,
}

#[derive(Debug, Clone)]
struct NLExample {
    natural_language: String,
    generated_code: String,
    intent: String,
}

impl NLScriptEngine {
    pub fn new() -> Self {
        let mut engine = Self {
            patterns: Vec::new(),
            templates: HashMap::new(),
            examples: Vec::new(),
        };

        engine.initialize_patterns();
        engine.initialize_templates();
        engine.initialize_examples();

        engine
    }

    /// Convert natural language to script
    pub async fn convert(&self, natural_language: &str) -> Result<GeneratedScript> {
        // 1. Parse intent
        let parsed = self.parse_intent(natural_language).await?;

        // 2. Find best matching template
        let template = self.find_template(&parsed.intent)?;

        // 3. Generate code
        let code = self.generate_code(&parsed, &template)?;

        // 4. Create script steps
        let steps = self.create_steps(&code);

        // 5. Validate generated script
        let warnings = self.validate(&code);

        Ok(GeneratedScript {
            natural_language: natural_language.to_string(),
            code,
            language: "rust".to_string(),
            steps,
            estimated_duration_ms: self.estimate_duration(&parsed),
            confidence: parsed.confidence,
            warnings,
        })
    }

    /// Convert and execute immediately
    pub async fn convert_and_run(&self, natural_language: &str) -> Result<String> {
        let script = self.convert(natural_language).await?;
        
        // Execute the generated script
        self.execute_script(&script).await
    }

    /// Batch convert multiple NL descriptions
    pub async fn convert_batch(&self, descriptions: &[String]) -> Vec<Result<GeneratedScript>> {
        let mut results = Vec::new();
        
        for desc in descriptions {
            results.push(self.convert(desc).await);
        }
        
        results
    }

    /// Get similar examples
    pub fn find_similar_examples(&self, natural_language: &str, limit: usize) -> Vec<&NLExample> {
        self.examples
            .iter()
            .filter(|e| self.similarity(&e.natural_language, natural_language) > 0.5)
            .take(limit)
            .collect()
    }

    /// Add custom pattern
    pub fn add_pattern(&mut self, intent: &str, keywords: Vec<&str>, template_key: &str) {
        self.patterns.push(IntentPattern {
            intent: intent.to_string(),
            keywords: keywords.iter().map(|&s| s.to_string()).collect(),
            entity_patterns: vec![],
            template_key: template_key.to_string(),
        });
    }

    /// Add custom template
    pub fn add_template(&mut self, key: &str, template: &str, requires: Vec<&str>) {
        self.templates.insert(key.to_string(), CodeTemplate {
            key: key.to_string(),
            template: template.to_string(),
            requires: requires.iter().map(|&s| s.to_string()).collect(),
        });
    }

    async fn parse_intent(&self, text: &str) -> Result<ParsedIntent> {
        let lower = text.to_lowercase();
        
        // Find matching pattern
        let mut best_match: Option<&IntentPattern> = None;
        let mut best_score = 0.0;

        for pattern in &self.patterns {
            let score = self.match_score(&lower, pattern);
            if score > best_score {
                best_score = score;
                best_match = Some(pattern);
            }
        }

        let intent = best_match.map(|p| p.intent.clone()).unwrap_or_else(|| "unknown".to_string());
        
        // Extract entities
        let entities = self.extract_entities(text);

        // Build action steps
        let actions = self.build_action_steps(&intent, &entities);

        Ok(ParsedIntent {
            intent,
            confidence: best_score,
            entities,
            actions,
            original_text: text.to_string(),
        })
    }

    fn match_score(&self, text: &str, pattern: &IntentPattern) -> f32 {
        let mut score = 0.0;
        
        for keyword in &pattern.keywords {
            if text.contains(keyword) {
                score += 1.0;
            }
        }
        
        score / pattern.keywords.len().max(1) as f32
    }

    fn extract_entities(&self, text: &str) -> Vec<Entity> {
        let mut entities = Vec::new();
        let lower = text.to_loweracase();

        // Extract quoted strings
        let re = regex::Regex::new(r#"["']([^"']+)["']"#).unwrap();
        for (start, end, value) in re.find_iter(text).map(|m| (m.start(), m.end(), m.as_str())) {
            entities.push(Entity {
                entity_type: "text".to_string(),
                value: value.to_string(),
                start_pos: start,
                end_pos: end,
                confidence: 0.9,
            });
        }

        // Extract numbers
        let num_re = regex::Regex::new(r"\b\d+\b").unwrap();
        for m in num_re.find_iter(text) {
            entities.push(Entity {
                entity_type: "number".to_string(),
                value: m.as_str().to_string(),
                start_pos: m.start(),
                end_pos: m.end(),
                confidence: 0.95,
            });
        }

        // Extract app names (capitalized words)
        let app_re = regex::Regex::new(r"\b[A-Z][a-zA-Z]+\b").unwrap();
        for m in app_re.find_iter(text) {
            if !entities.iter().any(|e| e.start_pos == m.start()) {
                entities.push(Entity {
                    entity_type: "application".to_string(),
                    value: m.as_str().to_string(),
                    start_pos: m.start(),
                    end_pos: m.end(),
                    confidence: 0.7,
                });
            }
        }

        entities
    }

    fn build_action_steps(&self, intent: &str, entities: &[Entity]) -> Vec<ActionStep> {
        let mut steps = Vec::new();

        match intent {
            "open_app" => {
                if let Some(app) = entities.iter().find(|e| e.entity_type == "application") {
                    steps.push(ActionStep {
                        action_type: "launch".to_string(),
                        target: Some(app.value.clone()),
                        parameters: HashMap::new(),
                        sequence: 1,
                    });
                }
            }
            "click_element" => {
                steps.push(ActionStep {
                    action_type: "click".to_string(),
                    target: entities.first().map(|e| e.value.clone()),
                    parameters: HashMap::new(),
                    sequence: 1,
                });
            }
            "type_text" => {
                if let Some(text) = entities.iter().find(|e| e.entity_type == "text") {
                    steps.push(ActionStep {
                        action_type: "type".to_string(),
                        target: None,
                        parameters: {
                            let mut p = HashMap::new();
                            p.insert("text".to_string(), text.value.clone());
                            p
                        },
                        sequence: 1,
                    });
                }
            }
            _ => {}
        }

        steps
    }

    fn find_template(&self, intent: &str) -> Result<CodeTemplate> {
        let pattern = self.patterns.iter()
            .find(|p| p.intent == intent)
            .ok_or_else(|| anyhow::anyhow!("No pattern found for intent: {}", intent))?;

        self.templates.get(&pattern.template_key)
            .cloned()
            .ok_or_else(|| anyhow::anyhow!("Template not found: {}", pattern.template_key))
    }

    fn generate_code(&self, parsed: &ParsedIntent, template: &CodeTemplate) -> Result<String> {
        let mut code = template.template.clone();

        // Replace placeholders
        for (i, entity) in parsed.entities.iter().enumerate() {
            code = code.replace(&format!("{{{{{}}}}}", entity.entity_type), &entity.value);
            code = code.replace(&format!("{{{}}}", i), &entity.value);
        }

        // Replace intent-specific placeholders
        code = code.replace("{{intent}}", &parsed.intent);

        Ok(code)
    }

    fn create_steps(&self, code: &str) -> Vec<ScriptStep> {
        code.lines()
            .enumerate()
            .map(|(i, line)| ScriptStep {
                line_number: i + 1,
                code: line.to_string(),
                explanation: self.explain_line(line),
            })
            .collect()
    }

    fn explain_line(&self, line: &str) -> String {
        if line.contains("launch") {
            "Opens the specified application".to_string()
        } else if line.contains("click") {
            "Clicks on the target element".to_string()
        } else if line.contains("type") {
            "Types the specified text".to_string()
        } else {
            "Executes this action".to_string()
        }
    }

    fn validate(&self, code: &str) -> Vec<String> {
        let mut warnings = Vec::new();

        if !code.contains("use computer_use") {
            warnings.push("Missing import statement".to_string());
        }

        if !code.contains("main") && !code.contains("run") {
            warnings.push("No entry point defined".to_string());
        }

        warnings
    }

    fn estimate_duration(&self, parsed: &ParsedIntent) -> u64 {
        let base_ms = 500;
        let per_action_ms = 1000;
        
        base_ms + (parsed.actions.len() as u64 * per_action_ms)
    }

    async fn execute_script(&self, script: &GeneratedScript) -> Result<String> {
        // Execute the generated code
        // In real implementation, this would compile and run the Rust code
        Ok(format!("Executed {} steps", script.steps.len()))
    }

    fn similarity(&self, a: &str, b: &str) -> f32 {
        // Simple word-based similarity
        let a_lower = a.to_lowercase();
        let b_lower = b.to_lowercase();
        let words_a: std::collections::HashSet<_> = a_lower.split_whitespace().collect();
        let words_b: std::collections::HashSet<_> = b_lower.split_whitespace().collect();
        
        let intersection = words_a.intersection(&words_b).count();
        let union = words_a.union(&words_b).count();
        
        if union == 0 {
            0.0
        } else {
            intersection as f32 / union as f32
        }
    }

    fn initialize_patterns(&mut self) {
        self.patterns.push(IntentPattern {
            intent: "open_app".to_string(),
            keywords: vec!["open".to_string(), "launch".to_string(), "start".to_string()],
            entity_patterns: vec![EntityPattern {
                entity_type: "application".to_string(),
                patterns: vec![],
            }],
            template_key: "open_app".to_string(),
        });

        self.patterns.push(IntentPattern {
            intent: "click_element".to_string(),
            keywords: vec!["click".to_string(), "press".to_string(), "tap".to_string()],
            entity_patterns: vec![],
            template_key: "click".to_string(),
        });

        self.patterns.push(IntentPattern {
            intent: "type_text".to_string(),
            keywords: vec!["type".to_string(), "enter".to_string(), "input".to_string()],
            entity_patterns: vec![],
            template_key: "type".to_string(),
        });
    }

    fn initialize_templates(&mut self) {
        self.templates.insert("open_app".to_string(), CodeTemplate {
            key: "open_app".to_string(),
            template: r#"use computer_use::prelude::*;

async fn main() -> Result<()> {
    let agent = ComputerUseAgent::new();
    agent.launch("{{application}}").await?;
    Ok(())
}"#.to_string(),
            requires: vec!["computer_use".to_string()],
        });

        self.templates.insert("click".to_string(), CodeTemplate {
            key: "click".to_string(),
            template: r#"agent.click("{{target}}").await?;"#.to_string(),
            requires: vec![],
        });

        self.templates.insert("type".to_string(), CodeTemplate {
            key: "type".to_string(),
            template: r#"agent.type_text("{{text}}").await?;"#.to_string(),
            requires: vec![],
        });
    }

    fn initialize_examples(&mut self) {
        self.examples.push(NLExample {
            natural_language: "Open Chrome browser".to_string(),
            generated_code: r#"use computer_use::prelude::*;

async fn main() -> Result<()> {
    let agent = ComputerUseAgent::new();
    agent.launch("chrome").await?;
    Ok(())
}"#.to_string(),
            intent: "open_app".to_string(),
        });
    }
}
