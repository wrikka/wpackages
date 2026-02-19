use crate::browser::SessionState;
use crate::error::{Error, Result};
use crate::protocol::geolocation::SetGeolocationRequest;
use crate::protocol::Response;
use chromiumoxide::cdp::browser_protocol::emulation;

pub async fn set_geolocation(
    session_guard: &mut tokio::sync::MutexGuard<'_, SessionState>,
    params: &SetGeolocationRequest,
) -> Result<Response> {
    let page = session_guard.active_page.as_ref().ok_or(Error::NoPage)?;

    let geo_params = emulation::SetGeolocationOverrideParams::builder()
        .latitude(params.latitude)
        .longitude(params.longitude)
        .accuracy(params.accuracy.unwrap_or(100.0))
        .build();

    page.execute(geo_params).await?;

    Ok(Response::success("set_geolocation".to_string(), None))
}
