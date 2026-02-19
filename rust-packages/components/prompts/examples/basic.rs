use prompt::{confirm, multi_select, password, select, text, Result, Spinner, Theme};

#[tokio::main]
async fn main() -> Result<()> {
    println!("🎉 Welcome to Prompt Demo!\n");

    // Text input with validation
    let name = text("What's your name?")
        .placeholder("Anonymous")
        .validate(|v| !v.is_empty() && v.len() >= 2)
        .interact()
        .await?;

    println!("Hello, {}!\n", name);

    // Password input
    let _pass = password("Enter a password (demo only)")
        .interact()
        .await?;

    // Confirm
    let likes_rust = confirm("Do you like Rust?")
        .default(true)
        .interact()
        .await?;

    if likes_rust {
        println!("Great choice! 🦀\n");
    }

    // Select
    let lang = select(
        "Which is your favorite systems language?",
        ["Rust", "C", "C++", "Go", "Zig"],
    )
    .interact()
    .await?;

    println!("You selected: {}\n", lang);

    // Multi-select
    let features = multi_select(
        "What features do you need?",
        ["Async", "Validation", "History", "Themes", "Forms"],
    )
    .interact()
    .await?;

    println!("Selected features: {:?}\n", features);

    // Spinner demo
    let mut spinner = Spinner::new("Loading data...").with_theme(Theme::default());
    spinner.start().await?;

    // Simulate work
    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;

    spinner.stop("Data loaded successfully!").await?;

    // Number input
    let age: f64 = prompt::number("How old are you?").interact().await?;
    println!("Age: {}\n", age);

    println!("✨ Demo complete!");

    Ok(())
}
