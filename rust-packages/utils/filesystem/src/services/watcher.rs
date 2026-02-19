use crate::error::{FsError, FsResult};
use async_stream::stream;
use camino::{Utf8Path, Utf8PathBuf};
use futures_util::stream::Stream;
use notify::{
    event::ModifyKind, Event, EventKind, RecommendedWatcher, RecursiveMode,
    Watcher as NotifyWatcher,
};
use std::path::PathBuf;
use std::sync::mpsc;
use tokio::sync::mpsc as tokio_mpsc;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum WatchEvent {
    Create(Utf8PathBuf),
    Delete(Utf8PathBuf),
    Modify(Utf8PathBuf),
    Rename { from: Utf8PathBuf, to: Utf8PathBuf },
}

fn to_utf8_path_buf(path: PathBuf) -> FsResult<Utf8PathBuf> {
    Utf8PathBuf::from_path_buf(path).map_err(|p| {
        FsError::Other(std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            format!("Invalid UTF-8 path: {:?}", p),
        ))
    })
}

pub fn watch(
    path: impl AsRef<Utf8Path>,
    recursive: bool,
) -> FsResult<impl Stream<Item = FsResult<WatchEvent>>> {
    let path = path.as_ref().to_path_buf();
    let (tx, mut rx) = tokio_mpsc::channel::<FsResult<WatchEvent>>(16);

    std::thread::spawn(move || {
        let (sync_tx, sync_rx) = mpsc::channel();
        let mut watcher: RecommendedWatcher = match NotifyWatcher::new(
            move |res| {
                if let Err(e) = sync_tx.send(res) {
                    eprintln!("Error sending watch event: {}", e);
                }
            },
            notify::Config::default(),
        ) {
            Ok(w) => w,
            Err(e) => {
                let _ = tx.blocking_send(Err(e.into()));
                return;
            }
        };

        let mode = if recursive {
            RecursiveMode::Recursive
        } else {
            RecursiveMode::NonRecursive
        };

        if let Err(e) = watcher.watch(path.as_std_path(), mode) {
            let _ = tx.blocking_send(Err(e.into()));
            return;
        }

        for res in sync_rx {
            let event_result = match res {
                Ok(event) => translate_event(event),
                Err(e) => Some(Err(e.into())),
            };

            if let Some(res) = event_result {
                if tx.blocking_send(res).is_err() {
                    break;
                }
            }
        }
    });

    Ok(stream! {
        while let Some(event) = rx.recv().await {
            yield event;
        }
    })
}

fn translate_event(event: Event) -> Option<FsResult<WatchEvent>> {
    let paths: Vec<_> = event
        .paths
        .into_iter()
        .map(to_utf8_path_buf)
        .collect::<Result<_, _>>()
        .ok()?;

    let watch_event = match event.kind {
        EventKind::Create(_) => paths.into_iter().next().map(WatchEvent::Create),
        EventKind::Remove(_) => paths.into_iter().next().map(WatchEvent::Delete),
        EventKind::Modify(ModifyKind::Name(notify::event::RenameMode::Both)) => {
            if paths.len() == 2 {
                let mut iter = paths.into_iter();
                Some(WatchEvent::Rename {
                    from: iter.next().unwrap(),
                    to: iter.next().unwrap(),
                })
            } else {
                None
            }
        }
        EventKind::Modify(_) => paths.into_iter().next().map(WatchEvent::Modify),
        _ => None,
    };

    watch_event.map(Ok)
}
