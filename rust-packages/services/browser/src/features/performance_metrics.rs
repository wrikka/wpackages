use crate::browser::BrowserManager;
use crate::error::Result;
use crate::protocol::{Action, Params};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceMetrics {
    pub url: String,
    pub timestamp: String,
    pub core_web_vitals: CoreWebVitals,
    pub navigation_timing: NavigationTiming,
    pub resource_timing: Vec<ResourceTiming>,
    pub paint_timing: PaintTiming,
    pub lighthouse_scores: Option<LighthouseScores>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoreWebVitals {
    pub lcp: Option<f64>, // Largest Contentful Paint (ms)
    pub fcp: Option<f64>, // First Contentful Paint (ms)
    pub cls: Option<f64>, // Cumulative Layout Shift
    pub fid: Option<f64>, // First Input Delay (ms)
    pub ttfb: Option<f64>, // Time to First Byte (ms)
    pub inp: Option<f64>, // Interaction to Next Paint (ms)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavigationTiming {
    pub dns_lookup_time: f64,
    pub connection_time: f64,
    pub ssl_handshake_time: f64,
    pub request_time: f64,
    pub response_time: f64,
    pub dom_processing_time: f64,
    pub load_event_time: f64,
    pub total_load_time: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceTiming {
    pub name: String,
    pub duration: f64,
    pub size: Option<u64>,
    pub initiator_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaintTiming {
    pub first_paint: Option<f64>,
    pub first_contentful_paint: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LighthouseScores {
    pub performance: f64,
    pub accessibility: f64,
    pub best_practices: f64,
    pub seo: f64,
    pub pwa: Option<f64>,
}

pub struct PerformanceAnalyzer;

impl PerformanceAnalyzer {
    pub fn new() -> Self {
        Self
    }

    pub async fn analyze_performance(
        &self,
        browser_manager: &BrowserManager,
        session_id: &str,
        headless: bool,
        datadir: Option<&str>,
        stealth: bool,
    ) -> Result<PerformanceMetrics> {
        let url_result = browser_manager
            .execute_action(Action::GetUrl, Params::Empty, session_id, headless, datadir, stealth)
            .await?;
        let url = url_result
            .and_then(|v| v.as_str().map(|s| s.to_string()))
            .unwrap_or_default();

        // Collect all performance metrics via JavaScript
        let metrics_js = r#"
            (function() {
                const navEntry = performance.getEntriesByType('navigation')[0];
                const paintEntries = performance.getEntriesByType('paint');
                const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
                const resourceEntries = performance.getEntriesByType('resource');
                const layoutShiftEntries = performance.getEntriesByType('layout-shift');
                
                // Calculate Core Web Vitals
                let lcp = null;
                if (lcpEntries.length > 0) {
                    lcpEntries.sort((a, b) => b.startTime - a.startTime);
                    lcp = lcpEntries[0].startTime;
                }
                
                // Calculate CLS
                let cls = 0;
                layoutShiftEntries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        cls += entry.value;
                    }
                });
                
                // Navigation Timing
                const navTiming = {
                    dnsLookupTime: navEntry.domainLookupEnd - navEntry.domainLookupStart,
                    connectionTime: navEntry.connectEnd - navEntry.connectStart,
                    sslHandshakeTime: navEntry.secureConnectionStart > 0 
                        ? navEntry.connectEnd - navEntry.secureConnectionStart 
                        : 0,
                    requestTime: navEntry.responseStart - navEntry.requestStart,
                    responseTime: navEntry.responseEnd - navEntry.responseStart,
                    domProcessingTime: navEntry.domComplete - navEntry.domLoading,
                    loadEventTime: navEntry.loadEventEnd - navEntry.loadEventStart,
                    totalLoadTime: navEntry.loadEventEnd - navEntry.startTime
                };
                
                // Paint Timing
                const paintTiming = {};
                paintEntries.forEach(entry => {
                    if (entry.name === 'first-paint') {
                        paintTiming.firstPaint = entry.startTime;
                    }
                    if (entry.name === 'first-contentful-paint') {
                        paintTiming.firstContentfulPaint = entry.startTime;
                    }
                });
                
                // Resource Timing (top 10 by duration)
                const resourceTiming = resourceEntries
                    .sort((a, b) => b.duration - a.duration)
                    .slice(0, 10)
                    .map(entry => ({
                        name: entry.name,
                        duration: entry.duration,
                        size: entry.transferSize,
                        initiatorType: entry.initiatorType
                    }));
                
                return JSON.stringify({
                    coreWebVitals: {
                        lcp: lcp,
                        cls: cls > 0 ? cls : null,
                        ttfb: navEntry.responseStart - navEntry.startTime,
                        fcp: paintTiming.firstContentfulPaint || null
                    },
                    navigationTiming: navTiming,
                    paintTiming: paintTiming,
                    resourceTiming: resourceTiming
                });
            })()
        "#;

        let metrics_result = browser_manager
            .execute_action(
                Action::ExecuteJs,
                Params::ExecuteJs(crate::protocol::js_executor::ExecuteJsRequest {
                    session_id: Some(session_id.to_string()),
                    script: metrics_js.to_string(),
                }),
                session_id,
                headless,
                datadir,
                stealth,
            )
            .await?;

        let metrics_data = if let Some(data) = metrics_result {
            if let Some(json_str) = data.as_str() {
                serde_json::from_str::<serde_json::Value>(json_str).unwrap_or_default()
            } else {
                serde_json::Value::Null
            }
        } else {
            serde_json::Value::Null
        };

        let core_web_vitals = if let Some(cwv) = metrics_data.get("coreWebVitals") {
            CoreWebVitals {
                lcp: cwv.get("lcp").and_then(|v| v.as_f64()),
                fcp: cwv.get("fcp").and_then(|v| v.as_f64()),
                cls: cwv.get("cls").and_then(|v| v.as_f64()),
                fid: None, // Requires user interaction
                ttfb: cwv.get("ttfb").and_then(|v| v.as_f64()),
                inp: None, // Requires user interaction
            }
        } else {
            CoreWebVitals {
                lcp: None,
                fcp: None,
                cls: None,
                fid: None,
                ttfb: None,
                inp: None,
            }
        };

        let navigation_timing = if let Some(nt) = metrics_data.get("navigationTiming") {
            NavigationTiming {
                dns_lookup_time: nt.get("dnsLookupTime").and_then(|v| v.as_f64()).unwrap_or(0.0),
                connection_time: nt.get("connectionTime").and_then(|v| v.as_f64()).unwrap_or(0.0),
                ssl_handshake_time: nt.get("sslHandshakeTime").and_then(|v| v.as_f64()).unwrap_or(0.0),
                request_time: nt.get("requestTime").and_then(|v| v.as_f64()).unwrap_or(0.0),
                response_time: nt.get("responseTime").and_then(|v| v.as_f64()).unwrap_or(0.0),
                dom_processing_time: nt.get("domProcessingTime").and_then(|v| v.as_f64()).unwrap_or(0.0),
                load_event_time: nt.get("loadEventTime").and_then(|v| v.as_f64()).unwrap_or(0.0),
                total_load_time: nt.get("totalLoadTime").and_then(|v| v.as_f64()).unwrap_or(0.0),
            }
        } else {
            NavigationTiming {
                dns_lookup_time: 0.0,
                connection_time: 0.0,
                ssl_handshake_time: 0.0,
                request_time: 0.0,
                response_time: 0.0,
                dom_processing_time: 0.0,
                load_event_time: 0.0,
                total_load_time: 0.0,
            }
        };

        let paint_timing = if let Some(pt) = metrics_data.get("paintTiming") {
            PaintTiming {
                first_paint: pt.get("firstPaint").and_then(|v| v.as_f64()),
                first_contentful_paint: pt.get("firstContentfulPaint").and_then(|v| v.as_f64()),
            }
        } else {
            PaintTiming {
                first_paint: None,
                first_contentful_paint: None,
            }
        };

        let resource_timing = if let Some(rt) = metrics_data.get("resourceTiming").and_then(|v| v.as_array()) {
            rt.iter()
                .filter_map(|entry| {
                    Some(ResourceTiming {
                        name: entry.get("name")?.as_str()?.to_string(),
                        duration: entry.get("duration")?.as_f64()?,
                        size: entry.get("size").and_then(|v| v.as_u64()),
                        initiator_type: entry.get("initiatorType")?.as_str()?.to_string(),
                    })
                })
                .collect()
        } else {
            Vec::new()
        };

        // Generate lighthouse-like scores based on Core Web Vitals
        let lighthouse_scores = Self::calculate_lighthouse_scores(&core_web_vitals);

        Ok(PerformanceMetrics {
            url,
            timestamp: chrono::Utc::now().to_rfc3339(),
            core_web_vitals,
            navigation_timing,
            resource_timing,
            paint_timing,
            lighthouse_scores: Some(lighthouse_scores),
        })
    }

    fn calculate_lighthouse_scores(cwv: &CoreWebVitals) -> LighthouseScores {
        // Simplified scoring based on Core Web Vitals thresholds
        let performance = Self::score_metric(cwv.lcp, 2500.0, 4000.0) * 0.4
            + Self::score_metric(cwv.fcp, 1800.0, 3000.0) * 0.3
            + Self::score_cls_metric(cwv.cls) * 0.3;

        LighthouseScores {
            performance: performance.round(),
            accessibility: 0.0, // Would need axe-core or similar
            best_practices: 0.0, // Would need custom checks
            seo: 0.0, // Would need custom checks
            pwa: None,
        }
    }

    fn score_metric(value: Option<f64>, good_threshold: f64, poor_threshold: f64) -> f64 {
        match value {
            Some(v) => {
                if v <= good_threshold {
                    100.0
                } else if v >= poor_threshold {
                    0.0
                } else {
                    100.0 - ((v - good_threshold) / (poor_threshold - good_threshold) * 100.0)
                }
            }
            None => 0.0,
        }
    }

    fn score_cls_metric(value: Option<f64>) -> f64 {
        match value {
            Some(v) => {
                if v <= 0.1 {
                    100.0
                } else if v >= 0.25 {
                    0.0
                } else {
                    100.0 - ((v - 0.1) / 0.15 * 100.0)
                }
            }
            None => 0.0,
        }
    }

    pub fn generate_report(&self, metrics: &PerformanceMetrics) -> String {
        let mut report = format!("# Performance Report for {}\n\n", metrics.url);
        report.push_str(&format!("Generated: {}\n\n", metrics.timestamp));

        report.push_str("## Core Web Vitals\n\n");
        report.push_str(&format!(
            "- **LCP**: {}ms (Good: <2.5s, Needs Improvement: <4s)\n",
            Self::format_metric(metrics.core_web_vitals.lcp, "ms")
        ));
        report.push_str(&format!(
            "- **FCP**: {}ms (Good: <1.8s, Needs Improvement: <3s)\n",
            Self::format_metric(metrics.core_web_vitals.fcp, "ms")
        ));
        report.push_str(&format!(
            "- **CLS**: {} (Good: <0.1, Needs Improvement: <0.25)\n",
            Self::format_metric(metrics.core_web_vitals.cls, "")
        ));
        report.push_str(&format!(
            "- **TTFB**: {}ms\n",
            Self::format_metric(metrics.core_web_vitals.ttfb, "ms")
        ));

        report.push_str("\n## Navigation Timing\n\n");
        report.push_str(&format!(
            "- **DNS Lookup**: {:.2}ms\n",
            metrics.navigation_timing.dns_lookup_time
        ));
        report.push_str(&format!(
            "- **Connection**: {:.2}ms\n",
            metrics.navigation_timing.connection_time
        ));
        report.push_str(&format!(
            "- **SSL Handshake**: {:.2}ms\n",
            metrics.navigation_timing.ssl_handshake_time
        ));
        report.push_str(&format!(
            "- **Request**: {:.2}ms\n",
            metrics.navigation_timing.request_time
        ));
        report.push_str(&format!(
            "- **Response**: {:.2}ms\n",
            metrics.navigation_timing.response_time
        ));
        report.push_str(&format!(
            "- **DOM Processing**: {:.2}ms\n",
            metrics.navigation_timing.dom_processing_time
        ));
        report.push_str(&format!(
            "- **Total Load**: {:.2}ms\n",
            metrics.navigation_timing.total_load_time
        ));

        if let Some(ref scores) = metrics.lighthouse_scores {
            report.push_str("\n## Lighthouse Scores\n\n");
            report.push_str(&format!("- **Performance**: {:.0}%\n", scores.performance));
        }

        report
    }

    fn format_metric(value: Option<f64>, unit: &str) -> String {
        match value {
            Some(v) => format!("{:.2}{}", v, unit),
            None => "N/A".to_string(),
        }
    }
}

impl Default for PerformanceAnalyzer {
    fn default() -> Self {
        Self::new()
    }
}
