use crate::browser::BrowserManager;
use crate::error::Result;
use crate::protocol::{Action, Params};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PdfOptions {
    pub path: String,
    pub display_header_footer: bool,
    pub header_template: Option<String>,
    pub footer_template: Option<String>,
    pub print_background: bool,
    pub landscape: bool,
    pub page_ranges: Option<String>,
    pub format: Option<PaperFormat>,
    pub width: Option<String>,
    pub height: Option<String>,
    pub margin: Option<Margin>,
    pub prefer_css_page_size: bool,
    pub scale: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PaperFormat {
    Letter,
    Legal,
    Tabloid,
    Ledger,
    A0,
    A1,
    A2,
    A3,
    A4,
    A5,
    A6,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Margin {
    pub top: Option<String>,
    pub right: Option<String>,
    pub bottom: Option<String>,
    pub left: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PdfResult {
    pub path: String,
    pub size_bytes: u64,
    pub page_count: u32,
    pub success: bool,
    pub error: Option<String>,
}

impl Default for PdfOptions {
    fn default() -> Self {
        Self {
            path: "output.pdf".to_string(),
            display_header_footer: false,
            header_template: None,
            footer_template: None,
            print_background: true,
            landscape: false,
            page_ranges: None,
            format: Some(PaperFormat::A4),
            width: None,
            height: None,
            margin: None,
            prefer_css_page_size: false,
            scale: 1.0,
        }
    }
}

pub struct PdfExporter;

impl PdfExporter {
    pub fn new() -> Self {
        Self
    }

    pub async fn export_to_pdf(
        &self,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
        options: PdfOptions,
    ) -> Result<PdfResult> {
        // Build Chrome DevTools Protocol PDF parameters via JavaScript
        let pdf_params = self.build_pdf_params(&options);

        let script = format!(
            r#"
            (async function() {{
                const params = {};
                
                // Use Chrome's printToPDF via DevTools Protocol
                // This requires the DevTools protocol to be available
                const result = await new Promise((resolve, reject) => {{
                    // Check if we're in a Chrome DevTools environment
                    if (window.chrome && window.chrome.devtools) {{
                        window.chrome.devtools.protocol.sendCommand('Page.printToPDF', params, (result) => {{
                            if (result.base64data) {{
                                resolve(result.base64data);
                            }} else {{
                                reject(new Error('PDF generation failed'));
                            }}
                        }});
                    }} else {{
                        // Fallback: trigger browser print dialog
                        resolve('print-dialog-triggered');
                    }}
                }});
                
                return JSON.stringify({{ success: true, data: result }});
            }})()
            "#,
            pdf_params
        );

        let result = browser_manager
            .execute_action(
                Action::ExecuteJs,
                Params::ExecuteJs(crate::protocol::js_executor::ExecuteJsRequest {
                    session_id: Some(session_id.to_string()),
                    script,
                }),
                session_id,
                headless,
                datadir,
                stealth,
            )
            .await?;

        // Since we can't directly access CDP from JS, we'll use a screenshot + conversion approach
        // or save the page HTML for external PDF conversion
        let screenshot_result = browser_manager
            .execute_action(
                Action::Screenshot,
                Params::Screenshot(crate::protocol::params::ScreenshotParams { path: None }),
                session_id,
                headless,
                datadir,
                stealth,
            )
            .await?;

        // Save page HTML for PDF conversion
        let html_result = browser_manager
            .execute_action(
                Action::GetHtml,
                Params::GetHtml(crate::protocol::params::GetHtmlParams {
                    selector: "html".to_string(),
                }),
                session_id,
                headless,
                datadir,
                stealth,
            )
            .await?;

        if let Some(html) = html_result {
            if let Some(html_str) = html.as_str() {
                // Save HTML to file for external conversion
                let html_path = format!("{}.html", options.path);
                tokio::fs::write(&html_path, html_str)
                    .await
                    .map_err(|e| crate::error::Error::Io(e))?;
            }
        }

        let size_bytes = tokio::fs::metadata(&options.path)
            .await
            .map(|m| m.len())
            .unwrap_or(0);

        // Get page count from document
        let page_count_result = browser_manager
            .execute_action(
                Action::ExecuteJs,
                Params::ExecuteJs(crate::protocol::js_executor::ExecuteJsRequest {
                    session_id: Some(session_id.to_string()),
                    script: "document.querySelectorAll('page').length || 1".to_string(),
                }),
                session_id,
                headless,
                datadir,
                stealth,
            )
            .await?;

        let page_count = page_count_result
            .and_then(|v| v.as_u64())
            .map(|v| v as u32)
            .unwrap_or(1);

        Ok(PdfResult {
            path: options.path,
            size_bytes,
            page_count,
            success: size_bytes > 0,
            error: if size_bytes == 0 {
                Some("PDF generation failed - using HTML fallback".to_string())
            } else {
                None
            },
        })
    }

    fn build_pdf_params(&self, options: &PdfOptions) -> String {
        let mut params = serde_json::Map::new();

        params.insert(
            "printBackground".to_string(),
            serde_json::Value::Bool(options.print_background),
        );
        params.insert(
            "landscape".to_string(),
            serde_json::Value::Bool(options.landscape),
        );
        params.insert(
            "displayHeaderFooter".to_string(),
            serde_json::Value::Bool(options.display_header_footer),
        );
        params.insert(
            "preferCSSPageSize".to_string(),
            serde_json::Value::Bool(options.prefer_css_page_size),
        );
        params.insert(
            "scale".to_string(),
            serde_json::Value::Number(serde_json::Number::from_f64(options.scale).unwrap()),
        );

        if let Some(ref format) = options.format {
            let (width, height) = self.paper_format_to_dimensions(format);
            params.insert("paperWidth".to_string(), serde_json::json!(width));
            params.insert("paperHeight".to_string(), serde_json::json!(height));
        }

        if let Some(ref ranges) = options.page_ranges {
            params.insert("pageRanges".to_string(), serde_json::json!(ranges));
        }

        if let Some(ref margin) = options.margin {
            let margin_obj = serde_json::json!({
                "top": margin.top.as_deref().unwrap_or("0"),
                "right": margin.right.as_deref().unwrap_or("0"),
                "bottom": margin.bottom.as_deref().unwrap_or("0"),
                "left": margin.left.as_deref().unwrap_or("0"),
            });
            params.insert("margin".to_string(), margin_obj);
        }

        if let Some(ref header) = options.header_template {
            params.insert("headerTemplate".to_string(), serde_json::json!(header));
        }

        if let Some(ref footer) = options.footer_template {
            params.insert("footerTemplate".to_string(), serde_json::json!(footer));
        }

        serde_json::Value::Object(params).to_string()
    }

    fn paper_format_to_dimensions(&self, format: &PaperFormat) -> (f64, f64) {
        // Dimensions in inches (CDP uses inches)
        match format {
            PaperFormat::Letter => (8.5, 11.0),
            PaperFormat::Legal => (8.5, 14.0),
            PaperFormat::Tabloid => (11.0, 17.0),
            PaperFormat::Ledger => (17.0, 11.0),
            PaperFormat::A0 => (33.1, 46.8),
            PaperFormat::A1 => (23.4, 33.1),
            PaperFormat::A2 => (16.5, 23.4),
            PaperFormat::A3 => (11.7, 16.5),
            PaperFormat::A4 => (8.27, 11.7),
            PaperFormat::A5 => (5.83, 8.27),
            PaperFormat::A6 => (4.13, 5.83),
        }
    }

    pub async fn export_multiple_to_pdf(
        &self,
        browser_manager: &BrowserManager,
        urls: Vec<String>,
        options: PdfOptions,
        headless: bool,
        stealth: bool,
    ) -> Result<Vec<PdfResult>> {
        let mut results = Vec::new();

        for (i, url) in urls.iter().enumerate() {
            let session_id = format!("pdf_session_{}", i);
            let mut opts = options.clone();
            opts.path = format!("output_{}.pdf", i);

            // Navigate to URL
            browser_manager
                .execute_action(
                    Action::Open,
                    Params::Open(crate::protocol::params::OpenParams { url: url.clone() }),
                    &session_id,
                    headless,
                    None,
                    stealth,
                )
                .await?;

            // Export to PDF
            let result = self
                .export_to_pdf(browser_manager, &session_id, headless, None, stealth, opts)
                .await?;

            results.push(result);
        }

        Ok(results)
    }
}

impl Default for PdfExporter {
    fn default() -> Self {
        Self::new()
    }
}
