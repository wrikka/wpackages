use crate::error::EditorError;
use crate::types::OpenFileTab;
use filesystem::AbsPath;
use tokio::fs;

#[derive(Clone)]
pub struct FileService;

impl Default for FileService {
    fn default() -> Self {
        Self::new()
    }
}

impl FileService {
    pub fn new() -> Self {
        Self
    }

    pub async fn save_file(&self, tab: &mut OpenFileTab) -> Result<(), EditorError> {
        fs::write(&tab.path, &tab.text).await?;
        tab.dirty = false;
        Ok(())
    }

    pub async fn open_file(&self, path: &AbsPath) -> Result<OpenFileTab, EditorError> {
        let text = fs::read_to_string(path).await?;
        let name = path
            .as_path()
            .file_name()
            .map(String::from)
            .unwrap_or_else(|| "Untitled".to_string());

        Ok(OpenFileTab {
            path: path.clone(),
            name,
            text,
            dirty: false,
        })
    }
}
