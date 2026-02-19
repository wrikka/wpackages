use std::time::Duration;

use tokio::sync::mpsc;

use wpty::{PtyConfig, PtySession};

#[tokio::test]
async fn pty_smoke_spawn_output_exit() {
    let (data_tx, mut data_rx) = mpsc::channel::<Vec<u8>>(16);

    let (command, args) = if cfg!(windows) {
        (
            "cmd".to_string(),
            vec!["/C".to_string(), "echo".to_string(), "hello".to_string()],
        )
    } else {
        (
            "sh".to_string(),
            vec!["-c".to_string(), "echo hello".to_string()],
        )
    };

    let config = PtyConfig {
        command,
        args,
        cwd: None,
        initial_command: None,
        rows: 24,
        cols: 80,
    };

    let session = PtySession::spawn(&config, data_tx, |_title| {})
        .await
        .unwrap();

    let data = tokio::time::timeout(Duration::from_secs(5), data_rx.recv())
        .await
        .unwrap();
    assert!(data.is_some());

    let event = tokio::time::timeout(Duration::from_secs(5), session.wait_exit())
        .await
        .unwrap();
    let event = event.unwrap();

    assert_eq!(event.exit_code, 0);
}
