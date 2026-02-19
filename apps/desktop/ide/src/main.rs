#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use ide_lib::AppResult;

fn main() -> AppResult<()> {
    // Initialize the telemetry subscriber for logging and tracing.
    ide_lib::telemetry::init_subscriber();

    // Set a custom panic hook to provide more user-friendly error messages on crash.
    std::panic::set_hook(Box::new(|panic_info| {
        eprintln!("A critical error occurred: {}\n", panic_info);
    }));

    // Run the main application logic from the library crate.
    ide_lib::run()
}
