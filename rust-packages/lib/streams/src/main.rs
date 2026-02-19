use streaming::{telemetry, AppConfig, StreamingApp, StreamMessage};
use tracing::info;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    telemetry::init_subscriber();
    
    let config = AppConfig::load()?;
    info!("Streaming App started with config: {:?}", config);
    
    let app = StreamingApp::<String>::new(config)?;
    let producer = app.producer();
    let consumer = app.consumer();
    
    let message = StreamMessage::new("test_id", "test_data");
    producer.produce(message).await?;
    
    let received = consumer.consume().await?;
    if let Some(msg) = received {
        info!("Received message: {}", msg.id);
    }
    
    Ok(())
}
