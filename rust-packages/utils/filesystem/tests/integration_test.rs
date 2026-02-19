use assert_fs::prelude::*;
use assert_fs::TempDir;
use camino::Utf8PathBuf;
use filesystem::operations::{self as fs_ops, *};
use filesystem::paths;
use predicates::prelude::*;

#[tokio::test]
async fn test_create_and_write_text_file() {
    let temp = TempDir::new().unwrap();
    let file_path = temp.child("test.txt");
    let file_path_utf8 = Utf8PathBuf::from_path_buf(file_path.path().to_path_buf()).unwrap();

    fs_ops::create_file(&file_path_utf8).await.unwrap();
    file_path.assert(predicate::path::is_file());

    let content = "Hello, world!";
    fs_ops::write_text_file(&file_path_utf8, content)
        .await
        .unwrap();
    file_path.assert(content);

    let read_content = fs_ops::read_text_file(&file_path_utf8).await.unwrap();
    assert_eq!(content, read_content);
}

#[tokio::test]
async fn test_delete_file() {
    let temp = TempDir::new().unwrap();
    let file_path = temp.child("test.txt");
    file_path.touch().unwrap();
    let file_path_utf8 = Utf8PathBuf::from_path_buf(file_path.path().to_path_buf()).unwrap();

    fs_ops::remove_file(&file_path_utf8).await.unwrap();
    file_path.assert(predicate::path::missing());
}

#[tokio::test]
async fn test_create_and_delete_dir() {
    let temp = TempDir::new().unwrap();
    let dir_path = temp.child("test_dir");
    let dir_path_utf8 = Utf8PathBuf::from_path_buf(dir_path.path().to_path_buf()).unwrap();

    fs_ops::create_dir_all(&dir_path_utf8).await.unwrap();
    dir_path.assert(predicate::path::is_dir());

    fs_ops::remove_dir_all(&dir_path_utf8).await.unwrap();
    dir_path.assert(predicate::path::missing());
}

#[tokio::test]
async fn test_path_exists() {
    let temp = TempDir::new().unwrap();
    let file_path = temp.child("test.txt");
    let file_path_utf8 = Utf8PathBuf::from_path_buf(file_path.path().to_path_buf()).unwrap();

    assert!(!fs_ops::path_exists(&file_path_utf8).await);
    file_path.touch().unwrap();
    assert!(fs_ops::path_exists(&file_path_utf8).await);
}

#[tokio::test]
async fn test_copy_and_move_file() {
    let temp = TempDir::new().unwrap();
    let file1 = temp.child("file1.txt");
    let file2 = temp.child("file2.txt");
    let file3 = temp.child("file3.txt");

    let file1_utf8 = Utf8PathBuf::from_path_buf(file1.path().to_path_buf()).unwrap();
    let file2_utf8 = Utf8PathBuf::from_path_buf(file2.path().to_path_buf()).unwrap();
    let file3_utf8 = Utf8PathBuf::from_path_buf(file3.path().to_path_buf()).unwrap();

    file1.write_str("content").unwrap();

    fs_ops::copy_file(&file1_utf8, &file2_utf8).await.unwrap();
    file2.assert("content");

    fs_ops::rename(&file2_utf8, &file3_utf8).await.unwrap();
    file2.assert(predicate::path::missing());
    file3.assert("content");
}

#[tokio::test]
async fn test_binary_files() {
    let temp = TempDir::new().unwrap();
    let file_path = temp.child("test.bin");
    let file_path_utf8 = Utf8PathBuf::from_path_buf(file_path.path().to_path_buf()).unwrap();
    let content = vec![0, 1, 2, 3, 4, 5];

    fs_ops::write_binary_file(&file_path_utf8, &content)
        .await
        .unwrap();
    let read_content = fs_ops::read_binary_file(&file_path_utf8).await.unwrap();
    assert_eq!(content, read_content);
}

#[test]
fn test_path_manipulation() {
    let parent = paths::get_parent_dir("/a/b/c.txt").unwrap();
    assert_eq!(parent, "/a/b");

    let joined = paths::join_paths("/a/b", "c.txt");
    let expected = camino::Utf8Path::new("/a/b").join("c.txt");
    assert_eq!(joined, expected);
}

#[tokio::test]
async fn test_list_files() {
    let temp = TempDir::new().unwrap();
    temp.child("a.txt").touch().unwrap();
    temp.child("b").create_dir_all().unwrap();
    temp.child("b/c.txt").touch().unwrap();
    let temp_path_utf8 = Utf8PathBuf::from_path_buf(temp.path().to_path_buf()).unwrap();

    let files = fs_ops::list_files(&temp_path_utf8, 1).await.unwrap();
    assert_eq!(files.len(), 2);
    assert_eq!(files[0].name, "b");
    assert_eq!(files[1].name, "a.txt");
}
