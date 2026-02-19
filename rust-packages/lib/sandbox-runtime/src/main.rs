//! # Sandbox Runtime Binary Entry Point
//!
//! This file provides the `main` function to run the sandbox runtime as a standalone
//! command-line application, which is useful for testing and interactive sessions.

// Since the library's public API is in `lib.rs`, we need to refer to it.
use sandbox_runtime::app::runtime::AppRuntime;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Note: The telemetry subscriber for the binary target might need to be different
    // from the one in `lib.rs` which uses `tracing-web`.
    // For now, we proceed without initializing it in the binary.
    println!("Starting Sandbox Runtime...");

    let mut runtime = AppRuntime::new();

    // Example of running a command.
    // A full REPL (Read-Eval-Print Loop) would be implemented here.
    let command = "ls -l";
    println!("$ {}", command);
    match runtime.run_command(command) {
        Ok(output) => println!("{}", output),
        Err(e) => eprintln!("Error: {}", e),
    }

    Ok(())
}
