use crate::{
    config::Config,
    error::{Result, WatcherError},
    event::{Event, EventKind, MetadataKind, ModifyKind, RenameKind},
    traits::Watcher,
};
use log::{debug, error};
use std::collections::HashMap;
use std::ffi::{OsStr, OsString};
use std::os::windows::ffi::{OsStrExt, OsStringExt};
use std::path::{Path, PathBuf};
use std::ptr;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::SystemTime;
use tokio::sync::mpsc::{self, Sender};
use winapi::shared::minwindef::{DWORD, FALSE};
use winapi::um::fileapi::{CreateFileW, ReadDirectoryChangesW};
use winapi::um::handleapi::{CloseHandle, INVALID_HANDLE_VALUE};
use winapi::um::minwinbase::OVERLAPPED;
use winapi::um::winbase::{FILE_FLAG_BACKUP_SEMANTICS, FILE_LIST_DIRECTORY};
use winapi::um::winnt::{
    FILE_ACTION_ADDED,
    FILE_ACTION_MODIFIED,
    FILE_ACTION_REMOVED,
    FILE_ACTION_RENAMED_NEW_NAME,
    FILE_ACTION_RENAMED_OLD_NAME,
    FILE_NOTIFY_CHANGE_ATTRIBUTES,
    FILE_NOTIFY_CHANGE_DIR_NAME,
    FILE_NOTIFY_CHANGE_FILE_NAME,
    FILE_NOTIFY_CHANGE_LAST_WRITE,
    FILE_NOTIFY_CHANGE_SIZE,
    FILE_SHARE_DELETE,
    FILE_SHARE_READ,
    FILE_SHARE_WRITE,
    OPEN_EXISTING,
};

const BUFFER_SIZE: usize = 4096;

/// A watcher that uses the Windows API for filesystem notifications.
pub struct NativeWindowsWatcher {
    config: Config,
    tx: Sender<Result<Event>>,
    watched_paths: Arc<Mutex<HashMap<PathBuf, winapi::shared::ntdef::HANDLE>>>,
    stop_tx: Option<mpsc::Sender<()>>,
}

#[async_trait::async_trait]
impl Backend for NativeWindowsWatcher {
    fn new(config: Config, tx: Sender<Result<Event>>) -> Result<Self> {
        Ok(Self {
            config,
            tx,
            watched_paths: Arc::new(Mutex::new(HashMap::new())),
            stop_tx: None,
        })
    }

    async fn watch(&mut self) -> Result<()> {
        let (stop_tx, mut stop_rx) = mpsc::channel(1);
        self.stop_tx = Some(stop_tx);

        let event_tx = self.tx.clone();
        let watched_paths = self.watched_paths.clone();
        let recursive = self.config.filtering.include.is_empty(); // Simplified recursive logic

        thread::spawn(move || {
            let mut buffers = HashMap::new();
            loop {
                if stop_rx.try_recv().is_ok() {
                    debug!("Stopping Windows native watcher thread.");
                    break;
                }

                let paths = watched_paths.lock().unwrap().clone();
                for (path, &handle) in &paths {
                    let buffer = buffers.entry(path.clone()).or_insert_with(|| vec![0u8; BUFFER_SIZE]);
                    let mut bytes_returned: DWORD = 0;

                    let success = unsafe {
                        ReadDirectoryChangesW(
                            handle,
                            buffer.as_mut_ptr() as *mut _,
                            buffer.len() as DWORD,
                            if recursive { 1 } else { 0 },
                            FILE_NOTIFY_CHANGE_FILE_NAME
                                | FILE_NOTIFY_CHANGE_DIR_NAME
                                | FILE_NOTIFY_CHANGE_ATTRIBUTES
                                | FILE_NOTIFY_CHANGE_SIZE
                                | FILE_NOTIFY_CHANGE_LAST_WRITE,
                            &mut bytes_returned,
                            ptr::null_mut::<OVERLAPPED>(),
                            None,
                        )
                    };

                    if success != FALSE && bytes_returned > 0 {
                        parse_event_buffer(path, buffer, &event_tx);
                    }
                }
                thread::sleep(std::time::Duration::from_millis(50)); // Prevent busy-looping
            }
        });

        Ok(())
    }

    fn unwatch(&mut self) -> Result<()> {
        if let Some(stop_tx) = self.stop_tx.take() {
            let _ = stop_tx.blocking_send(());
        }
        let mut paths = self.watched_paths.lock().unwrap();
        for (_, handle) in paths.drain() {
            unsafe { CloseHandle(handle) };
        }
        Ok(())
    }

    fn add_path(&mut self, path: &Path) -> Result<()> {
        let handle = open_directory_handle(path)?;
        self.watched_paths.lock().unwrap().insert(path.to_path_buf(), handle);
        Ok(())
    }

    fn remove_path(&mut self, path: &Path) -> Result<()> {
        if let Some(handle) = self.watched_paths.lock().unwrap().remove(path) {
            unsafe { CloseHandle(handle) };
        }
        Ok(())
    }

    fn configure(&mut self, config: Config) -> Result<()> {
        self.config = config;
        Ok(())
    }
}

fn open_directory_handle(path: &Path) -> Result<winapi::shared::ntdef::HANDLE> {
    let handle = unsafe {
        let path_ws: Vec<u16> = OsStr::new(path).encode_wide().chain(Some(0)).collect();
        CreateFileW(
            path_ws.as_ptr(),
            FILE_LIST_DIRECTORY,
            FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE,
            ptr::null_mut(),
            OPEN_EXISTING,
            FILE_FLAG_BACKUP_SEMANTICS,
            ptr::null_mut(),
        )
    };
    if handle == INVALID_HANDLE_VALUE {
        Err(WatcherError::Io(std::io::Error::last_os_error()))
    } else {
        Ok(handle)
    }
}

fn parse_event_buffer(root_path: &Path, buffer: &[u8], tx: &Sender<Result<Event>>) {
    let mut offset = 0;
    while offset < buffer.len() {
        let event_info = unsafe { &*(buffer.as_ptr().add(offset) as *const winapi::um::winnt::FILE_NOTIFY_INFORMATION) };

        let file_name_len = event_info.FileNameLength as usize / std::mem::size_of::<u16>();
        let file_name_slice = unsafe {
            std::slice::from_raw_parts(event_info.FileName.as_ptr(), file_name_len)
        };
        let file_name = OsString::from_wide(file_name_slice);
        let path = root_path.join(file_name);

        let kind = match event_info.Action {
            FILE_ACTION_ADDED => EventKind::Create,
            FILE_ACTION_REMOVED => EventKind::Remove,
            FILE_ACTION_MODIFIED => EventKind::Modify(ModifyKind::Any),
            FILE_ACTION_RENAMED_OLD_NAME => EventKind::Rename(RenameKind::From(path.clone())),
            FILE_ACTION_RENAMED_NEW_NAME => EventKind::Rename(RenameKind::To(path.clone())),
            _ => EventKind::Other,
        };

        let event = Event {
            kind,
            paths: vec![path],
            time: SystemTime::now(),
            metadata: None,
        };

        if tx.blocking_send(Ok(event)).is_err() {
            error!("Failed to send event from Windows native watcher thread.");
        }

        if event_info.NextEntryOffset == 0 {
            break;
        }
        offset += event_info.NextEntryOffset as usize;
    }
}
