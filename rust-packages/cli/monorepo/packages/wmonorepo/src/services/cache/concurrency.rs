use std::thread;

pub fn adaptive_concurrency(base: Option<usize>) -> usize {
    if let Some(concurrency) = base {
        if concurrency > 0 {
            return concurrency;
        }
    }

    let cpu_cores = thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(1);

    // Get available memory (in bytes)
    #[cfg(unix)]
    let memory_available = {
        use std::fs;
        fs::read_to_string("/proc/meminfo")
            .ok()
            .and_then(|s| {
                s.lines()
                    .find(|line| line.starts_with("MemAvailable:"))
                    .and_then(|line| {
                        line.split_whitespace()
                            .nth(2)
                            .and_then(|s| s.parse::<u64>().ok())
                    })
            })
            .unwrap_or(1_000_000_000)
    };

    #[cfg(windows)]
    let memory_available = {
        use std::mem;
        // Fallback to 1GB on Windows
        1_000_000_000
    };

    // Adjust concurrency based on memory pressure
    // < 1GB available: use half cores
    // < 500MB available: use quarter cores
    if memory_available < 500_000_000 {
        cpu_cores / 4
    } else if memory_available < 1_000_000_000 {
        cpu_cores / 2
    } else {
        cpu_cores
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_adaptive_concurrency_base() {
        let result = adaptive_concurrency(Some(4));
        assert_eq!(result, 4);
    }

    #[test]
    fn test_adaptive_concurrency_zero() {
        let result = adaptive_concurrency(Some(0));
        assert!(result > 0);
    }

    #[test]
    fn test_adaptive_concurrency_none() {
        let result = adaptive_concurrency(None);
        assert!(result > 0);
    }
}
