use crate::browser::BrowserManager;
use crate::error::Result;
use crate::protocol::{Action, Params};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FormField {
    pub selector: String,
    pub field_type: FieldType,
    pub label: Option<String>,
    pub placeholder: Option<String>,
    pub name: Option<String>,
    pub id: Option<String>,
    pub required: bool,
    pub value: Option<String>,
    pub options: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FieldType {
    Text,
    Email,
    Password,
    Number,
    Telephone,
    Url,
    Date,
    Time,
    Select,
    Checkbox,
    Radio,
    Textarea,
    File,
    Hidden,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoFillProfile {
    pub name: String,
    pub fields: HashMap<String, String>,
    pub patterns: Vec<FieldPattern>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FieldPattern {
    pub pattern: String,
    pub field_key: String,
    pub confidence: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectedForm {
    pub selector: String,
    pub fields: Vec<FormField>,
    pub submit_button: Option<String>,
    pub action_url: Option<String>,
    pub method: String,
}

pub struct AutoFormFiller;

impl AutoFormFiller {
    pub fn new() -> Self {
        Self
    }

    pub async fn detect_form(
        &self,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
    ) -> Result<Vec<DetectedForm>> {
        let detection_js = r#"
            (function() {
                const forms = [];
                const formElements = document.querySelectorAll('form');
                
                for (const form of formElements) {
                    const fields = [];
                    const inputs = form.querySelectorAll('input, select, textarea');
                    
                    for (const input of inputs) {
                        const fieldType = input.type || 'text';
                        const fieldInfo = {
                            selector: input.id ? `#${input.id}` : 
                                     input.name ? `[name="${input.name}"]` :
                                     input.className ? `.${input.className.split(' ')[0]}` :
                                     input.tagName.toLowerCase(),
                            field_type: fieldType,
                            label: null,
                            placeholder: input.placeholder || null,
                            name: input.name || null,
                            id: input.id || null,
                            required: input.required || false,
                            value: input.value || null,
                            options: []
                        };
                        
                        // Get label
                        if (input.id) {
                            const label = document.querySelector(`label[for="${input.id}"]`);
                            if (label) {
                                fieldInfo.label = label.innerText.trim();
                            }
                        }
                        
                        // Get select options
                        if (input.tagName === 'SELECT') {
                            for (const option of input.options) {
                                fieldInfo.options.push(option.value);
                            }
                        }
                        
                        fields.push(fieldInfo);
                    }
                    
                    // Find submit button
                    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"], button:not([type])');
                    
                    forms.push({
                        selector: form.id ? `#${form.id}` : 'form',
                        fields: fields,
                        submit_button: submitBtn ? (submitBtn.id ? `#${submitBtn.id}` : 'button[type="submit"]') : null,
                        action_url: form.action || null,
                        method: form.method || 'get'
                    });
                }
                
                return JSON.stringify(forms);
            })()
        "#;

        let result = browser_manager
            .execute_action(
                Action::ExecuteJs,
                Params::ExecuteJs(crate::protocol::js_executor::ExecuteJsRequest {
                    session_id: Some(session_id.to_string()),
                    script: detection_js.to_string(),
                }),
                session_id,
                headless,
                datadir,
                stealth,
            )
            .await?;

        let mut detected_forms = Vec::new();
        
        if let Some(data) = result {
            if let Some(json_str) = data.as_str() {
                if let Ok(forms) = serde_json::from_str::<Vec<serde_json::Value>>(json_str) {
                    for form in forms {
                        let fields: Vec<FormField> = form
                            .get("fields")
                            .and_then(|f| f.as_array())
                            .map(|arr| {
                                arr.iter()
                                    .filter_map(|f| {
                                        Some(FormField {
                                            selector: f.get("selector")?.as_str()?.to_string(),
                                            field_type: Self::parse_field_type(
                                                f.get("field_type")?.as_str()?.to_string()
                                            ),
                                            label: f.get("label").and_then(|v| v.as_str()).map(|s| s.to_string()),
                                            placeholder: f.get("placeholder").and_then(|v| v.as_str()).map(|s| s.to_string()),
                                            name: f.get("name").and_then(|v| v.as_str()).map(|s| s.to_string()),
                                            id: f.get("id").and_then(|v| v.as_str()).map(|s| s.to_string()),
                                            required: f.get("required").and_then(|v| v.as_bool()).unwrap_or(false),
                                            value: f.get("value").and_then(|v| v.as_str()).map(|s| s.to_string()),
                                            options: f.get("options")
                                                .and_then(|v| v.as_array())
                                                .map(|arr| {
                                                    arr.iter()
                                                        .filter_map(|v| v.as_str().map(|s| s.to_string()))
                                                        .collect()
                                                })
                                                .unwrap_or_default(),
                                        })
                                    })
                                    .collect()
                            })
                            .unwrap_or_default();

                        detected_forms.push(DetectedForm {
                            selector: form
                                .get("selector")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string())
                                .unwrap_or_else(|| "form".to_string()),
                            fields,
                            submit_button: form
                                .get("submit_button")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                            action_url: form
                                .get("action_url")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string()),
                            method: form
                                .get("method")
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string())
                                .unwrap_or_else(|| "get".to_string()),
                        });
                    }
                }
            }
        }

        Ok(detected_forms)
    }

    fn parse_field_type(type_str: String) -> FieldType {
        match type_str.as_str() {
            "email" => FieldType::Email,
            "password" => FieldType::Password,
            "number" => FieldType::Number,
            "tel" => FieldType::Telephone,
            "url" => FieldType::Url,
            "date" => FieldType::Date,
            "time" => FieldType::Time,
            "select-one" => FieldType::Select,
            "checkbox" => FieldType::Checkbox,
            "radio" => FieldType::Radio,
            "textarea" => FieldType::Textarea,
            "file" => FieldType::File,
            "hidden" => FieldType::Hidden,
            _ => FieldType::Text,
        }
    }

    pub async fn auto_fill_form(
        &self,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
        form: &DetectedForm,
        profile: &AutoFillProfile,
    ) -> Result<HashMap<String, bool>> {
        let mut fill_results = HashMap::new();

        for field in &form.fields {
            // Find matching value from profile
            let value = self.find_value_for_field(field, profile);

            if let Some(val) = value {
                let success = self
                    .fill_field(
                        browser_manager,
                        session_id,
                        headless,
                        datadir,
                        stealth,
                        &field.selector,
                        &val,
                        &field.field_type,
                    )
                    .await?;

                fill_results.insert(field.selector.clone(), success);
            }
        }

        Ok(fill_results)
    }

    fn find_value_for_field(&self, field: &FormField, profile: &AutoFillProfile) -> Option<String> {
        // Check exact matches first
        if let Some(value) = field.name.as_ref().and_then(|n| profile.fields.get(n)) {
            return Some(value.clone());
        }
        if let Some(value) = field.id.as_ref().and_then(|i| profile.fields.get(i)) {
            return Some(value.clone());
        }

        // Check label-based matching
        if let Some(ref label) = field.label {
            let label_lower = label.to_lowercase();
            
            for (key, value) in &profile.fields {
                if label_lower.contains(&key.to_lowercase()) {
                    return Some(value.clone());
                }
            }
        }

        // Check placeholder-based matching
        if let Some(ref placeholder) = field.placeholder {
            let placeholder_lower = placeholder.to_lowercase();
            
            for (key, value) in &profile.fields {
                if placeholder_lower.contains(&key.to_lowercase()) {
                    return Some(value.clone());
                }
            }
        }

        // Type-based fallback
        match field.field_type {
            FieldType::Email => profile.fields.get("email").cloned(),
            FieldType::Telephone => profile.fields.get("phone").cloned(),
            FieldType::Text => {
                if field.name.as_deref() == Some("first_name") || 
                   field.name.as_deref() == Some("firstname") ||
                   field.name.as_deref() == Some("fname") {
                    profile.fields.get("first_name").cloned()
                } else if field.name.as_deref() == Some("last_name") || 
                          field.name.as_deref() == Some("lastname") ||
                          field.name.as_deref() == Some("lname") {
                    profile.fields.get("last_name").cloned()
                } else {
                    None
                }
            }
            _ => None,
        }
    }

    async fn fill_field(
        &self,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
        selector: &str,
        value: &str,
        field_type: &FieldType,
    ) -> Result<bool> {
        match field_type {
            FieldType::Select => {
                browser_manager
                    .execute_action(
                        Action::ExecuteJs,
                        Params::ExecuteJs(crate::protocol::js_executor::ExecuteJsRequest {
                            session_id: Some(session_id.to_string()),
                            script: format!(
                                r#"
                                (function() {{
                                    const select = document.querySelector('{}');
                                    if (select) {{
                                        select.value = '{}';
                                        select.dispatchEvent(new Event('change', {{ bubbles: true }}));
                                        return true;
                                    }}
                                    return false;
                                }})()
                                "#,
                                selector.replace("'", "\\'"),
                                value.replace("'", "\\'")
                            ),
                        }),
                        session_id,
                        headless,
                        datadir,
                        stealth,
                    )
                    .await?;
            }
            FieldType::Checkbox | FieldType::Radio => {
                if value.to_lowercase() == "true" || value == "1" {
                    browser_manager
                        .execute_action(
                            Action::Check,
                            Params::Check(crate::protocol::params::CheckParams {
                                selector: selector.to_string(),
                            }),
                            session_id,
                            headless,
                            datadir,
                            stealth,
                        )
                        .await?;
                }
            }
            _ => {
                browser_manager
                    .execute_action(
                        Action::Fill,
                        Params::Fill(crate::protocol::params::FillParams {
                            selector: selector.to_string(),
                            value: value.to_string(),
                        }),
                        session_id,
                        headless,
                        datadir,
                        stealth,
                    )
                    .await?;
            }
        }

        Ok(true)
    }

    pub fn create_default_profile() -> AutoFillProfile {
        let mut fields = HashMap::new();
        fields.insert("first_name".to_string(), "John".to_string());
        fields.insert("last_name".to_string(), "Doe".to_string());
        fields.insert("email".to_string(), "john.doe@example.com".to_string());
        fields.insert("phone".to_string(), "555-123-4567".to_string());
        fields.insert("address".to_string(), "123 Main St".to_string());
        fields.insert("city".to_string(), "New York".to_string());
        fields.insert("zip".to_string(), "10001".to_string());
        fields.insert("country".to_string(), "USA".to_string());

        AutoFillProfile {
            name: "Default".to_string(),
            fields,
            patterns: vec![],
        }
    }
}

impl Default for AutoFormFiller {
    fn default() -> Self {
        Self::new()
    }
}
