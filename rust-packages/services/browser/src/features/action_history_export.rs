use crate::browser::BrowserManager;
use crate::error::Result;
use crate::protocol::history::ActionRecord;
use crate::protocol::{Action, Params};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportedScript {
    pub name: String,
    pub description: String,
    pub format: ExportFormat,
    pub content: String,
    pub action_count: usize,
    pub urls_visited: Vec<String>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum ExportFormat {
    Rust,
    PythonPlaywright,
    JavaScriptPuppeteer,
    TypeScriptPlaywright,
    JavaSelenium,
    CSharpPlaywright,
    Yaml,
    Json,
    Markdown,
}

pub struct ActionHistoryExporter;

impl ActionHistoryExporter {
    pub fn new() -> Self {
        Self
    }

    pub fn export(
        &self,
        records: &[ActionRecord],
        format: ExportFormat,
        name: impl Into<String>,
    ) -> Result<ExportedScript> {
        let name = name.into();
        let description = format!("Exported {} actions from browser session", records.len());
        
        let content = match format {
            ExportFormat::Rust => self.export_rust(records, &name),
            ExportFormat::PythonPlaywright => self.export_python_playwright(records, &name),
            ExportFormat::JavaScriptPuppeteer => self.export_js_puppeteer(records, &name),
            ExportFormat::TypeScriptPlaywright => self.export_ts_playwright(records, &name),
            ExportFormat::JavaSelenium => self.export_java_selenium(records, &name),
            ExportFormat::CSharpPlaywright => self.export_csharp_playwright(records, &name),
            ExportFormat::Yaml => self.export_yaml(records, &name),
            ExportFormat::Json => self.export_json(records),
            ExportFormat::Markdown => self.export_markdown(records, &name),
        };

        let urls_visited = self.extract_urls(records);

        Ok(ExportedScript {
            name,
            description,
            format,
            content,
            action_count: records.len(),
            urls_visited,
        })
    }

    fn export_rust(&self, records: &[ActionRecord], name: &str) -> String {
        let mut code = format!("// Auto-generated browser automation script: {}\n\n", name);
        code.push_str("use browser_use::prelude::*;\n");
        code.push_str("use tokio;\n\n");
        code.push_str("#[tokio::main]\n");
        code.push_str("async fn main() -> Result<()> {\n");
        code.push_str("    let browser = BrowserManager::new();\n\n");

        for record in records {
            let line = self.action_to_rust(&record.action, &record.params);
            code.push_str(&format!("    {}\n", line));
        }

        code.push_str("\n    Ok(())\n");
        code.push_str("}\n");
        code
    }

    fn export_python_playwright(&self, records: &[ActionRecord], name: &str) -> String {
        let mut code = format!("# Auto-generated browser automation script: {}\n\n", name);
        code.push_str("from playwright.sync_api import sync_playwright\n\n");
        code.push_str("def run():\n");
        code.push_str("    with sync_playwright() as p:\n");
        code.push_str("        browser = p.chromium.launch(headless=False)\n");
        code.push_str("        context = browser.new_context()\n");
        code.push_str("        page = context.new_page()\n\n");

        for record in records {
            let line = self.action_to_python(&record.action, &record.params);
            code.push_str(&format!("        {}\n", line));
        }

        code.push_str("\n        context.close()\n");
        code.push_str("        browser.close()\n\n");
        code.push_str("if __name__ == \"__main__\":\n");
        code.push_str("    run()\n");
        code
    }

    fn export_js_puppeteer(&self, records: &[ActionRecord], name: &str) -> String {
        let mut code = format!("// Auto-generated browser automation script: {}\n\n", name);
        code.push_str("const puppeteer = require('puppeteer');\n\n");
        code.push_str("(async () => {\n");
        code.push_str("    const browser = await puppeteer.launch({ headless: false });\n");
        code.push_str("    const page = await browser.newPage();\n\n");

        for record in records {
            let line = self.action_to_javascript(&record.action, &record.params);
            code.push_str(&format!("    {}\n", line));
        }

        code.push_str("\n    await browser.close();\n");
        code.push_str("})();\n");
        code
    }

    fn export_ts_playwright(&self, records: &[ActionRecord], name: &str) -> String {
        let mut code = format!("// Auto-generated browser automation script: {}\n\n", name);
        code.push_str("import { chromium, Browser, Page } from 'playwright';\n\n");
        code.push_str("async function run(): Promise<void> {\n");
        code.push_str("    const browser = await chromium.launch({ headless: false });\n");
        code.push_str("    const context = await browser.newContext();\n");
        code.push_str("    const page = await context.newPage();\n\n");

        for record in records {
            let line = self.action_to_typescript(&record.action, &record.params);
            code.push_str(&format!("    {}\n", line));
        }

        code.push_str("\n    await context.close();\n");
        code.push_str("    await browser.close();\n");
        code.push_str("}\n\n");
        code.push_str("run().catch(console.error);\n");
        code
    }

    fn export_java_selenium(&self, records: &[ActionRecord], name: &str) -> String {
        let mut code = format!("// Auto-generated browser automation script: {}\n\n", name);
        code.push_str("import org.openqa.selenium.*;\n");
        code.push_str("import org.openqa.selenium.chrome.ChromeDriver;\n");
        code.push_str("import org.openqa.selenium.support.ui.*;\n\n");
        code.push_str("public class BrowserAutomation {\n");
        code.push_str("    public static void main(String[] args) {\n");
        code.push_str("        WebDriver driver = new ChromeDriver();\n");
        code.push_str("        WebDriverWait wait = new WebDriverWait(driver, 10);\n\n");
        code.push_str("        try {\n");

        for record in records {
            let line = self.action_to_java(&record.action, &record.params);
            code.push_str(&format!("            {}\n", line));
        }

        code.push_str("        } finally {\n");
        code.push_str("            driver.quit();\n");
        code.push_str("        }\n");
        code.push_str("    }\n");
        code.push_str("}\n");
        code
    }

    fn export_csharp_playwright(&self, records: &[ActionRecord], name: &str) -> String {
        let mut code = format!("// Auto-generated browser automation script: {}\n\n", name);
        code.push_str("using Microsoft.Playwright;\n");
        code.push_str("using System.Threading.Tasks;\n\n");
        code.push_str("class Program\n");
        code.push_str("{\n");
        code.push_str("    public static async Task Main()\n");
        code.push_str("    {\n");
        code.push_str("        using var playwright = await Playwright.CreateAsync();\n");
        code.push_str("        await using var browser = await playwright.Chromium.LaunchAsync(new() { Headless = false });\n");
        code.push_str("        var context = await browser.NewContextAsync();\n");
        code.push_str("        var page = await context.NewPageAsync();\n\n");

        for record in records {
            let line = self.action_to_csharp(&record.action, &record.params);
            code.push_str(&format!("        {}\n", line));
        }

        code.push_str("    }\n");
        code.push_str("}\n");
        code
    }

    fn export_yaml(&self, records: &[ActionRecord], name: &str) -> String {
        let mut yaml = format!("# Browser Automation Script: {}\n", name);
        yaml.push_str("version: '1.0'\n");
        yaml.push_str(&format!("name: {}\n", name));
        yaml.push_str("steps:\n");

        for (i, record) in records.iter().enumerate() {
            yaml.push_str(&format!("  - step: {}\n", i + 1));
            yaml.push_str(&format!("    action: {:?}\n", record.action));
            yaml.push_str(&format!("    timestamp: {}\n", record.timestamp));
            // Add params serialization
            yaml.push_str("    params: {}\n");
        }

        yaml
    }

    fn export_json(&self, records: &[ActionRecord]) -> String {
        serde_json::to_string_pretty(records).unwrap_or_default()
    }

    fn export_markdown(&self, records: &[ActionRecord], name: &str) -> String {
        let mut md = format!("# Browser Session: {}\n\n", name);
        md.push_str("## Actions Performed\n\n");
        md.push_str("| Step | Action | Timestamp |\n");
        md.push_str("|------|--------|-----------|\n");

        for (i, record) in records.iter().enumerate() {
            md.push_str(&format!(
                "| {} | {:?} | {} |\n",
                i + 1,
                record.action,
                record.timestamp
            ));
        }

        md
    }

    // Helper methods for action conversion
    fn action_to_rust(&self, action: &Action, _params: &Params) -> String {
        match action {
            Action::Open => "browser.open(\"about:blank\").await?;".to_string(),
            Action::Click => "browser.click(\"selector\").await?;".to_string(),
            Action::Type => "browser.type(\"selector\", \"text\").await?;".to_string(),
            Action::Fill => "browser.fill(\"selector\", \"value\").await?;".to_string(),
            _ => format!("// {:?}", action),
        }
    }

    fn action_to_python(&self, action: &Action, _params: &Params) -> String {
        match action {
            Action::Open => "page.goto(\"about:blank\")".to_string(),
            Action::Click => "page.click(\"selector\")".to_string(),
            Action::Type => "page.fill(\"selector\", \"text\")".to_string(),
            Action::Fill => "page.fill(\"selector\", \"value\")".to_string(),
            _ => format!("# {:?}", action),
        }
    }

    fn action_to_javascript(&self, action: &Action, _params: &Params) -> String {
        match action {
            Action::Open => "await page.goto('about:blank');".to_string(),
            Action::Click => "await page.click('selector');".to_string(),
            Action::Type => "await page.type('selector', 'text');".to_string(),
            Action::Fill => "await page.evaluate(() => document.querySelector('selector').value = 'value');".to_string(),
            _ => format!("// {:?}", action),
        }
    }

    fn action_to_typescript(&self, action: &Action, _params: &Params) -> String {
        match action {
            Action::Open => "await page.goto('about:blank');".to_string(),
            Action::Click => "await page.click('selector');".to_string(),
            Action::Type => "await page.fill('selector', 'text');".to_string(),
            _ => format!("// {:?}", action),
        }
    }

    fn action_to_java(&self, action: &Action, _params: &Params) -> String {
        match action {
            Action::Open => "driver.get(\"about:blank\");".to_string(),
            Action::Click => "driver.findElement(By.cssSelector(\"selector\")).click();".to_string(),
            Action::Type => "driver.findElement(By.cssSelector(\"selector\")).sendKeys(\"text\");".to_string(),
            _ => format!("// {:?}", action),
        }
    }

    fn action_to_csharp(&self, action: &Action, _params: &Params) -> String {
        match action {
            Action::Open => "await page.GotoAsync(\"about:blank\");".to_string(),
            Action::Click => "await page.ClickAsync(\"selector\");".to_string(),
            Action::Type => "await page.FillAsync(\"selector\", \"text\");".to_string(),
            _ => format!("// {:?}", action),
        }
    }

    fn extract_urls(&self, records: &[ActionRecord]) -> Vec<String> {
        records
            .iter()
            .filter(|r| matches!(r.action, Action::Open))
            .map(|r| format!("{:?}", r.action))
            .collect()
    }
}

impl Default for ActionHistoryExporter {
    fn default() -> Self {
        Self::new()
    }
}
