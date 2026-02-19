pub trait WorkflowService {
    fn load_workflows(&self) -> Vec<String>;
}

pub struct FsWorkflowService;

impl FsWorkflowService {
    pub fn new() -> Self {
        Self
    }
}

impl Default for FsWorkflowService {
    fn default() -> Self {
        Self::new()
    }
}

impl WorkflowService for FsWorkflowService {
    fn load_workflows(&self) -> Vec<String> {
        let Ok(dir) = std::env::var("GLOBAL_WORKFLOWS") else {
            return Vec::new();
        };
        let mut out = Vec::new();

        if let Ok(rd) = std::fs::read_dir(dir) {
            for e in rd.flatten() {
                let p = e.path();
                if p.extension().and_then(|s| s.to_str()) != Some("md") {
                    continue;
                }

                if let Some(stem) = p.file_stem().and_then(|s| s.to_str()) {
                    out.push(stem.to_string());
                }
            }
        }

        out.sort();
        out
    }
}
