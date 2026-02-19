use axum::{
    response::Html,
    routing::get,
    Router,
};

/// Creates a router for the visualization UI.
pub fn create_visualization_router() -> Router {
    Router::new().route("/visualize", get(visualization_page))
}

/// Serves the visualization HTML page.
async fn visualization_page() -> Html<&'static str> {
    Html(include_str!("../../ui/visualization.html"))
}
