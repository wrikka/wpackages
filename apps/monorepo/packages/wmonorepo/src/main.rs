use wmorepo::{run_app, AppResult};

#[tokio::main]
async fn main() -> AppResult<()> {
    run_app().await
}
