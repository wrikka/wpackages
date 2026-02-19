use crate::browser::SessionState;
use crate::error::{Error, Result};
use crate::protocol::cookies::{AddCookieRequest, DeleteCookieRequest, GetCookiesResponse};
use crate::protocol::Response;
use chromiumoxide::cdp::browser_protocol::network::{self, CookieParamBuilder};
use serde_json::json;

pub async fn get_cookies(session_guard: &mut tokio::sync::MutexGuard<'_, SessionState>) -> Result<Response> {
    let page = session_guard.active_page.as_ref().ok_or(Error::NoPage)?;
    let cookies = page.get_cookies().await.map_err(|e| Error::Chromium(e.to_string()))?;
    let response_data = GetCookiesResponse { 
        cookies: cookies.into_iter().map(|c| crate::protocol::cookies::Cookie { 
            name: c.name, 
            value: c.value, 
            domain: c.domain, 
            path: c.path, 
            expires: c.expires, 
            http_only: c.http_only, 
            secure: c.secure, 
            same_site: c.same_site.map(|s| format!("{:?}", s)) 
        }).collect() 
    };
    Ok(Response::success("get_cookies".to_string(), Some(json!(response_data))))
}

pub async fn add_cookie(session_guard: &mut tokio::sync::MutexGuard<'_, SessionState>, params: &AddCookieRequest) -> Result<Response> {
    let page = session_guard.active_page.as_ref().ok_or(Error::NoPage)?;
    
    let mut builder = CookieParamBuilder::default();
    builder.name(params.name.clone()).value(params.value.clone());
    
    if let Some(url) = &params.url { builder.url(url.clone()); }
    if let Some(domain) = &params.domain { builder.domain(domain.clone()); }
    if let Some(path) = &params.path { builder.path(path.clone()); }
    if let Some(secure) = params.secure { builder.secure(secure); }
    if let Some(http_only) = params.http_only { builder.http_only(http_only); }
    if let Some(same_site) = &params.same_site { 
        let same_site_enum = match same_site.as_str() {
            "Strict" => network::CookieSameSite::Strict,
            "Lax" => network::CookieSameSite::Lax,
            _ => network::CookieSameSite::None,
        };
        builder.same_site(same_site_enum); 
    }
    if let Some(expires) = params.expires { builder.expires(expires); }

    let cookie = builder.build().map_err(|e| Error::Other(format!("Failed to build cookie: {}", e)))?;
    page.execute(network::SetCookieParams::from(cookie)).await.map_err(|e| Error::Chromium(e.to_string()))?;
    Ok(Response::success("add_cookie".to_string(), None))
}

pub async fn delete_cookie(session_guard: &mut tokio::sync::MutexGuard<'_, SessionState>, params: &DeleteCookieRequest) -> Result<Response> {
    let page = session_guard.active_page.as_ref().ok_or(Error::NoPage)?;
    page.execute(network::DeleteCookiesParams::new(params.name.clone()).url(params.url.clone().unwrap_or_default()))
        .await
        .map_err(|e| Error::Chromium(e.to_string()))?;
    Ok(Response::success("delete_cookie".to_string(), None))
}
