use axum::{
    response::Html,
    routing::get,
    Router,
};

/// Creates a router for the UI.
pub fn create_ui_router() -> Router {
    Router::new().route("/", get(playground))
}

/// Serves the playground HTML page.
async fn playground() -> Html<&'static str> {
    Html(include_str!("../../ui/playground.html"))
}
