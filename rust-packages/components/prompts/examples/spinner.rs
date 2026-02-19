use prompt::{Spinner, ProgressBar, TaskGroup, Result, Theme};
use std::time::Duration;

#[tokio::main]
async fn main() -> Result<()> {
    println!("🔄 Spinner & Progress Demo\n");

    // Simple spinner
    println!("=== Simple Spinner ===");
    let mut spinner = Spinner::new("Loading configuration...");
    spinner.start().await?;
    
    tokio::time::sleep(Duration::from_secs(1)).await;
    
    spinner.message("Parsing data...").await;
    tokio::time::sleep(Duration::from_secs(1)).await;
    
    spinner.stop("Configuration loaded!").await?;

    // Error spinner
    println!("\n=== Error State ===");
    let mut spinner = Spinner::new("Connecting to server...");
    spinner.start().await?;
    
    tokio::time::sleep(Duration::from_secs(1)).await;
    
    spinner.error("Connection failed!").await?;

    // Progress bar
    println!("\n=== Progress Bar ===");
    let progress = ProgressBar::new(100)
        .with_message("Downloading files...");
    
    for i in 0..=100 {
        progress.set_position(i).await;
        tokio::time::sleep(Duration::from_millis(20)).await;
    }
    
    progress.finish_with_message("Download complete!").await;

    // Task group
    println!("\n=== Task Group ===");
    let mut tasks = TaskGroup::new()
        .add_task("Initialize database")
        .add_task("Run migrations")
        .add_task("Seed data")
        .add_task("Start server");

    tasks.render();

    // Simulate task completion
    tokio::time::sleep(Duration::from_millis(500)).await;
    tasks.set_status(0, prompt::spinner::TaskStatus::Success);
    tasks.render();

    tokio::time::sleep(Duration::from_millis(500)).await;
    tasks.set_status(1, prompt::spinner::TaskStatus::Running);
    tasks.render();

    tokio::time::sleep(Duration::from_millis(500)).await;
    tasks.set_status(1, prompt::spinner::TaskStatus::Success);
    tasks.set_status(2, prompt::spinner::TaskStatus::Success);
    tasks.render();

    tokio::time::sleep(Duration::from_millis(500)).await;
    tasks.set_status(3, prompt::spinner::TaskStatus::Success);
    tasks.render();

    // Custom spinner frames
    println!("\n=== Custom Spinner ===");
    let frames = &["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"];
    let mut spinner = Spinner::new("Custom animation...")
        .with_frames(frames)
        .with_delay(Duration::from_millis(50));
    
    spinner.start().await?;
    tokio::time::sleep(Duration::from_secs(2)).await;
    spinner.stop("Done!").await?;

    println!("\n✨ Demo complete!");
    Ok(())
}
