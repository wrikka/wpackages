use crate::browser::BrowserManager;
use crate::error::Result;
use crate::protocol::{Action, Params};
use crate::protocol::params::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VisualElement {
    pub selector: String,
    pub bounding_box: BoundingBox,
    pub element_type: String,
    pub confidence: f64,
    pub text_content: Option<String>,
    pub attributes: Vec<(String, String)>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BoundingBox {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VisualAnalysis {
    pub url: String,
    pub viewport: ViewportInfo,
    pub elements: Vec<VisualElement>,
    pub color_palette: Vec<String>,
    pub layout_structure: LayoutStructure,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ViewportInfo {
    pub width: u32,
    pub height: u32,
    pub device_scale_factor: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LayoutStructure {
    pub header: Option<Region>,
    pub sidebar: Option<Region>,
    pub main_content: Option<Region>,
    pub footer: Option<Region>,
    pub navigation: Vec<Region>,
    pub forms: Vec<Region>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Region {
    pub name: String,
    pub bounding_box: BoundingBox,
    pub element_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIVisionConfig {
    pub api_endpoint: String,
    pub api_key: Option<String>,
    pub model: String,
    pub enable_object_detection: bool,
    pub enable_text_recognition: bool,
    pub enable_layout_analysis: bool,
}

impl Default for AIVisionConfig {
    fn default() -> Self {
        Self {
            api_endpoint: "https://api.openai.com/v1/chat/completions".to_string(),
            api_key: None,
            model: "gpt-4-vision-preview".to_string(),
            enable_object_detection: true,
            enable_text_recognition: true,
            enable_layout_analysis: true,
        }
    }
}

pub struct VisualAnalyzer {
    config: AIVisionConfig,
}

impl VisualAnalyzer {
    pub fn new(config: AIVisionConfig) -> Self {
        Self { config }
    }

    pub fn with_api_key(mut self, key: impl Into<String>) -> Self {
        self.config.api_key = Some(key.into());
        self
    }

    pub async fn analyze_page(
        &self,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
    ) -> Result<VisualAnalysis> {
        // Get page info
        let title_result = browser_manager
            .execute_action(Action::GetTitle, Params::Empty, session_id, headless, datadir, stealth)
            .await?;
        
        let url_result = browser_manager
            .execute_action(Action::GetUrl, Params::Empty, session_id, headless, datadir, stealth)
            .await?;

        let url = url_result.and_then(|v| v.as_str().map(|s| s.to_string()))
            .unwrap_or_default();

        // Get viewport dimensions via JS
        let viewport_js = r#"
            JSON.stringify({
                width: window.innerWidth,
                height: window.innerHeight,
                deviceScaleFactor: window.devicePixelRatio
            })
        "#;
        
        let viewport_result = browser_manager
            .execute_action(
                Action::ExecuteJs,
                Params::ExecuteJs(crate::protocol::js_executor::ExecuteJsRequest {
                    session_id: Some(session_id.to_string()),
                    script: viewport_js.to_string(),
                }),
                session_id,
                headless,
                datadir,
                stealth,
            )
            .await?;

        let viewport = if let Some(data) = viewport_result {
            if let Some(json_str) = data.as_str() {
                serde_json::from_str::<ViewportInfo>(json_str)
                    .unwrap_or_else(|_| ViewportInfo {
                        width: 1920,
                        height: 1080,
                        device_scale_factor: 1.0,
                    })
            } else {
                ViewportInfo {
                    width: 1920,
                    height: 1080,
                    device_scale_factor: 1.0,
                }
            }
        } else {
            ViewportInfo {
                width: 1920,
                height: 1080,
                device_scale_factor: 1.0,
            }
        };

        // Get all elements with their bounding boxes
        let elements_js = r#"
            (function() {
                const elements = [];
                const allElements = document.querySelectorAll('*');
                
                for (const el of allElements) {
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0) {
                        const attrs = {};
                        for (const attr of el.attributes) {
                            attrs[attr.name] = attr.value;
                        }
                        
                        elements.push({
                            tag: el.tagName.toLowerCase(),
                            id: el.id,
                            class: el.className,
                            boundingBox: {
                                x: rect.left,
                                y: rect.top,
                                width: rect.width,
                                height: rect.height
                            },
                            text: el.textContent?.substring(0, 200),
                            attributes: attrs
                        });
                    }
                }
                
                return JSON.stringify(elements.slice(0, 100)); // Limit to 100 elements
            })()
        "#;

        let elements_result = browser_manager
            .execute_action(
                Action::ExecuteJs,
                Params::ExecuteJs(crate::protocol::js_executor::ExecuteJsRequest {
                    session_id: Some(session_id.to_string()),
                    script: elements_js.to_string(),
                }),
                session_id,
                headless,
                datadir,
                stealth,
            )
            .await?;

        let mut visual_elements = Vec::new();
        
        if let Some(data) = elements_result {
            if let Some(json_str) = data.as_str() {
                if let Ok(js_elements) = serde_json::from_str::<Vec<serde_json::Value>>(json_str) {
                    for (i, el) in js_elements.iter().enumerate() {
                        if let (Some(tag), Some(bbox)) = (
                            el.get("tag").and_then(|v| v.as_str()),
                            el.get("boundingBox"),
                        ) {
                            let bb = BoundingBox {
                                x: bbox.get("x").and_then(|v| v.as_f64()).unwrap_or(0.0),
                                y: bbox.get("y").and_then(|v| v.as_f64()).unwrap_or(0.0),
                                width: bbox.get("width").and_then(|v| v.as_f64()).unwrap_or(0.0),
                                height: bbox.get("height").and_then(|v| v.as_f64()).unwrap_or(0.0),
                            };

                            let attrs: Vec<(String, String)> = el
                                .get("attributes")
                                .and_then(|v| v.as_object())
                                .map(|obj| {
                                    obj.iter()
                                        .filter_map(|(k, v)| {
                                            v.as_str().map(|s| (k.clone(), s.to_string()))
                                        })
                                        .collect()
                                })
                                .unwrap_or_default();

                            visual_elements.push(VisualElement {
                                selector: format!("#visual-element-{}", i),
                                bounding_box: bb,
                                element_type: tag.to_string(),
                                confidence: 0.9,
                                text_content: el
                                    .get("text")
                                    .and_then(|v| v.as_str())
                                    .map(|s| s.to_string()),
                                attributes: attrs,
                            });
                        }
                    }
                }
            }
        }

        // Detect layout structure
        let layout = self.detect_layout_structure(&visual_elements, &viewport);

        // Extract color palette
        let color_js = r#"
            (function() {
                const colors = new Set();
                const elements = document.querySelectorAll('*');
                
                for (const el of elements) {
                    const style = window.getComputedStyle(el);
                    const bgColor = style.backgroundColor;
                    const color = style.color;
                    
                    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                        colors.add(bgColor);
                    }
                    if (color && color !== 'rgba(0, 0, 0, 0)') {
                        colors.add(color);
                    }
                }
                
                return JSON.stringify(Array.from(colors).slice(0, 10));
            })()
        "#;

        let colors_result = browser_manager
            .execute_action(
                Action::ExecuteJs,
                Params::ExecuteJs(crate::protocol::js_executor::ExecuteJsRequest {
                    session_id: Some(session_id.to_string()),
                    script: color_js.to_string(),
                }),
                session_id,
                headless,
                datadir,
                stealth,
            )
            .await?;

        let color_palette = if let Some(data) = colors_result {
            data.as_str()
                .and_then(|s| serde_json::from_str::<Vec<String>>(s).ok())
                .unwrap_or_default()
        } else {
            Vec::new()
        };

        Ok(VisualAnalysis {
            url,
            viewport,
            elements: visual_elements,
            color_palette,
            layout_structure: layout,
        })
    }

    fn detect_layout_structure(
        &self,
        elements: &[VisualElement],
        viewport: &ViewportInfo,
    ) -> LayoutStructure {
        let mut header = None;
        let mut sidebar = None;
        let mut main_content = None;
        let mut footer = None;
        let mut navigation = Vec::new();
        let mut forms = Vec::new();

        // Simple heuristics for layout detection
        for el in elements {
            let bb = &el.bounding_box;
            
            // Header detection (top 15% of viewport)
            if bb.y < viewport.height as f64 * 0.15 && bb.height < 200.0 {
                if el.element_type == "header" || 
                   el.attributes.iter().any(|(k, v)| 
                       k == "role" && v == "banner" ||
                       (k == "class" && v.to_lowercase().contains("header"))
                   ) {
                    header = Some(Region {
                        name: "header".to_string(),
                        bounding_box: bb.clone(),
                        element_count: 1,
                    });
                }
            }
            
            // Sidebar detection (left/right 20% of viewport)
            if bb.width < viewport.width as f64 * 0.25 && bb.height > viewport.height as f64 * 0.5 {
                if el.attributes.iter().any(|(k, v)| 
                    k == "class" && (v.to_lowercase().contains("sidebar") || v.to_lowercase().contains("aside"))
                ) {
                    sidebar = Some(Region {
                        name: "sidebar".to_string(),
                        bounding_box: bb.clone(),
                        element_count: 1,
                    });
                }
            }
            
            // Navigation detection
            if el.element_type == "nav" || 
               el.attributes.iter().any(|(k, v)| 
                   k == "role" && v == "navigation" ||
                   (k == "class" && v.to_lowercase().contains("nav"))
               ) {
                navigation.push(Region {
                    name: format!("nav-{}", navigation.len()),
                    bounding_box: bb.clone(),
                    element_count: 1,
                });
            }
            
            // Form detection
            if el.element_type == "form" {
                forms.push(Region {
                    name: format!("form-{}", forms.len()),
                    bounding_box: bb.clone(),
                    element_count: 1,
                });
            }
            
            // Footer detection (bottom 10% of viewport)
            if bb.y > viewport.height as f64 * 0.9 {
                if el.element_type == "footer" || 
                   el.attributes.iter().any(|(k, v)| 
                       k == "role" && v == "contentinfo" ||
                       (k == "class" && v.to_lowercase().contains("footer"))
                   ) {
                    footer = Some(Region {
                        name: "footer".to_string(),
                        bounding_box: bb.clone(),
                        element_count: 1,
                    });
                }
            }
        }

        LayoutStructure {
            header,
            sidebar,
            main_content,
            footer,
            navigation,
            forms,
        }
    }

    pub async fn find_element_by_visual_description(
        &self,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
        description: &str,
    ) -> Result<Option<VisualElement>> {
        let analysis = self.analyze_page(browser_manager, session_id, headless, datadir, stealth).await?;
        
        // Simple keyword matching for now
        // In a full implementation, this would use an AI vision model
        let keywords: Vec<&str> = description.to_lowercase().split_whitespace().collect();
        
        let best_match = analysis.elements.iter()
            .filter(|el| {
                let text = el.text_content.as_deref().unwrap_or("").to_lowercase();
                let el_type = el.element_type.to_lowercase();
                
                keywords.iter().any(|kw| {
                    text.contains(kw) || 
                    el_type.contains(kw) ||
                    el.attributes.iter().any(|(k, v)| {
                        v.to_lowercase().contains(kw) || k.to_lowercase().contains(kw)
                    })
                })
            })
            .max_by(|a, b| {
                let a_score = self.score_element_match(a, &keywords);
                let b_score = self.score_element_match(b, &keywords);
                a_score.partial_cmp(&b_score).unwrap_or(std::cmp::Ordering::Equal)
            });

        Ok(best_match.cloned())
    }

    fn score_element_match(&self, element: &VisualElement, keywords: &[&str]) -> f64 {
        let mut score = element.confidence;
        
        let text = element.text_content.as_deref().unwrap_or("").to_lowercase();
        let el_type = element.element_type.to_lowercase();
        
        for kw in keywords {
            if text.contains(kw) {
                score += 0.3;
            }
            if el_type.contains(kw) {
                score += 0.2;
            }
            for (k, v) in &element.attributes {
                if k.to_lowercase().contains(kw) || v.to_lowercase().contains(kw) {
                    score += 0.1;
                }
            }
        }
        
        score
    }
}
