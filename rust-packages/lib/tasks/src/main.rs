use task::telemetry::init_subscriber;
use task::Config;

#[tokio::main]
async fn main() -> task::Result<()> {
    init_subscriber();

    let config = Config::load()?;
    println!("Task CLI initialized with config: {:#?}", config);

    Ok(())
}
