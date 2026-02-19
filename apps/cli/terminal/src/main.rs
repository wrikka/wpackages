use terminal::app::App;
use terminal::error::Result;

fn main() -> Result<()> {
    // Initialize telemetry
    terminal::telemetry::init_subscriber();

    // Create and run the application
    let app = App::new()?;
    app.run()?;

    Ok(())
}
