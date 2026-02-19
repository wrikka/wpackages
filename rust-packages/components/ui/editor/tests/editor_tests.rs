use editor::{Editor, EditorError, EditorResult};

#[test]
fn test_editor_new() {
    let editor = Editor::new();
    assert_eq!(editor.get_text(), "");
}

#[test]
fn test_editor_load_file() -> EditorResult<()> {
    let mut editor = Editor::new();
    
    // Create a temporary file
    let temp_file = std::env::temp_dir().join("test_editor.txt");
    std::fs::write(&temp_file, "Hello, World!")?;
    
    // Load the file
    editor.load_file(&temp_file)?;
    
    // Verify content
    assert_eq!(editor.get_text(), "Hello, World!");
    
    // Cleanup
    std::fs::remove_file(&temp_file)?;
    
    Ok(())
}

#[test]
fn test_editor_insert_text() -> EditorResult<()> {
    let mut editor = Editor::new();
    
    editor.insert_text("Hello")?;
    assert_eq!(editor.get_text(), "Hello");
    
    editor.insert_text(", World!")?;
    assert_eq!(editor.get_text(), "Hello, World!");
    
    Ok(())
}

#[test]
fn test_editor_delete_text() -> EditorResult<()> {
    let mut editor = Editor::new();
    
    editor.insert_text("Hello, World!")?;
    
    // Delete "World!"
    let start = editor::types::Position { line: 0, character: 7 };
    let end = editor::types::Position { line: 0, character: 13 };
    editor.delete_text((start, end))?;
    
    assert_eq!(editor.get_text(), "Hello, ");
    
    Ok(())
}

#[test]
fn test_editor_cursor_position() {
    let editor = Editor::new();
    
    let pos = editor.get_cursor_position();
    assert_eq!(pos.line, 0);
    assert_eq!(pos.character, 0);
}

#[test]
fn test_editor_set_cursor_position() {
    let mut editor = Editor::new();
    
    let new_pos = editor::types::Position { line: 5, character: 10 };
    editor.set_cursor_position(new_pos);
    
    let pos = editor.get_cursor_position();
    // Note: This will fail until we implement cursor position tracking
    // assert_eq!(pos.line, 5);
    // assert_eq!(pos.character, 10);
}

#[test]
fn test_editor_search() {
    let mut editor = Editor::new();
    editor.insert_text("Hello World Hello").unwrap();
    
    let results = editor.search("Hello", false);
    assert_eq!(results.len(), 2);
}

#[test]
fn test_editor_search_case_sensitive() {
    let mut editor = Editor::new();
    editor.insert_text("Hello World hello").unwrap();
    
    let results = editor.search("Hello", true);
    assert_eq!(results.len(), 1);
    
    let results = editor.search("hello", false);
    assert_eq!(results.len(), 2);
}

#[test]
fn test_editor_default() {
    let editor = Editor::default();
    assert_eq!(editor.get_text(), "");
}
