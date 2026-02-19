use crate::browser::SessionState;
use crate::error::{Error, Result};
use crate::protocol::forms::AutomatedFormFillRequest;
use crate::protocol::Response;

pub async fn automated_fill(
    session_guard: &mut tokio::sync::MutexGuard<'_, SessionState>,
    params: &AutomatedFormFillRequest,
) -> Result<Response> {
    let page = session_guard.active_page.as_ref().ok_or(Error::NoPage)?;

    for field in &params.fields {
        let element = page.find_element(&field.selector).await?;
        element.focus().await?;
        element.type_str(&field.value).await?;
    }

    Ok(Response::success("automated_fill".to_string(), None))
}
