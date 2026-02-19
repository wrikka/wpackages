use super::{BrowserManager, SessionState};
use crate::error::{Error, Result};
use crate::protocol::Response;

impl BrowserManager {
    pub(super) async fn get_text(&self, session: &mut SessionState, params: &crate::protocol::params::GetTextParams) -> Result<Response> {
        let element = self.find_element_with_healing(session, &params.selector).await?;
        let text = element.inner_text().await?.unwrap_or_default();
        Ok(Response::success(uuid::Uuid::new_v4().to_string(), Some(serde_json::json!({ "text": text }))))
    }

    pub(super) async fn get_html(&self, session: &mut SessionState, params: &crate::protocol::params::GetHtmlParams) -> Result<Response> {
        let element = self.find_element_with_healing(session, &params.selector).await?;
        let html = element.inner_html().await?.unwrap_or_default();
        Ok(Response::success(uuid::Uuid::new_v4().to_string(), Some(serde_json::json!({ "html": html }))))
    }

    pub(super) async fn get_value(&self, session: &mut SessionState, params: &crate::protocol::params::GetValueParams) -> Result<Response> {
        let element = self.find_element_with_healing(session, &params.selector).await?;
        let result = element.call_js_fn("function() { return this.value; }", false).await.map_err(|e| Error::JavaScript(e.to_string()))?;
        let value: String = result.result.value.unwrap_or_default().as_str().unwrap_or("").to_string();
        Ok(Response::success(uuid::Uuid::new_v4().to_string(), Some(serde_json::json!({ "value": value }))))
    }

    pub(super) async fn get_attr(&self, session: &mut SessionState, params: &crate::protocol::params::GetAttrParams) -> Result<Response> {
        let element = self.find_element_with_healing(session, &params.selector).await?;
        let result = element.call_js_fn(&format!("function() {{ return this.getAttribute('{}'); }}", params.name), false).await.map_err(|e| Error::JavaScript(e.to_string()))?;
        let attr: String = result.result.value.unwrap_or_default().as_str().unwrap_or("").to_string();
        Ok(Response::success(uuid::Uuid::new_v4().to_string(), Some(serde_json::json!({ "attribute": attr }))))
    }

    pub(super) async fn get_count(&self, session: &mut SessionState, params: &crate::protocol::params::GetCountParams) -> Result<Response> {
        let page = session.active_page.as_mut().ok_or(Error::NoPage)?;
        let elements = page.find_elements(&params.selector).await?;
        Ok(Response::success(uuid::Uuid::new_v4().to_string(), Some(serde_json::json!({ "count": elements.len() }))))
    }

    pub(super) async fn is_visible(&self, session: &mut SessionState, params: &crate::protocol::params::IsVisibleParams) -> Result<Response> {
        let element = self.find_element_with_healing(session, &params.selector).await?;
        let result = element.call_js_fn("function() { return this.offsetParent !== null; }", false).await.map_err(|e| Error::JavaScript(e.to_string()))?;
        let is_visible: bool = result.result.value.unwrap_or_default().as_bool().unwrap_or(false);
        Ok(Response::success(uuid::Uuid::new_v4().to_string(), Some(serde_json::json!({ "visible": is_visible }))))
    }

    pub(super) async fn is_enabled(&self, session: &mut SessionState, params: &crate::protocol::params::IsEnabledParams) -> Result<Response> {
        let element = self.find_element_with_healing(session, &params.selector).await?;
        let result = element.call_js_fn("function() { return !this.disabled; }", false).await.map_err(|e| Error::JavaScript(e.to_string()))?;
        let is_enabled: bool = result.result.value.unwrap_or_default().as_bool().unwrap_or(false);
        Ok(Response::success(uuid::Uuid::new_v4().to_string(), Some(serde_json::json!({ "enabled": is_enabled }))))
    }

    pub(super) async fn is_checked(&self, session: &mut SessionState, params: &crate::protocol::params::IsCheckedParams) -> Result<Response> {
        let element = self.find_element_with_healing(session, &params.selector).await?;
        let result = element.call_js_fn("function() { return this.checked; }", false).await.map_err(|e| Error::JavaScript(e.to_string()))?;
        let is_checked: bool = result.result.value.unwrap_or_default().as_bool().unwrap_or(false);
        Ok(Response::success(uuid::Uuid::new_v4().to_string(), Some(serde_json::json!({ "checked": is_checked }))))
    }

    pub(super) async fn extract_table(&self, session: &mut SessionState, params: &crate::protocol::params::ExtractTableParams) -> Result<Response> {
        let element = self.find_element_with_healing(session, &params.selector).await?;

        let script = r#"function() {
            const table = this;
            const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
            const rows = Array.from(table.querySelectorAll('tbody tr'));
            return rows.map(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                return headers.reduce((obj, header, index) => {
                    obj[header] = cells[index] ? cells[index].textContent.trim() : '';
                    return obj;
                }, {});
            });
        }"#;

        let result = element.call_js_fn(script, false).await.map_err(|e| Error::JavaScript(e.to_string()))?;
        let table_data = result.result.value.unwrap_or(serde_json::Value::Null);

        Ok(Response::success(uuid::Uuid::new_v4().to_string(), Some(table_data)))
    }
}
