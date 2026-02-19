use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowTemplate {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: TemplateCategory,
    pub steps: Vec<WorkflowStep>,
    pub parameters: Vec<TemplateParameter>,
    pub variables: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TemplateCategory {
    Authentication,
    Ecommerce,
    Search,
    FormSubmission,
    DataExtraction,
    Testing,
    Monitoring,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowStep {
    pub id: String,
    pub action: StepAction,
    pub description: String,
    pub selector: Option<String>,
    pub value: Option<String>,
    pub wait_after_ms: u64,
    pub on_error: ErrorHandling,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum StepAction {
    Navigate,
    Click,
    Type,
    Fill,
    Select,
    Submit,
    Wait,
    Scroll,
    Extract,
    Assert,
    Screenshot,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ErrorHandling {
    Stop,
    Continue,
    Retry { attempts: u32, delay_ms: u64 },
    Fallback { step_id: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplateParameter {
    pub name: String,
    pub description: String,
    pub parameter_type: ParameterType,
    pub required: bool,
    pub default_value: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ParameterType {
    String,
    Number,
    Boolean,
    Url,
    Email,
    Password,
    Selector,
}

#[derive(Debug, Clone)]
pub struct WorkflowTemplates {
    templates: HashMap<String, WorkflowTemplate>,
}

impl WorkflowTemplates {
    pub fn new() -> Self {
        let mut templates = Self {
            templates: HashMap::new(),
        };
        templates.load_builtin_templates();
        templates
    }

    fn load_builtin_templates(&mut self) {
        let login_template = WorkflowTemplate {
            id: "login_form".to_string(),
            name: "Login Form".to_string(),
            description: "Standard login form submission workflow".to_string(),
            category: TemplateCategory::Authentication,
            steps: vec![
                WorkflowStep {
                    id: "navigate".to_string(),
                    action: StepAction::Navigate,
                    description: "Navigate to login page".to_string(),
                    selector: None,
                    value: Some("{{login_url}}".to_string()),
                    wait_after_ms: 2000,
                    on_error: ErrorHandling::Stop,
                },
                WorkflowStep {
                    id: "fill_username".to_string(),
                    action: StepAction::Fill,
                    description: "Enter username".to_string(),
                    selector: Some("{{username_selector}}".to_string()),
                    value: Some("{{username}}".to_string()),
                    wait_after_ms: 500,
                    on_error: ErrorHandling::Retry { attempts: 3, delay_ms: 1000 },
                },
                WorkflowStep {
                    id: "fill_password".to_string(),
                    action: StepAction::Fill,
                    description: "Enter password".to_string(),
                    selector: Some("{{password_selector}}".to_string()),
                    value: Some("{{password}}".to_string()),
                    wait_after_ms: 500,
                    on_error: ErrorHandling::Retry { attempts: 3, delay_ms: 1000 },
                },
                WorkflowStep {
                    id: "submit".to_string(),
                    action: StepAction::Submit,
                    description: "Click login button".to_string(),
                    selector: Some("{{submit_selector}}".to_string()),
                    value: None,
                    wait_after_ms: 3000,
                    on_error: ErrorHandling::Retry { attempts: 2, delay_ms: 2000 },
                },
            ],
            parameters: vec![
                TemplateParameter {
                    name: "login_url".to_string(),
                    description: "URL of the login page".to_string(),
                    parameter_type: ParameterType::Url,
                    required: true,
                    default_value: None,
                },
                TemplateParameter {
                    name: "username".to_string(),
                    description: "Username or email".to_string(),
                    parameter_type: ParameterType::String,
                    required: true,
                    default_value: None,
                },
                TemplateParameter {
                    name: "password".to_string(),
                    description: "Password".to_string(),
                    parameter_type: ParameterType::Password,
                    required: true,
                    default_value: None,
                },
                TemplateParameter {
                    name: "username_selector".to_string(),
                    description: "CSS selector for username field".to_string(),
                    parameter_type: ParameterType::Selector,
                    required: false,
                    default_value: Some("input[type='email'], input[name='username']".to_string()),
                },
                TemplateParameter {
                    name: "password_selector".to_string(),
                    description: "CSS selector for password field".to_string(),
                    parameter_type: ParameterType::Selector,
                    required: false,
                    default_value: Some("input[type='password']".to_string()),
                },
                TemplateParameter {
                    name: "submit_selector".to_string(),
                    description: "CSS selector for submit button".to_string(),
                    parameter_type: ParameterType::Selector,
                    required: false,
                    default_value: Some("button[type='submit'], input[type='submit']".to_string()),
                },
            ],
            variables: HashMap::new(),
        };

        let checkout_template = WorkflowTemplate {
            id: "checkout_flow".to_string(),
            name: "E-commerce Checkout".to_string(),
            description: "Complete e-commerce checkout process".to_string(),
            category: TemplateCategory::Ecommerce,
            steps: vec![
                WorkflowStep {
                    id: "add_to_cart".to_string(),
                    action: StepAction::Click,
                    description: "Add item to cart".to_string(),
                    selector: Some("{{add_to_cart_selector}}".to_string()),
                    value: None,
                    wait_after_ms: 2000,
                    on_error: ErrorHandling::Stop,
                },
                WorkflowStep {
                    id: "go_to_cart".to_string(),
                    action: StepAction::Click,
                    description: "Navigate to cart".to_string(),
                    selector: Some("{{cart_selector}}".to_string()),
                    value: None,
                    wait_after_ms: 2000,
                    on_error: ErrorHandling::Retry { attempts: 2, delay_ms: 1000 },
                },
                WorkflowStep {
                    id: "proceed_checkout".to_string(),
                    action: StepAction::Click,
                    description: "Proceed to checkout".to_string(),
                    selector: Some("{{checkout_selector}}".to_string()),
                    value: None,
                    wait_after_ms: 3000,
                    on_error: ErrorHandling::Retry { attempts: 2, delay_ms: 1000 },
                },
            ],
            parameters: vec![
                TemplateParameter {
                    name: "add_to_cart_selector".to_string(),
                    description: "Selector for add to cart button".to_string(),
                    parameter_type: ParameterType::Selector,
                    required: true,
                    default_value: None,
                },
                TemplateParameter {
                    name: "cart_selector".to_string(),
                    description: "Selector for cart link/button".to_string(),
                    parameter_type: ParameterType::Selector,
                    required: false,
                    default_value: Some(".cart, [data-testid='cart']".to_string()),
                },
                TemplateParameter {
                    name: "checkout_selector".to_string(),
                    description: "Selector for checkout button".to_string(),
                    parameter_type: ParameterType::Selector,
                    required: false,
                    default_value: Some(".checkout, [data-testid='checkout']".to_string()),
                },
            ],
            variables: HashMap::new(),
        };

        let search_template = WorkflowTemplate {
            id: "search_product".to_string(),
            name: "Product Search".to_string(),
            description: "Search for products on an e-commerce site".to_string(),
            category: TemplateCategory::Search,
            steps: vec![
                WorkflowStep {
                    id: "navigate".to_string(),
                    action: StepAction::Navigate,
                    description: "Navigate to site".to_string(),
                    selector: None,
                    value: Some("{{site_url}}".to_string()),
                    wait_after_ms: 2000,
                    on_error: ErrorHandling::Stop,
                },
                WorkflowStep {
                    id: "search".to_string(),
                    action: StepAction::Fill,
                    description: "Enter search query".to_string(),
                    selector: Some("{{search_input_selector}}".to_string()),
                    value: Some("{{query}}".to_string()),
                    wait_after_ms: 500,
                    on_error: ErrorHandling::Retry { attempts: 3, delay_ms: 1000 },
                },
                WorkflowStep {
                    id: "submit_search".to_string(),
                    action: StepAction::Submit,
                    description: "Submit search".to_string(),
                    selector: Some("{{search_button_selector}}".to_string()),
                    value: None,
                    wait_after_ms: 3000,
                    on_error: ErrorHandling::Retry { attempts: 2, delay_ms: 2000 },
                },
            ],
            parameters: vec![
                TemplateParameter {
                    name: "site_url".to_string(),
                    description: "Base URL of the site".to_string(),
                    parameter_type: ParameterType::Url,
                    required: true,
                    default_value: None,
                },
                TemplateParameter {
                    name: "query".to_string(),
                    description: "Search query".to_string(),
                    parameter_type: ParameterType::String,
                    required: true,
                    default_value: None,
                },
                TemplateParameter {
                    name: "search_input_selector".to_string(),
                    description: "CSS selector for search input".to_string(),
                    parameter_type: ParameterType::Selector,
                    required: false,
                    default_value: Some("input[type='search'], input[name='q']".to_string()),
                },
                TemplateParameter {
                    name: "search_button_selector".to_string(),
                    description: "CSS selector for search button".to_string(),
                    parameter_type: ParameterType::Selector,
                    required: false,
                    default_value: Some("button[type='submit'], .search-button".to_string()),
                },
            ],
            variables: HashMap::new(),
        };

        self.templates.insert(login_template.id.clone(), login_template);
        self.templates.insert(checkout_template.id.clone(), checkout_template);
        self.templates.insert(search_template.id.clone(), search_template);
    }

    pub fn get_template(&self, id: &str) -> Option<WorkflowTemplate> {
        self.templates.get(id).cloned()
    }

    pub fn list_templates(&self) -> Vec<WorkflowTemplate> {
        self.templates.values().cloned().collect()
    }

    pub fn list_by_category(&self, category: &TemplateCategory) -> Vec<WorkflowTemplate> {
        self.templates.values()
            .filter(|t| std::mem::discriminant(&t.category) == std::mem::discriminant(category))
            .cloned()
            .collect()
    }

    pub fn add_template(&mut self, template: WorkflowTemplate) {
        self.templates.insert(template.id.clone(), template);
    }

    pub fn remove_template(&mut self, id: &str) -> Option<WorkflowTemplate> {
        self.templates.remove(id)
    }

    pub fn instantiate_template(
        &self,
        template_id: &str,
        parameters: HashMap<String, String>,
    ) -> anyhow::Result<Vec<WorkflowStep>> {
        let template = self.templates.get(template_id)
            .ok_or_else(|| anyhow::anyhow!("Template not found: {}", template_id))?;

        let mut steps = template.steps.clone();

        for step in &mut steps {
            if let Some(ref selector) = step.selector {
                step.selector = Some(self.replace_variables(selector, &parameters));
            }
            if let Some(ref value) = step.value {
                step.value = Some(self.replace_variables(value, &parameters));
            }
        }

        Ok(steps)
    }

    fn replace_variables(&self, template: &str, variables: &HashMap<String, String>) -> String {
        let mut result = template.to_string();
        for (key, value) in variables {
            let placeholder = format!("{{{{{}}}}}", key);
            result = result.replace(&placeholder, value);
        }
        result
    }
}
