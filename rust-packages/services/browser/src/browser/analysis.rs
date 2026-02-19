use crate::browser::SessionState;
use crate::error::{Error, Result};
use crate::protocol::page_summary::PageSummary;
use crate::protocol::Response;
use crate::protocol::element_finder::{ElementFinderRequest, ElementFinderResponse, FoundElement};
use fuzzy_matcher::skim::SkimMatcherV2;
use fuzzy_matcher::FuzzyMatcher;
use serde_json::json;

pub async fn summarize_page(
    session_guard: &mut tokio::sync::MutexGuard<'_, SessionState>,
) -> Result<Response> {
    let page = session_guard.active_page.as_ref().ok_or(Error::NoPage)?;
    
    // In a real implementation, we would use an LLM to summarize the page content.
    // For now, we'll just get the text content and provide a placeholder summary.
    let text_content = page.content().await.map_err(|e| Error::ContentExtraction(e.to_string()))?;

    let summary = PageSummary {
        summary: format!("This is a placeholder summary for a page with {} characters.", text_content.len()),
    };

    Ok(Response::success(
        "summarize_page".to_string(),
        Some(json!(summary)),
    ))
}

pub async fn find_element(
    session_guard: &mut tokio::sync::MutexGuard<'_, SessionState>,
    params: &ElementFinderRequest,
) -> Result<Response> {
    let last_snapshot = session_guard.last_snapshot.clone().ok_or(Error::NoSnapshot)?;
    let matcher = SkimMatcherV2::default();

    let mut found_elements: Vec<FoundElement> = last_snapshot
        .iter()
        .filter_map(|node| {
            let choice = format!(
                "{} {} {}",
                node.role,
                node.name.as_deref().unwrap_or(""),
                node.description.as_deref().unwrap_or("")
            );
            matcher.fuzzy_match(&choice, &params.query).map(|score| FoundElement {
                ref_id: node.ref_id.clone(),
                score,
            })
        })
        .collect();

    found_elements.sort_by(|a, b| b.score.cmp(&a.score));

    let response_data = ElementFinderResponse {
        elements: found_elements,
    };

    Ok(Response::success(
        "find_element".to_string(),
        Some(json!(response_data)),
    ))
}
