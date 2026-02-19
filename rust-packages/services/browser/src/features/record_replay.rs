use crate::browser::BrowserManager;
use crate::error::Result;
use crate::protocol::{Action, Params};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::{Duration, Instant};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecordedAction {
    pub timestamp_ms: u64,
    pub action: Action,
    pub params: Params,
    pub url: String,
    pub element_info: Option<ElementInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElementInfo {
    pub selector: String,
    pub tag_name: String,
    pub text_content: Option<String>,
    pub attributes: HashMap<String, String>,
    pub bounding_box: Option<BoundingBox>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BoundingBox {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Recording {
    pub name: String,
    pub description: Option<String>,
    pub start_url: String,
    pub actions: Vec<RecordedAction>,
    pub created_at: String,
    pub total_duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReplayOptions {
    pub speed_multiplier: f64,
    pub pause_on_error: bool,
    pub skip_delays: bool,
    pub max_replay_time_ms: u64,
}

impl Default for ReplayOptions {
    fn default() -> Self {
        Self {
            speed_multiplier: 1.0,
            pause_on_error: false,
            skip_delays: false,
            max_replay_time_ms: 300000, // 5 minutes
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReplayResult {
    pub success: bool,
    pub actions_completed: usize,
    pub actions_total: usize,
    pub errors: Vec<ReplayError>,
    pub duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReplayError {
    pub action_index: usize,
    pub action_type: String,
    pub error_message: String,
}

pub struct RecordingManager {
    recordings: HashMap<String, Recording>,
    is_recording: bool,
    current_recording: Option<Recording>,
    recording_start: Option<Instant>,
}

impl RecordingManager {
    pub fn new() -> Self {
        Self {
            recordings: HashMap::new(),
            is_recording: false,
            current_recording: None,
            recording_start: None,
        }
    }

    pub fn start_recording(&mut self, name: impl Into<String>, start_url: impl Into<String>) {
        self.is_recording = true;
        self.recording_start = Some(Instant::now());
        self.current_recording = Some(Recording {
            name: name.into(),
            description: None,
            start_url: start_url.into(),
            actions: Vec::new(),
            created_at: chrono::Utc::now().to_rfc3339(),
            total_duration_ms: 0,
        });
    }

    pub fn record_action(
        &mut self,
        action: Action,
        params: Params,
        url: String,
        element_info: Option<ElementInfo>,
    ) {
        if !self.is_recording || self.current_recording.is_none() {
            return;
        }

        let timestamp_ms = self
            .recording_start
            .map(|start| start.elapsed().as_millis() as u64)
            .unwrap_or(0);

        let recorded_action = RecordedAction {
            timestamp_ms,
            action,
            params,
            url,
            element_info,
        };

        if let Some(recording) = &mut self.current_recording {
            recording.actions.push(recorded_action);
        }
    }

    pub fn stop_recording(&mut self) -> Option<Recording> {
        self.is_recording = false;
        
        if let Some(mut recording) = self.current_recording.take() {
            if let Some(start) = self.recording_start {
                recording.total_duration_ms = start.elapsed().as_millis() as u64;
            }
            
            // Save to recordings collection
            self.recordings.insert(recording.name.clone(), recording.clone());
            
            self.recording_start = None;
            Some(recording)
        } else {
            None
        }
    }

    pub fn is_recording(&self) -> bool {
        self.is_recording
    }

    pub fn get_recording(&self, name: &str) -> Option<&Recording> {
        self.recordings.get(name)
    }

    pub fn delete_recording(&mut self, name: &str) {
        self.recordings.remove(name);
    }

    pub fn list_recordings(&self) -> Vec<&Recording> {
        self.recordings.values().collect()
    }

    pub fn export_to_script(&self, recording: &Recording, format: ScriptFormat) -> String {
        match format {
            ScriptFormat::JSON => {
                serde_json::to_string_pretty(recording).unwrap_or_default()
            }
            ScriptFormat::PythonPlaywright => {
                self.generate_playwright_script(recording)
            }
            ScriptFormat::JavaScriptPuppeteer => {
                self.generate_puppeteer_script(recording)
            }
            ScriptFormat::RustBrowserUse => {
                self.generate_rust_script(recording)
            }
            ScriptFormat::YAML => {
                // Simple YAML-like format
                let mut yaml = format!("name: {}\n", recording.name);
                yaml.push_str(&format!("start_url: {}\n", recording.start_url));
                yaml.push_str("actions:\n");
                
                for (i, action) in recording.actions.iter().enumerate() {
                    yaml.push_str(&format!("  - step: {}\n", i + 1));
                    yaml.push_str(&format!("    action: {:?}\n", action.action));
                    yaml.push_str(&format!("    url: {}\n", action.url));
                    if let Some(ref el) = action.element_info {
                        yaml.push_str(&format!("    selector: {}\n", el.selector));
                    }
                }
                yaml
            }
        }
    }

    fn generate_playwright_script(&self, recording: &Recording) -> String {
        let mut script = String::from(
            "from playwright.sync_api import sync_playwright\n\n"
        );
        script.push_str("def run():\n");
        script.push_str("    with sync_playwright() as p:\n");
        script.push_str("        browser = p.chromium.launch()\n");
        script.push_str("        page = browser.new_page()\n");
        script.push_str(&format!(
            "        page.goto('{}')\n",
            recording.start_url
        ));

        for action in &recording.actions {
            let line = match &action.action {
                Action::Click => {
                    if let Some(ref el) = action.element_info {
                        format!("        page.click('{}')\n", el.selector)
                    } else {
                        String::new()
                    }
                }
                Action::Fill | Action::Type => {
                    if let (Some(ref el), Some(value)) = (
                        &action.element_info,
                        self.extract_value_from_params(&action.params),
                    ) {
                        format!("        page.fill('{}', '{}')\n", el.selector, value)
                    } else {
                        String::new()
                    }
                }
                Action::Open => {
                    if let Some(url) = self.extract_url_from_params(&action.params) {
                        format!("        page.goto('{}')\n", url)
                    } else {
                        String::new()
                    }
                }
                _ => format!("        # {:?} not implemented\n", action.action),
            };
            script.push_str(&line);
        }

        script.push_str("        browser.close()\n\n");
        script.push_str("if __name__ == '__main__':\n");
        script.push_str("    run()\n");

        script
    }

    fn generate_puppeteer_script(&self, recording: &Recording) -> String {
        let mut script = String::from(
            "const puppeteer = require('puppeteer');\n\n"
        );
        script.push_str("(async () => {\n");
        script.push_str("    const browser = await puppeteer.launch();\n");
        script.push_str("    const page = await browser.newPage();\n");
        script.push_str(&format!(
            "    await page.goto('{}');\n",
            recording.start_url
        ));

        for action in &recording.actions {
            let line = match &action.action {
                Action::Click => {
                    if let Some(ref el) = action.element_info {
                        format!("    await page.click('{}');\n", el.selector)
                    } else {
                        String::new()
                    }
                }
                Action::Fill | Action::Type => {
                    if let (Some(ref el), Some(value)) = (
                        &action.element_info,
                        self.extract_value_from_params(&action.params),
                    ) {
                        format!(
                            "    await page.type('{}', '{}');\n",
                            el.selector, value
                        )
                    } else {
                        String::new()
                    }
                }
                _ => format!("    // {:?} not implemented\n", action.action),
            };
            script.push_str(&line);
        }

        script.push_str("    await browser.close();\n");
        script.push_str("})();\n");

        script
    }

    fn generate_rust_script(&self, recording: &Recording) -> String {
        let mut script = String::from("use browser_use::prelude::*;\n\n");
        script.push_str("#[tokio::main]\n");
        script.push_str("async fn main() -> Result<()> {\n");
        script.push_str("    let manager = BrowserManager::new();\n");
        script.push_str(&format!(
            "    // Navigate to: {}\n",
            recording.start_url
        ));

        for action in &recording.actions {
            let line = match &action.action {
                Action::Click => {
                    if let Some(ref el) = action.element_info {
                        format!(
                            "    manager.click(\"{}\").await?;\n",
                            el.selector
                        )
                    } else {
                        String::new()
                    }
                }
                Action::Fill => {
                    if let (Some(ref el), Some(value)) = (
                        &action.element_info,
                        self.extract_value_from_params(&action.params),
                    ) {
                        format!(
                            "    manager.fill(\"{}\", \"{}\").await?;\n",
                            el.selector, value
                        )
                    } else {
                        String::new()
                    }
                }
                _ => format!("    // {:?} not implemented\n", action.action),
            };
            script.push_str(&line);
        }

        script.push_str("    Ok(())\n");
        script.push_str("}\n");

        script
    }

    fn extract_value_from_params(&self, params: &Params) -> Option<String> {
        // Extract value from params based on action type
        None // Simplified for now
    }

    fn extract_url_from_params(&self, params: &Params) -> Option<String> {
        // Extract URL from params
        None // Simplified for now
    }

    pub async fn replay_recording(
        &self,
        browser_manager: &BrowserManager,
        recording: &Recording,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
        options: ReplayOptions,
    ) -> Result<ReplayResult> {
        let start_time = Instant::now();
        let mut errors = Vec::new();
        let mut actions_completed = 0;

        // Navigate to start URL
        browser_manager
            .execute_action(
                Action::Open,
                Params::Open(crate::protocol::params::OpenParams {
                    url: recording.start_url.clone(),
                }),
                session_id,
                headless,
                datadir,
                stealth,
            )
            .await?;

        let mut last_timestamp = 0u64;

        for (index, recorded_action) in recording.actions.iter().enumerate() {
            // Check timeout
            if start_time.elapsed().as_millis() as u64 > options.max_replay_time_ms {
                errors.push(ReplayError {
                    action_index: index,
                    action_type: format!("{:?}", recorded_action.action),
                    error_message: "Max replay time exceeded".to_string(),
                });
                break;
            }

            // Calculate delay
            if !options.skip_delays && index > 0 {
                let delay_ms = ((recorded_action.timestamp_ms - last_timestamp) as f64
                    / options.speed_multiplier) as u64;
                if delay_ms > 0 {
                    tokio::time::sleep(Duration::from_millis(delay_ms.min(5000))).await;
                }
            }
            last_timestamp = recorded_action.timestamp_ms;

            // Execute action
            match browser_manager
                .execute_action(
                    recorded_action.action.clone(),
                    recorded_action.params.clone(),
                    session_id,
                    headless,
                    datadir,
                    stealth,
                )
                .await
            {
                Ok(_) => {
                    actions_completed += 1;
                }
                Err(e) => {
                    errors.push(ReplayError {
                        action_index: index,
                        action_type: format!("{:?}", recorded_action.action),
                        error_message: e.to_string(),
                    });

                    if options.pause_on_error {
                        break;
                    }
                }
            }
        }

        Ok(ReplayResult {
            success: errors.is_empty(),
            actions_completed,
            actions_total: recording.actions.len(),
            errors,
            duration_ms: start_time.elapsed().as_millis() as u64,
        })
    }
}

#[derive(Debug, Clone, Copy)]
pub enum ScriptFormat {
    JSON,
    PythonPlaywright,
    JavaScriptPuppeteer,
    RustBrowserUse,
    YAML,
}
