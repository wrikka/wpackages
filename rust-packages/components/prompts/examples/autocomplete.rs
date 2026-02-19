use prompt::completion::{PathCompletion, StaticCompletion};
use prompt::{auto_complete, text, Result};

#[tokio::main]
async fn main() -> Result<()> {
    println!("🔍 Auto-complete Demo\n");

    // Static completion
    println!("=== Static Completion ===");
    let languages = StaticCompletion::new(["Rust", "Python", "TypeScript", "Go", "C++", "Zig", "Haskell"]);

    let lang = text("Favorite programming language?")
        .with_completion(languages)
        .interact()
        .await?;
    println!("Selected: {}\n", lang);

    // Path completion
    println!("=== Path Completion ===");
    let path_completion = PathCompletion::new();

    let path = auto_complete("Select a file or directory:", path_completion)
        .await?;
    println!("Path: {}\n", path);

    // Directory-only completion
    println!("=== Directory-Only Completion ===");
    let dir_completion = PathCompletion::new().dirs_only();

    let dir = auto_complete("Select a directory:", dir_completion)
        .await?;
    println!("Directory: {}\n", dir);

    // File extension filter
    println!("=== File Extension Filter ===");
    let rs_completion = PathCompletion::new()
        .with_extensions(vec!["rs".to_string()]);

    let file = auto_complete("Select a Rust file:", rs_completion)
        .await?;
    println!("File: {}\n", file);

    // Fuzzy search demo (via text with completion)
    println!("=== Fuzzy Matching ===");
    let frameworks = StaticCompletion::new([
        "React", "Vue", "Svelte", "Angular", "Solid", "Qwik", "Preact",
        "Next.js", "Nuxt", "SvelteKit", "Astro", "Remix", "Gatsby"
    ]);

    let framework = text("Search frameworks:")
        .with_completion(frameworks)
        .interact()
        .await?;
    println!("Framework: {}", framework);

    println!("\n✨ Demo complete!");
    Ok(())
}
