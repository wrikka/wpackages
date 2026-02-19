use crate::browser::BrowserManager;
use crate::error::Result;
use crate::protocol::{Action, Params};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CaptchaType {
    RecaptchaV2,
    RecaptchaV3,
    Hcaptcha,
    ImageCaptcha,
    AudioCaptcha,
    Geetest,
    FunCaptcha,
    CloudflareTurnstile,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CaptchaSolverService {
    TwoCaptcha { api_key: String },
    AntiCaptcha { api_key: String },
    CapSolver { api_key: String },
    DeathByCaptcha { username: String, password: String },
    Manual,
    AiSolver { api_endpoint: String, api_key: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CaptchaInfo {
    pub captcha_type: CaptchaType,
    pub detected: bool,
    pub site_key: Option<String>,
    pub action: Option<String>,
    pub data_s: Option<String>,
    pub page_url: String,
    pub iframe_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SolveResult {
    pub success: bool,
    pub solution: Option<String>,
    pub error: Option<String>,
    pub solve_time_ms: u64,
}

pub struct CaptchaSolver {
    service: Option<CaptchaSolverService>,
}

impl CaptchaSolver {
    pub fn new() -> Self {
        Self { service: None }
    }

    pub fn with_service(mut self, service: CaptchaSolverService) -> Self {
        self.service = Some(service);
        self
    }

    pub async fn detect_captcha(
        &self,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
    ) -> Result<CaptchaInfo> {
        let detection_js = r#"
            (function() {
                const results = {
                    recaptcha_v2: { detected: false, siteKey: null },
                    recaptcha_v3: { detected: false, siteKey: null, action: null },
                    hcaptcha: { detected: false, siteKey: null },
                    geetest: { detected: false },
                    cloudflare: { detected: false },
                    image_captcha: { detected: false }
                };
                
                // Detect reCAPTCHA v2
                const recaptchaV2Elements = document.querySelectorAll('.g-recaptcha, [data-sitekey]');
                if (recaptchaV2Elements.length > 0) {
                    results.recaptcha_v2.detected = true;
                    results.recaptcha_v2.siteKey = recaptchaV2Elements[0].getAttribute('data-sitekey');
                }
                
                // Detect reCAPTCHA v3 (invisible)
                if (typeof grecaptcha !== 'undefined' && grecaptcha.ready) {
                    results.recaptcha_v3.detected = true;
                    // Try to find site key in scripts
                    const scripts = document.querySelectorAll('script[src*="recaptcha"]');
                    for (const script of scripts) {
                        const match = script.src.match(/render=([^&]+)/);
                        if (match) {
                            results.recaptcha_v3.siteKey = match[1];
                        }
                    }
                }
                
                // Detect hCaptcha
                const hcaptchaElements = document.querySelectorAll('.h-captcha, [data-hcaptcha-sitekey]');
                if (hcaptchaElements.length > 0) {
                    results.hcaptcha.detected = true;
                    results.hcaptcha.siteKey = hcaptchaElements[0].getAttribute('data-sitekey') || 
                                               hcaptchaElements[0].getAttribute('data-hcaptcha-sitekey');
                }
                
                // Detect GeeTest
                if (document.querySelector('.geetest_radar_btn, .geetest_btn') || 
                    typeof initGeetest !== 'undefined') {
                    results.geetest.detected = true;
                }
                
                // Detect Cloudflare Turnstile
                const cloudflareElements = document.querySelectorAll('.cf-turnstile, [data-sitekey*="0x"]');
                if (cloudflareElements.length > 0 || 
                    document.querySelector('input[name="cf-turnstile-response"]')) {
                    results.cloudflare.detected = true;
                }
                
                // Detect image captcha
                const captchaImages = document.querySelectorAll('img[src*="captcha"], img[alt*="captcha" i], img[id*="captcha" i]');
                const captchaInputs = document.querySelectorAll('input[name*="captcha" i], input[id*="captcha" i]');
                if (captchaImages.length > 0 && captchaInputs.length > 0) {
                    results.image_captcha.detected = true;
                }
                
                return JSON.stringify({
                    results: results,
                    pageUrl: window.location.href
                });
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

        let mut captcha_info = CaptchaInfo {
            captcha_type: CaptchaType::ImageCaptcha,
            detected: false,
            site_key: None,
            action: None,
            data_s: None,
            page_url: String::new(),
            iframe_url: None,
        };

        if let Some(data) = result {
            if let Some(json_str) = data.as_str() {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(json_str) {
                    captcha_info.page_url = parsed
                        .get("pageUrl")
                        .and_then(|v| v.as_str())
                        .map(|s| s.to_string())
                        .unwrap_or_default();

                    if let Some(results) = parsed.get("results") {
                        if results
                            .get("recaptcha_v2")
                            .and_then(|v| v.get("detected"))
                            .and_then(|v| v.as_bool())
                            .unwrap_or(false)
                        {
                            captcha_info.detected = true;
                            captcha_info.captcha_type = CaptchaType::RecaptchaV2;
                            captcha_info.site_key = results
                                .get("recaptcha_v2")
                                .and_then(|v| v.get("siteKey"))
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string());
                        } else if results
                            .get("hcaptcha")
                            .and_then(|v| v.get("detected"))
                            .and_then(|v| v.as_bool())
                            .unwrap_or(false)
                        {
                            captcha_info.detected = true;
                            captcha_info.captcha_type = CaptchaType::Hcaptcha;
                            captcha_info.site_key = results
                                .get("hcaptcha")
                                .and_then(|v| v.get("siteKey"))
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string());
                        }
                    }
                }
            }
        }

        Ok(captcha_info)
    }

    pub async fn solve_captcha(
        &self,
        captcha_info: &CaptchaInfo,
    ) -> Result<SolveResult> {
        let start = std::time::Instant::now();

        if let Some(ref service) = self.service {
            match service {
                CaptchaSolverService::TwoCaptcha { api_key: _ } => {
                    // Placeholder: Would call 2captcha API
                    Ok(SolveResult {
                        success: false,
                        solution: None,
                        error: Some("2captcha integration requires HTTP client".to_string()),
                        solve_time_ms: start.elapsed().as_millis() as u64,
                    })
                }
                CaptchaSolverService::AntiCaptcha { api_key: _ } => {
                    Ok(SolveResult {
                        success: false,
                        solution: None,
                        error: Some("Anti-captcha integration requires HTTP client".to_string()),
                        solve_time_ms: start.elapsed().as_millis() as u64,
                    })
                }
                CaptchaSolverService::CapSolver { api_key: _ } => {
                    Ok(SolveResult {
                        success: false,
                        solution: None,
                        error: Some("CapSolver integration requires HTTP client".to_string()),
                        solve_time_ms: start.elapsed().as_millis() as u64,
                    })
                }
                CaptchaSolverService::DeathByCaptcha { username: _, password: _ } => {
                    Ok(SolveResult {
                        success: false,
                        solution: None,
                        error: Some("DeathByCaptcha integration requires HTTP client".to_string()),
                        solve_time_ms: start.elapsed().as_millis() as u64,
                    })
                }
                CaptchaSolverService::Manual => {
                    Ok(SolveResult {
                        success: false,
                        solution: None,
                        error: Some("Manual solving - requires user interaction".to_string()),
                        solve_time_ms: start.elapsed().as_millis() as u64,
                    })
                }
                CaptchaSolverService::AiSolver {
                    api_endpoint: _,
                    api_key: _,
                } => {
                    Ok(SolveResult {
                        success: false,
                        solution: None,
                        error: Some("AI solver integration requires HTTP client".to_string()),
                        solve_time_ms: start.elapsed().as_millis() as u64,
                    })
                }
            }
        } else {
            Ok(SolveResult {
                success: false,
                solution: None,
                error: Some("No captcha solver service configured".to_string()),
                solve_time_ms: start.elapsed().as_millis() as u64,
            })
        }
    }

    pub async fn apply_solution(
        &self,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
        captcha_info: &CaptchaInfo,
        solution: &str,
    ) -> Result<bool> {
        let apply_js = match captcha_info.captcha_type {
            CaptchaType::RecaptchaV2 => {
                format!(
                    r#"
                    (function() {{
                        const responseElement = document.querySelector('#g-recaptcha-response');
                        if (responseElement) {{
                            responseElement.value = '{}';
                            responseElement.dispatchEvent(new Event('input', {{ bubbles: true }}));
                            responseElement.dispatchEvent(new Event('change', {{ bubbles: true }}));
                            return true;
                        }}
                        return false;
                    }})()
                    "#,
                    solution
                )
            }
            CaptchaType::Hcaptcha => {
                format!(
                    r#"
                    (function() {{
                        const responseElement = document.querySelector('[name="h-captcha-response"]');
                        if (responseElement) {{
                            responseElement.value = '{}';
                            responseElement.dispatchEvent(new Event('input', {{ bubbles: true }}));
                            return true;
                        }}
                        return false;
                    }})()
                    "#,
                    solution
                )
            }
            _ => {
                format!(
                    r#"
                    (function() {{
                        const input = document.querySelector('input[name*="captcha" i], input[id*="captcha" i]');
                        if (input) {{
                            input.value = '{}';
                            input.dispatchEvent(new Event('input', {{ bubbles: true }}));
                            return true;
                        }}
                        return false;
                    }})()
                    "#,
                    solution
                )
            }
        };

        let result = browser_manager
            .execute_action(
                Action::ExecuteJs,
                Params::ExecuteJs(crate::protocol::js_executor::ExecuteJsRequest {
                    session_id: Some(session_id.to_string()),
                    script: apply_js,
                }),
                session_id,
                headless,
                datadir,
                stealth,
            )
            .await?;

        Ok(result.and_then(|v| v.as_bool()).unwrap_or(false))
    }

    pub async fn auto_solve(
        &self,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
    ) -> Result<SolveResult> {
        let captcha_info = self
            .detect_captcha(browser_manager, session_id, headless, datadir, stealth)
            .await?;

        if !captcha_info.detected {
            return Ok(SolveResult {
                success: true,
                solution: None,
                error: None,
                solve_time_ms: 0,
            });
        }

        let solve_result = self.solve_captcha(&captcha_info).await?;

        if solve_result.success {
            if let Some(ref solution) = solve_result.solution {
                self.apply_solution(
                    browser_manager,
                    session_id,
                    headless,
                    datadir,
                    stealth,
                    &captcha_info,
                    solution,
                )
                .await?;
            }
        }

        Ok(solve_result)
    }
}

impl Default for CaptchaSolver {
    fn default() -> Self {
        Self::new()
    }
}
