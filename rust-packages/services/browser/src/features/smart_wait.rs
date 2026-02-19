use crate::browser::BrowserManager;
use crate::error::Result;
use crate::protocol::{Action, Params};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::{Duration, Instant};
use tokio::time::sleep;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WaitCondition {
    ElementVisible { selector: String },
    ElementHidden { selector: String },
    ElementEnabled { selector: String },
    ElementDisabled { selector: String },
    TextPresent { selector: String, text: String },
    TextAbsent { selector: String, text: String },
    NetworkIdle { timeout_ms: u64 },
    DomStable { stability_ms: u64 },
    AnimationComplete { selector: Option<String> },
    PageLoad { state: PageLoadState },
    Custom { script: String, expected_result: serde_json::Value },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PageLoadState {
    Load,
    DOMContentLoaded,
    NetworkIdle,
    Complete,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SmartWaitResult {
    pub success: bool,
    pub waited_ms: u64,
    pub condition_met: bool,
    pub error: Option<String>,
}

pub struct SmartWaitManager;

impl SmartWaitManager {
    pub fn new() -> Self {
        Self
    }

    pub async fn wait_for(
        &self,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
        condition: WaitCondition,
        timeout_ms: u64,
    ) -> Result<SmartWaitResult> {
        let start = Instant::now();
        let check_interval = 100u64;

        while (start.elapsed().as_millis() as u64) < timeout_ms {
            let condition_met = self
                .check_condition(
                    browser_manager, session_id, headless, datadir, stealth, &condition,
                )
                .await?;

            if condition_met {
                return Ok(SmartWaitResult {
                    success: true,
                    waited_ms: start.elapsed().as_millis() as u64,
                    condition_met: true,
                    error: None,
                });
            }

            sleep(Duration::from_millis(check_interval)).await;
        }

        Ok(SmartWaitResult {
            success: false,
            waited_ms: start.elapsed().as_millis() as u64,
            condition_met: false,
            error: Some(format!("Condition not met within {}ms", timeout_ms)),
        })
    }

    async fn check_condition(
        &self,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
        condition: &WaitCondition,
    ) -> Result<bool> {
        match condition {
            WaitCondition::ElementVisible { selector } => {
                let result = browser_manager
                    .execute_action(
                        Action::IsVisible,
                        Params::IsVisible(crate::protocol::params::IsVisibleParams {
                            selector: selector.clone(),
                        }),
                        session_id,
                        headless,
                        datadir,
                        stealth,
                    )
                    .await?;
                Ok(result.and_then(|v| v.as_bool()).unwrap_or(false))
            }
            WaitCondition::ElementHidden { selector } => {
                let result = browser_manager
                    .execute_action(
                        Action::IsVisible,
                        Params::IsVisible(crate::protocol::params::IsVisibleParams {
                            selector: selector.clone(),
                        }),
                        session_id,
                        headless,
                        datadir,
                        stealth,
                    )
                    .await?;
                Ok(!result.and_then(|v| v.as_bool()).unwrap_or(true))
            }
            WaitCondition::ElementEnabled { selector } => {
                let result = browser_manager
                    .execute_action(
                        Action::IsEnabled,
                        Params::IsEnabled(crate::protocol::params::IsEnabledParams {
                            selector: selector.clone(),
                        }),
                        session_id,
                        headless,
                        datadir,
                        stealth,
                    )
                    .await?;
                Ok(result.and_then(|v| v.as_bool()).unwrap_or(false))
            }
            WaitCondition::ElementDisabled { selector } => {
                let result = browser_manager
                    .execute_action(
                        Action::IsEnabled,
                        Params::IsEnabled(crate::protocol::params::IsEnabledParams {
                            selector: selector.clone(),
                        }),
                        session_id,
                        headless,
                        datadir,
                        stealth,
                    )
                    .await?;
                Ok(!result.and_then(|v| v.as_bool()).unwrap_or(true))
            }
            WaitCondition::TextPresent { selector, text } => {
                let result = browser_manager
                    .execute_action(
                        Action::GetText,
                        Params::GetText(crate::protocol::params::GetTextParams {
                            selector: selector.clone(),
                        }),
                        session_id,
                        headless,
                        datadir,
                        stealth,
                    )
                    .await?;
                Ok(result
                    .and_then(|v| v.as_str())
                    .map(|s| s.contains(text))
                    .unwrap_or(false))
            }
            WaitCondition::TextAbsent { selector, text } => {
                let result = browser_manager
                    .execute_action(
                        Action::GetText,
                        Params::GetText(crate::protocol::params::GetTextParams {
                            selector: selector.clone(),
                        }),
                        session_id,
                        headless,
                        datadir,
                        stealth,
                    )
                    .await?;
                Ok(!result
                    .and_then(|v| v.as_str())
                    .map(|s| s.contains(text))
                    .unwrap_or(true))
            }
            WaitCondition::NetworkIdle { timeout_ms: _ } => {
                // Check if network is idle by monitoring pending requests
                let result = browser_manager
                    .execute_action(
                        Action::ExecuteJs,
                        Params::ExecuteJs(crate::protocol::js_executor::ExecuteJsRequest {
                            session_id: Some(session_id.to_string()),
                            script: r#"
                                (function() {
                                    return window.performance.getEntriesByType('resource')
                                        .filter(r => r.responseEnd === 0).length === 0;
                                })()
                            "#
                            .to_string(),
                        }),
                        session_id,
                        headless,
                        datadir,
                        stealth,
                    )
                    .await?;
                Ok(result.and_then(|v| v.as_bool()).unwrap_or(false))
            }
            WaitCondition::DomStable { stability_ms } => {
                let result = browser_manager
                    .execute_action(
                        Action::ExecuteJs,
                        Params::ExecuteJs(crate::protocol::js_executor::ExecuteJsRequest {
                            session_id: Some(session_id.to_string()),
                            script: format!(
                                r#"
                                    (function() {{
                                        if (!window.__lastDomMutation) {{
                                            window.__lastDomMutation = Date.now();
                                            new MutationObserver(() => {{
                                                window.__lastDomMutation = Date.now();
                                            }}).observe(document.body, {{
                                                childList: true,
                                                subtree: true,
                                                attributes: true
                                            }});
                                        }}
                                        return (Date.now() - window.__lastDomMutation) > {};
                                    }})()
                                "#,
                                stability_ms
                            ),
                        }),
                        session_id,
                        headless,
                        datadir,
                        stealth,
                    )
                    .await?;
                Ok(result.and_then(|v| v.as_bool()).unwrap_or(false))
            }
            WaitCondition::AnimationComplete { selector } => {
                let script = if let Some(sel) = selector {
                    format!(
                        r#"
                            (function() {{
                                const el = document.querySelector('{}');
                                if (!el) return true;
                                const style = window.getComputedStyle(el);
                                return style.animationPlayState !== 'running' && 
                                       style.transitionProperty === 'all' || 
                                       !style.transitionDuration.includes('0s');
                            }})()
                        "#,
                        sel
                    )
                } else {
                    r#"
                        (function() {
                            const allElements = document.querySelectorAll('*');
                            for (const el of allElements) {
                                const style = window.getComputedStyle(el);
                                if (style.animationPlayState === 'running') {
                                    return false;
                                }
                            }
                            return true;
                        })()
                    "#
                    .to_string()
                };

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
                Ok(result.and_then(|v| v.as_bool()).unwrap_or(false))
            }
            WaitCondition::PageLoad { state } => {
                let script = match state {
                    PageLoadState::Load => "document.readyState === 'loading'",
                    PageLoadState::DOMContentLoaded => "document.readyState === 'interactive'",
                    PageLoadState::NetworkIdle | PageLoadState::Complete => {
                        "document.readyState === 'complete'"
                    }
                };

                let result = browser_manager
                    .execute_action(
                        Action::ExecuteJs,
                        Params::ExecuteJs(crate::protocol::js_executor::ExecuteJsRequest {
                            session_id: Some(session_id.to_string()),
                            script: format!("({})", script),
                        }),
                        session_id,
                        headless,
                        datadir,
                        stealth,
                    )
                    .await?;
                Ok(result.and_then(|v| v.as_bool()).unwrap_or(false))
            }
            WaitCondition::Custom { script, expected_result } => {
                let result = browser_manager
                    .execute_action(
                        Action::ExecuteJs,
                        Params::ExecuteJs(crate::protocol::js_executor::ExecuteJsRequest {
                            session_id: Some(session_id.to_string()),
                            script: script.clone(),
                        }),
                        session_id,
                        headless,
                        datadir,
                        stealth,
                    )
                    .await?;
                Ok(result.as_ref() == Some(expected_result))
            }
        }
    }

    pub async fn auto_wait_after_action(
        &self,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
        action: &Action,
    ) -> Result<()> {
        // Smart waiting based on action type
        match action {
            Action::Click | Action::Fill | Action::Type | Action::TypeSecret => {
                // Wait for DOM to stabilize after interaction
                self.wait_for(
                    browser_manager,
                    session_id,
                    headless,
                    datadir,
                    stealth,
                    WaitCondition::DomStable { stability_ms: 100 },
                    5000,
                )
                .await?;
            }
            Action::Open | Action::Reload => {
                // Wait for page load and network idle
                self.wait_for(
                    browser_manager,
                    session_id,
                    headless,
                    datadir,
                    stealth,
                    WaitCondition::PageLoad {
                        state: PageLoadState::Complete,
                    },
                    30000,
                )
                .await?;

                // Additional wait for network idle
                sleep(Duration::from_millis(500)).await;
            }
            _ => {}
        }

        Ok(())
    }
}

impl Default for SmartWaitManager {
    fn default() -> Self {
        Self::new()
    }
}
