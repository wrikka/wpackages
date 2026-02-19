use anyhow::{Context, Result};
use std::fs;
use std::path::Path;

pub fn copy_file(src: &Path, dst: &Path) -> Result<()> {
    if src.is_dir() {
        copy_directory(src, dst)
    } else {
        fs::copy(src, dst)
            .with_context(|| format!("Failed to copy file: {:?} to {:?}", src, dst))?;
        Ok(())
    }
}

pub fn copy_directory(src: &Path, dst: &Path) -> Result<()> {
    fs::create_dir_all(dst)
        .with_context(|| format!("Failed to create directory: {:?}", dst))?;
    
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());
        
        if src_path.is_dir() {
            copy_directory(&src_path, &dst_path)?;
        } else {
            fs::copy(&src_path, &dst_path)?;
        }
    }
    
    Ok(())
}

pub fn move_file(src: &Path, dst: &Path) -> Result<()> {
    if src.is_dir() {
        move_directory(src, dst)
    } else {
        fs::rename(src, dst)
            .with_context(|| format!("Failed to move file: {:?} to {:?}", src, dst))?;
        Ok(())
    }
}

pub fn move_directory(src: &Path, dst: &Path) -> Result<()> {
    copy_directory(src, dst)?;
    fs::remove_dir_all(src)
        .with_context(|| format!("Failed to remove directory: {:?}", src))?;
    Ok(())
}

pub fn delete_file(path: &Path) -> Result<()> {
    if path.is_dir() {
        fs::remove_dir_all(path)
            .with_context(|| format!("Failed to remove directory: {:?}", path))?;
    } else {
        fs::remove_file(path)
            .with_context(|| format!("Failed to remove file: {:?}", path))?;
    }
    Ok(())
}

pub fn rename_file(src: &Path, new_name: &str) -> Result<()> {
    let dst = src.parent()
        .ok_or_else(|| anyhow::anyhow!("Invalid path"))?
        .join(new_name);
    
    fs::rename(src, &dst)
        .with_context(|| format!("Failed to rename: {:?} to {:?}", src, dst))?;
    Ok(())
}
