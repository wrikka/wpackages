use crate::browser::BrowserManager;
use crate::error::Result;
use crate::protocol::{Action, Params};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConsentAction {
    AcceptAll,
    RejectAll,
    AcceptNecessaryOnly,
    Custom { preferences: CookiePreferences },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CookiePreferences {
    pub necessary: bool,
    pub functional: bool,
    pub analytics: bool,
    pub marketing: bool,
}

impl Default for CookiePreferences {
    fn default() -> Self {
        Self {
            necessary: true, // Always required
            functional: false,
            analytics: false,
            marketing: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsentBannerInfo {
    pub detected: bool,
    pub banner_type: Option<String>,
    pub accept_selector: Option<String>,
    pub reject_selector: Option<String>,
    pub customize_selector: Option<String>,
    pub close_selector: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsentResult {
    pub success: bool,
    pub action_taken: String,
    pub banner_detected: bool,
    pub error: Option<String>,
}

pub struct CookieConsentHandler;

impl CookieConsentHandler {
    pub fn new() -> Self {
        Self
    }

    pub async fn detect_banner(
        &self,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
    ) -> Result<ConsentBannerInfo> {
        let detection_js = r#"
            (function() {
                // Common cookie banner selectors and patterns
                const bannerSelectors = [
                    // Common IDs
                    '#cookie-banner', '#cookie-consent', '#cookie-popup', '#cookie-notice',
                    '#gdpr-banner', '#gdpr-consent', '#gdpr-popup',
                    '#cc-banner', '#cc-window', '#cc-policy',
                    '#onetrust-banner-sdk', '#onetrust-consent-sdk',
                    '#CybotCookiebotDialog', '#CybotCookiebotDialogBody',
                    '#cookie-law-info-bar', '#cliSettingsPopup',
                    
                    // Common classes
                    '.cookie-banner', '.cookie-consent', '.cookie-popup', '.cookie-notice',
                    '.gdpr-banner', '.gdpr-consent', '.gdpr-popup',
                    '.cc-banner', '.cc-window', '.cc-revoke',
                    '.onetrust-banner', '.ot-sdk-container',
                    '.CybotCookiebotDialog',
                    '.cookie-law-info-bar',
                    
                    // ARIA roles
                    '[role="dialog"][aria-label*="cookie" i]',
                    '[role="alert"][aria-label*="cookie" i]',
                    
                    // Common CMP (Consent Management Platform) patterns
                    '[id*="cmp" i]', '[class*="cmp" i]',
                    '[id*="consent" i]', '[class*="consent" i]',
                    '[data-testid*="cookie" i]', '[data-testid*="consent" i]',
                    
                    // Specific vendor patterns
                    '[data-testid="GDPRConsent"]', '[data-testid="CookieBanner"]',
                    '.fc-consent-root', '.qc-cmp2-container',
                    '.spconsent-popup', '.truste_box_overlay'
                ];
                
                // Common button text patterns
                const acceptPatterns = [
                    'accept', 'agree', 'allow', 'ok', 'got it', 'understood',
                    'i understand', 'accept all', 'allow all', 'agree all',
                    'aceptar', 'acepto', 'de acuerdo', // Spanish
                    'akzeptieren', 'ich stimme zu', // German
                    'accepter', "j'accepte", // French
                    'accetta', 'accetto' // Italian
                ];
                
                const rejectPatterns = [
                    'reject', 'decline', 'deny', 'refuse', 'dismiss', 'close',
                    'reject all', 'decline all', 'only necessary', 'necessary only',
                    'only essential', 'essential only', 'customize', 'preferences',
                    'rechazar', 'rechazo', // Spanish
                    'ablehnen', 'verweigern', // German
                    'refuser', 'refus', // French
                    'rifiuta', 'rifiuto' // Italian
                ];
                
                let bannerEl = null;
                let bannerType = null;
                
                // Try to find banner
                for (const selector of bannerSelectors) {
                    try {
                        const el = document.querySelector(selector);
                        if (el && el.offsetParent !== null) {
                            // Check if it's actually visible and looks like a cookie banner
                            const rect = el.getBoundingClientRect();
                            if (rect.height > 50 && rect.width > 200) {
                                bannerEl = el;
                                bannerType = selector;
                                break;
                            }
                        }
                    } catch (e) {}
                }
                
                if (!bannerEl) {
                    // Also check for cookie-related text in modal dialogs
                    const dialogs = document.querySelectorAll('[role="dialog"], .modal, .popup');
                    for (const dialog of dialogs) {
                        const text = dialog.innerText || dialog.textContent || '';
                        if (text.toLowerCase().includes('cookie') || 
                            text.toLowerCase().includes('gdpr') ||
                            text.toLowerCase().includes('consent') ||
                            text.toLowerCase().includes('privacy')) {
                            bannerEl = dialog;
                            bannerType = 'dialog-based';
                            break;
                        }
                    }
                }
                
                if (!bannerEl) {
                    return JSON.stringify({ detected: false });
                }
                
                // Find buttons within the banner
                const buttons = bannerEl.querySelectorAll('button, a[role="button"], input[type="button"], .btn');
                let acceptBtn = null;
                let rejectBtn = null;
                let customizeBtn = null;
                let closeBtn = null;
                
                for (const btn of buttons) {
                    const text = (btn.innerText || btn.textContent || btn.value || '').toLowerCase();
                    const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
                    
                    // Check for accept patterns
                    for (const pattern of acceptPatterns) {
                        if (text.includes(pattern) || ariaLabel.includes(pattern)) {
                            // Prefer buttons that don't mention "all" for reject/close
                            if (!text.includes('reject') && !text.includes('decline')) {
                                acceptBtn = btn;
                                break;
                            }
                        }
                    }
                    
                    // Check for reject/close patterns
                    for (const pattern of rejectPatterns) {
                        if (text.includes(pattern) || ariaLabel.includes(pattern)) {
                            if (text.includes('customize') || text.includes('preferences') || 
                                text.includes('settings') || text.includes('manage')) {
                                customizeBtn = btn;
                            } else {
                                rejectBtn = btn;
                            }
                            break;
                        }
                    }
                    
                    // Check for close button (X icon or close text)
                    if (btn.getAttribute('aria-label')?.toLowerCase().includes('close') ||
                        btn.className.toLowerCase().includes('close') ||
                        btn.innerText?.includes('×') ||
                        btn.innerText?.includes('✕') ||
                        btn.innerText?.includes('✖')) {
                        closeBtn = btn;
                    }
                }
                
                // Generate unique selectors for found buttons
                function getUniqueSelector(el) {
                    if (el.id) return `#${el.id}`;
                    if (el.className) return `.${el.className.split(' ').join('.')}`;
                    return el.tagName.toLowerCase();
                }
                
                return JSON.stringify({
                    detected: true,
                    bannerType: bannerType,
                    acceptSelector: acceptBtn ? getUniqueSelector(acceptBtn) : null,
                    rejectSelector: rejectBtn ? getUniqueSelector(rejectBtn) : null,
                    customizeSelector: customizeBtn ? getUniqueSelector(customizeBtn) : null,
                    closeSelector: closeBtn ? getUniqueSelector(closeBtn) : null
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

        if let Some(data) = result {
            if let Some(json_str) = data.as_str() {
                if let Ok(info) = serde_json::from_str::<serde_json::Value>(json_str) {
                    return Ok(ConsentBannerInfo {
                        detected: info.get("detected").and_then(|v| v.as_bool()).unwrap_or(false),
                        banner_type: info.get("bannerType").and_then(|v| v.as_str()).map(|s| s.to_string()),
                        accept_selector: info.get("acceptSelector").and_then(|v| v.as_str()).map(|s| s.to_string()),
                        reject_selector: info.get("rejectSelector").and_then(|v| v.as_str()).map(|s| s.to_string()),
                        customize_selector: info.get("customizeSelector").and_then(|v| v.as_str()).map(|s| s.to_string()),
                        close_selector: info.get("closeSelector").and_then(|v| v.as_str()).map(|s| s.to_string()),
                    });
                }
            }
        }

        Ok(ConsentBannerInfo {
            detected: false,
            banner_type: None,
            accept_selector: None,
            reject_selector: None,
            customize_selector: None,
            close_selector: None,
        })
    }

    pub async fn handle_consent(
        &self,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
        action: ConsentAction,
    ) -> Result<ConsentResult> {
        let banner_info = self.detect_banner(browser_manager, session_id, headless, datadir, stealth).await?;

        if !banner_info.detected {
            return Ok(ConsentResult {
                success: true,
                action_taken: "No banner detected".to_string(),
                banner_detected: false,
                error: None,
            });
        }

        let action_taken = match action {
            ConsentAction::AcceptAll => {
                if let Some(ref selector) = banner_info.accept_selector {
                    browser_manager
                        .execute_action(
                            Action::Click,
                            Params::Click(crate::protocol::params::ClickParams {
                                selector: selector.clone(),
                            }),
                            session_id,
                            headless,
                            datadir,
                            stealth,
                        )
                        .await?;
                    "Accepted all cookies"
                } else {
                    return Ok(ConsentResult {
                        success: false,
                        action_taken: "Accept button not found".to_string(),
                        banner_detected: true,
                        error: Some("Could not find accept button".to_string()),
                    });
                }
            }
            ConsentAction::RejectAll => {
                if let Some(ref selector) = banner_info.reject_selector {
                    browser_manager
                        .execute_action(
                            Action::Click,
                            Params::Click(crate::protocol::params::ClickParams {
                                selector: selector.clone(),
                            }),
                            session_id,
                            headless,
                            datadir,
                            stealth,
                        )
                        .await?;
                    "Rejected all non-essential cookies"
                } else if let Some(ref selector) = banner_info.close_selector {
                    browser_manager
                        .execute_action(
                            Action::Click,
                            Params::Click(crate::protocol::params::ClickParams {
                                selector: selector.clone(),
                            }),
                            session_id,
                            headless,
                            datadir,
                            stealth,
                        )
                        .await?;
                    "Closed banner (reject by default)"
                } else {
                    return Ok(ConsentResult {
                        success: false,
                        action_taken: "Reject button not found".to_string(),
                        banner_detected: true,
                        error: Some("Could not find reject button".to_string()),
                    });
                }
            }
            ConsentAction::AcceptNecessaryOnly => {
                if let Some(ref selector) = banner_info.customize_selector {
                    // Click customize to open preferences
                    browser_manager
                        .execute_action(
                            Action::Click,
                            Params::Click(crate::protocol::params::ClickParams {
                                selector: selector.clone(),
                            }),
                            session_id,
                            headless,
                            datadir,
                            stealth,
                        )
                        .await?;
                    
                    // Wait for preferences dialog
                    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
                    
                    // Try to uncheck non-necessary cookies and save
                    self.set_custom_preferences(
                        browser_manager,
                        session_id,
                        headless,
                        datadir,
                        stealth,
                        &CookiePreferences::default(),
                    ).await?;
                    
                    "Accepted only necessary cookies"
                } else {
                    return Ok(ConsentResult {
                        success: false,
                        action_taken: "Customize button not found".to_string(),
                        banner_detected: true,
                        error: Some("Could not find customize button".to_string()),
                    });
                }
            }
            ConsentAction::Custom { preferences } => {
                if let Some(ref selector) = banner_info.customize_selector {
                    browser_manager
                        .execute_action(
                            Action::Click,
                            Params::Click(crate::protocol::params::ClickParams {
                                selector: selector.clone(),
                            }),
                            session_id,
                            headless,
                            datadir,
                            stealth,
                        )
                        .await?;
                    
                    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
                    
                    self.set_custom_preferences(
                        browser_manager,
                        session_id,
                        headless,
                        datadir,
                        stealth,
                        &preferences,
                    ).await?;
                    
                    "Set custom cookie preferences"
                } else {
                    return Ok(ConsentResult {
                        success: false,
                        action_taken: "Customize button not found".to_string(),
                        banner_detected: true,
                        error: Some("Could not find customize button".to_string()),
                    });
                }
            }
        };

        Ok(ConsentResult {
            success: true,
            action_taken: action_taken.to_string(),
            banner_detected: true,
            error: None,
        })
    }

    async fn set_custom_preferences(
        &self,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
        preferences: &CookiePreferences,
    ) -> Result<()> {
        // Common checkbox selectors for cookie preferences
        let checkbox_js = format!(
            r#"
            (function() {{
                const categories = {{
                    functional: {functional},
                    analytics: {analytics},
                    marketing: {marketing}
                }};
                
                for (const [category, enabled] of Object.entries(categories)) {{
                    const selectors = [
                        `input[type="checkbox"][name*="${{category}}" i]`,
                        `input[type="checkbox"][id*="${{category}}" i]`,
                        `input[type="checkbox"][data-category*="${{category}}" i]`,
                        `[role="switch"][aria-label*="${{category}}" i]`,
                        `.${{category}} input[type="checkbox"]`,
                        `[class*="${{category}}"] input[type="checkbox"]`,
                        `[id*="${{category}}"] input[type="checkbox"]`
                    ];
                    
                    for (const selector of selectors) {{
                        const checkbox = document.querySelector(selector);
                        if (checkbox) {{
                            checkbox.checked = enabled;
                            checkbox.dispatchEvent(new Event('change', {{ bubbles: true }}));
                            
                            // For custom toggle switches
                            if (!enabled && checkbox.offsetParent !== null) {{
                                const toggle = checkbox.closest('[role="switch"], .toggle, .switch');
                                if (toggle) {{
                                    toggle.click();
                                }}
                            }}
                        }}
                    }}
                }}
                
                // Look for save/confirm button
                const saveSelectors = [
                    'button:contains("Save")',
                    'button:contains("Confirm")',
                    'button:contains("Apply")',
                    'button:contains("Save preferences")',
                    'button:contains("Confirm choices")',
                    '[aria-label*="save" i]',
                    '[aria-label*="confirm" i]'
                ];
                
                for (const selector of saveSelectors) {{
                    const btn = document.querySelector(selector);
                    if (btn) {{
                        btn.click();
                        break;
                    }}
                }}
                
                return 'Preferences set';
            }})()
            "#,
            functional = preferences.functional,
            analytics = preferences.analytics,
            marketing = preferences.marketing
        );

        browser_manager
            .execute_action(
                Action::ExecuteJs,
                Params::ExecuteJs(crate::protocol::js_executor::ExecuteJsRequest {
                    session_id: Some(session_id.to_string()),
                    script: checkbox_js,
                }),
                session_id,
                headless,
                datadir,
                stealth,
            )
            .await?;

        Ok(())
    }

    pub async fn auto_handle(
        &self,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
        default_action: ConsentAction,
    ) -> Result<ConsentResult> {
        self.handle_consent(
            browser_manager,
            session_id,
            headless,
            datadir,
            stealth,
            default_action,
        )
        .await
    }
}

impl Default for CookieConsentHandler {
    fn default() -> Self {
        Self::new()
    }
}
