use camino::Utf8Path;

pub fn file_name_from_path(path: impl AsRef<Utf8Path>) -> String {
    let p = path.as_ref();
    p.file_name()
        .map(|s| s.to_string())
        .unwrap_or_else(|| p.to_string())
}

pub fn get_parent_dir(path: impl AsRef<Utf8Path>) -> Option<String> {
    path.as_ref().parent().map(|p| p.to_string())
}

pub fn join_paths(base: impl AsRef<Utf8Path>, part: impl AsRef<Utf8Path>) -> camino::Utf8PathBuf {
    base.as_ref().join(part.as_ref())
}
