//! Browser action implementations.

use super::{BrowserManager, SessionState};
use crate::error::{Error, Result};
use crate::protocol::params::{
    CheckParams, ClickParams, FillParams, HoverParams, ScrollParams, TypeParams,
    UncheckParams, UploadParams,
};
use crate::protocol::Response;
use chromiumoxide::element::Element;

impl BrowserManager {
    /// Generic action performer with element healing
    pub(super) async fn perform_action<'a, F, Fut>(
        &self,
        session: &mut SessionState,
        selector: &str,
        action: F,
    ) -> Result<Response>
    where
        F: Fn(Element) -> Fut,
        Fut: std::future::Future<Output = Result<()>> + 'a,
    {
        let element = self.find_element_with_healing(session, selector).await?;
        action(element).await?;
        Ok(Response::success(uuid::Uuid::new_v4().to_string(), None))
    }

    /// Click on an element
    pub(super) async fn click_element(
        &self,
        session: &mut SessionState,
        params: &ClickParams,
    ) -> Result<Response> {
        let element = self.find_element_with_healing(session, &params.selector).await?;
        element.click().await?;
        Ok(Response::success(uuid::Uuid::new_v4().to_string(), None))
    }

    /// Type text into an element
    pub(super) async fn type_into_element(
        &self,
        session: &mut SessionState,
        params: &TypeParams,
    ) -> Result<Response> {
        let element = self.find_element_with_healing(session, &params.selector).await?;
        element.type_str(&params.text).await?;
        Ok(Response::success(uuid::Uuid::new_v4().to_string(), None))
    }

    /// Fill an input field
    pub(super) async fn fill_element(
        &self,
        session: &mut SessionState,
        params: &FillParams,
    ) -> Result<Response> {
        let element = self.find_element_with_healing(session, &params.selector).await?;
        element.focus().await?;
        element.type_str(&params.value).await?;
        Ok(Response::success(uuid::Uuid::new_v4().to_string(), None))
    }

    /// Hover over an element
    pub(super) async fn hover_element(
        &self,
        session: &mut SessionState,
        params: &HoverParams,
    ) -> Result<Response> {
        let element = self.find_element_with_healing(session, &params.selector).await?;
        element.hover().await?;
        Ok(Response::success(uuid::Uuid::new_v4().to_string(), None))
    }

    /// Scroll on an element
    pub(super) async fn scroll_element(
        &self,
        session: &mut SessionState,
        params: &ScrollParams,
    ) -> Result<Response> {
        let element = self.find_element_with_healing(session, &params.selector).await?;
        element.scroll_into_view().await?;
        Ok(Response::success(uuid::Uuid::new_v4().to_string(), None))
    }

    /// Check a checkbox or radio button
    pub(super) async fn check_element(
        &self,
        session: &mut SessionState,
        params: &CheckParams,
    ) -> Result<Response> {
        let element = self.find_element_with_healing(session, &params.selector).await?;
        element.click().await?;
        Ok(Response::success(uuid::Uuid::new_v4().to_string(), None))
    }

    /// Uncheck a checkbox
    pub(super) async fn uncheck_element(
        &self,
        session: &mut SessionState,
        params: &UncheckParams,
    ) -> Result<Response> {
        let element = self.find_element_with_healing(session, &params.selector).await?;
        // Use JavaScript to check if element is checked
        let result = element.call_js_fn("function() { return this.checked; }", false).await.map_err(|e| Error::JavaScript(e.to_string()))?;
        let is_checked: bool = result.result.value.unwrap_or_default().as_bool().unwrap_or(false);
        if is_checked {
            element.click().await?;
        }
        Ok(Response::success(uuid::Uuid::new_v4().to_string(), None))
    }

    /// Upload a file to an input element
    pub(super) async fn upload_file(
        &self,
        session: &mut SessionState,
        params: &UploadParams,
    ) -> Result<Response> {
        let element = self.find_element_with_healing(session, &params.selector).await?;
        // Use set_input_files via JavaScript
        let path = &params.path;
        element.call_js_fn(&format!("function() {{ this.value = '{}'; }}", path), false).await.map_err(|e| Error::JavaScript(e.to_string()))?;
        Ok(Response::success(uuid::Uuid::new_v4().to_string(), None))
    }
}
