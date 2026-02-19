use std::path::{Path, PathBuf};

pub fn resolve_path(current_dir: &Path, path: &str) -> PathBuf {
    let mut new_path = if Path::new(path).is_absolute() {
        PathBuf::from("/")
    } else {
        current_dir.to_path_buf()
    };

    for component in Path::new(path).components() {
        match component {
            std::path::Component::Normal(name) => new_path.push(name),
            std::path::Component::ParentDir => {
                new_path.pop();
            }
            _ => {}
        }
    }
    new_path
}
