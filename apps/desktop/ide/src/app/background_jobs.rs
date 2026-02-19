#[cfg(any())]
use std::panic;
#[cfg(any())]
use std::sync::mpsc;
#[cfg(any())]
use std::thread;

#[cfg(any())]
use crate::types::jobs::{JobRequest, JobResult};

#[cfg(any())]
pub struct JobRunner {
    tx: mpsc::Sender<JobRequest>,
    rx: mpsc::Receiver<JobResult>,
}

#[cfg(any())]
impl JobRunner {
    pub fn new() -> Self {
        let (tx, worker_rx) = mpsc::channel::<JobRequest>();
        let (worker_tx, rx) = mpsc::channel::<JobResult>();

        thread::spawn(move || worker_loop(worker_rx, worker_tx));

        Self { tx, rx }
    }

    pub fn sender(&self) -> mpsc::Sender<JobRequest> {
        self.tx.clone()
    }

    pub fn try_recv(&self) -> Option<JobResult> {
        self.rx.try_recv().ok()
    }
}

#[cfg(any())]
fn worker_loop(rx: mpsc::Receiver<JobRequest>, tx: mpsc::Sender<JobResult>) {
    while let Ok(req) = rx.recv() {
        let res = panic::catch_unwind(|| crate::services::jobs::process_request(req))
            .unwrap_or_else(|_| {
                Err(crate::error::AppError::InvalidInput(
                    "background worker panicked".to_string(),
                ))
            });

        let _ = match res {
            Ok(ok) => tx.send(ok),
            Err(e) => tx.send(JobResult::Error(e.to_string())),
        };
    }
}
