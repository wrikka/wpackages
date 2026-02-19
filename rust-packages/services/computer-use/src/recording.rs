use crate::error::{Error, Result};
use std::path::PathBuf;
use std::process::Command;
use tokio::sync::watch;
use tokio::time::{self, Duration, Instant};
use tracing::{error, info};

pub async fn recording_task(output_path: PathBuf, mut stop_rx: watch::Receiver<bool>) {
    let frame_rate = 10;
    let interval = Duration::from_millis(1000 / frame_rate);

    let temp_dir = match tempfile::Builder::new().prefix("computer-use-rec-").tempdir() {
        Ok(dir) => dir,
        Err(e) => {
            error!("Failed to create temp dir for recording: {}", e);
            return;
        }
    };

    info!("Starting recording, frames will be saved to: {:?}", temp_dir.path());

    let mut frame_count = 0;
    let mut ticker = time::interval(interval);

    loop {
        tokio::select! {
            _ = ticker.tick() => {
                let screen = match screenshots::Screen::all() {
                    Ok(mut screens) => screens.remove(0),
                    Err(e) => {
                        error!("Failed to get screen for recording frame: {}", e);
                        continue;
                    }
                };

                let frame_path = temp_dir.path().join(format!("frame_{:05}.png", frame_count));
                match screen.capture() {
                    Ok(img) => {
                        if let Err(e) = img.save(&frame_path) {
                            error!("Failed to save frame {:?}: {}", frame_path, e);
                        }
                        frame_count += 1;
                    }
                    Err(e) => {
                        error!("Failed to capture frame: {}", e);
                    }
                }
            }
            _ = stop_rx.changed() => {
                info!("Stop recording signal received.");
                break;
            }
        }
    }

    info!("Encoding video from {} frames...", frame_count);

    let input_pattern = temp_dir.path().join("frame_%05d.png");
    let output = Command::new("ffmpeg")
        .arg("-y") // Overwrite output file if it exists
        .arg("-framerate")
        .arg(frame_rate.to_string())
        .arg("-i")
        .arg(input_pattern)
        .arg("-c:v")
        .arg("libx264")
        .arg("-pix_fmt")
        .arg("yuv420p")
        .arg(&output_path)
        .output();

    match output {
        Ok(out) => {
            if out.status.success() {
                info!("Video saved successfully to {:?}", output_path);
            } else {
                error!(
                    "ffmpeg failed: {}\n{}",
                    String::from_utf8_lossy(&out.stdout),
                    String::from_utf8_lossy(&out.stderr)
                );
            }
        }
        Err(e) => {
            error!("Failed to run ffmpeg. Is it installed and in the PATH? Error: {}", e);
        }
    }

    if let Err(e) = temp_dir.close() {
        error!("Failed to clean up temp recording directory: {}", e);
    }
}
