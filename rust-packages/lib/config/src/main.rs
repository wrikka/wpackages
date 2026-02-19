use wai_config::app::App;
use wai_config::error::ConfigError;

fn main() -> Result<(), ConfigError> {
    let app = App::new()?;
    app.run()?;
    Ok(())
}
