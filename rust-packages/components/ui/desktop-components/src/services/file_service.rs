use crate::error::RsuiError;
use std::path::Path;

/// File service trait for file operations
pub trait FileService {
    fn read(&self, path: &Path) -> Result<String, RsuiError>;
    fn write(&self, path: &Path, content: &str) -> Result<(), RsuiError>;
    fn exists(&self, path: &Path) -> bool;
    fn delete(&self, path: &Path) -> Result<(), RsuiError>;
}

/// Default file service implementation
pub struct DefaultFileService;

impl FileService for DefaultFileService {
    fn read(&self, path: &Path) -> Result<String, RsuiError> {
        std::fs::read_to_string(path).map_err(|e| RsuiError::Io(e))
    }

    fn write(&self, path: &Path, content: &str) -> Result<(), RsuiError> {
        std::fs::write(path, content).map_err(|e| RsuiError::Io(e))
    }

    fn exists(&self, path: &Path) -> bool {
        path.exists()
    }

    fn delete(&self, path: &Path) -> Result<(), RsuiError> {
        std::fs::remove_file(path).map_err(|e| RsuiError::Io(e))
    }
}

impl Default for DefaultFileService {
    fn default() -> Self {
        Self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_file_service_read_write() {
        let service = DefaultFileService;
        let path = Path::new("test.txt");
        
        service.write(path, "test content").unwrap();
        assert!(service.exists(path));
        
        let content = service.read(path).unwrap();
        assert_eq!(content, "test content");
        
        service.delete(path).unwrap();
        assert!(!service.exists(path));
    }
}
