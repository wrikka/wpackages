use watcher::{config::{Backend, Config}, event::{Event, EventKind, ModifyKind}, Watcher};
use std::fs::{self, File};
use std::io::Write;
use std::time::Duration;
use tempfile::tempdir;
use tokio::sync::mpsc;

async fn setup_watcher(config: Config) -> (tempfile::TempDir, Watcher, mpsc::Receiver<watcher::error::Result<Event>>) {
    let temp_dir = tempdir().unwrap();
    let (tx, rx) = mpsc::channel(100);
    let mut watcher = Watcher::new(config, tx).unwrap();
    watcher.add_path(temp_dir.path()).unwrap();

    tokio::spawn(async move {
        if let Err(e) = watcher.watch().await {
            eprintln!("Watcher error: {}", e);
        }
    });

    (temp_dir, watcher, rx)
}

#[tokio::test]
async fn test_poll_watcher_create() {
    let mut config = Config::default();
    config.backend = Backend::Polling;
    config.polling.interval = Duration::from_millis(50);
    config.debouncing.timeout = Duration::ZERO;

    let (temp_dir, _watcher, mut rx) = setup_watcher(config).await;
    let file_path = temp_dir.path().join("new_file.txt");

    File::create(&file_path).unwrap();

    let event = rx.recv().await.unwrap().unwrap();
    assert!(matches!(event.kind, EventKind::Create));
    assert_eq!(event.paths, vec![file_path]);
}

#[tokio::test]
async fn test_poll_watcher_modify() {
    let mut config = Config::default();
    config.backend = Backend::Polling;
    config.polling.interval = Duration::from_millis(50);
    config.debouncing.timeout = Duration::ZERO;

    let (temp_dir, _watcher, mut rx) = setup_watcher(config).await;
    let file_path = temp_dir.path().join("test_modify.txt");
    let mut file = File::create(&file_path).unwrap();
    
    // Clear initial create event
    rx.recv().await.unwrap().unwrap();

    writeln!(file, "Hello").unwrap();
    file.sync_all().unwrap();

    let event = rx.recv().await.unwrap().unwrap();
    assert!(matches!(event.kind, EventKind::Modify(ModifyKind::Content)));
    assert_eq!(event.paths, vec![file_path]);
}

#[tokio::test]
async fn test_poll_watcher_delete() {
    let mut config = Config::default();
    config.backend = Backend::Polling;
    config.polling.interval = Duration::from_millis(50);
    config.debouncing.timeout = Duration::ZERO;

    let (temp_dir, _watcher, mut rx) = setup_watcher(config).await;
    let file_path = temp_dir.path().join("test_delete.txt");
    File::create(&file_path).unwrap();

    // Clear initial create event
    rx.recv().await.unwrap().unwrap();

    fs::remove_file(&file_path).unwrap();

    let event = rx.recv().await.unwrap().unwrap();
    assert!(matches!(event.kind, EventKind::Remove));
    assert_eq!(event.paths, vec![file_path]);
}

#[tokio::test]
async fn test_poll_watcher_content_hash() {
    let mut config = Config::default();
    config.backend = Backend::Polling;
    config.polling.interval = Duration::from_millis(50);
    config.polling.compare_contents = true;
    config.debouncing.timeout = Duration::ZERO;

    let (temp_dir, _watcher, mut rx) = setup_watcher(config).await;
    let file_path = temp_dir.path().join("test_hash.txt");
    let mut file = File::create(&file_path).unwrap();
    writeln!(file, "initial").unwrap();
    file.sync_all().unwrap();

    // Clear initial create event
    rx.recv().await.unwrap().unwrap();

    // Modify content without changing modification time (tricky, but we can simulate)
    // For this test, a simple write is enough to trigger the hash check.
    writeln!(file, " new content").unwrap();
    file.sync_all().unwrap();

    let event = rx.recv().await.unwrap().unwrap();
    assert!(matches!(event.kind, EventKind::Modify(ModifyKind::Content)));
    assert_eq!(event.paths, vec![file_path]);
}
