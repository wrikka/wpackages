mod file_operations;

use anyhow::{Context, Result};
use crossterm::{
    event::{self, Event, KeyCode, KeyEventKind, KeyModifiers},
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use crossterm::{
    event::{self, Event, KeyCode, KeyEventKind, KeyModifiers},
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::{
    backend::CrosstermBackend,
    layout::{Alignment, Constraint, Direction, Layout, Rect},
    style::{Color, Modifier, Style},
    text::{Line, Span, Text},
    widgets::{Block, Borders, List, ListItem, Paragraph, Wrap},
    Frame, Terminal,
};
use std::{
    collections::BTreeMap,
    fs,
    io::{self, Stdout},
    path::{Path, PathBuf},
};
use syntect::{
    highlighting::{Theme, ThemeSet},
    parsing::{SyntaxReference, SyntaxSet},
};
use unicode_width::UnicodeWidthStr;

use file_operations::{copy_file, move_file, delete_file, rename_file};

struct AppState {
    current_path: PathBuf,
    files: Vec<FileItem>,
    selected_index: usize,
    search_query: String,
    search_mode: bool,
    preview_content: PreviewContent,
    syntax_set: SyntaxSet,
    theme: Theme,
    visual_mode: bool,
    visual_start_index: usize,
    selected_files: std::collections::HashSet<usize>,
    history: Vec<PathBuf>,
    history_index: usize,
    bookmarks: Vec<PathBuf>,
    command_mode: bool,
    command_query: String,
    operation_mode: Option<OperationMode>,
    tabs: Vec<Tab>,
    active_tab_index: usize,
}

#[derive(Clone, Debug)]
struct FileItem {
    path: PathBuf,
    name: String,
    is_dir: bool,
    size: u64,
    file_type: FileType,
}

#[derive(Clone, Debug, PartialEq)]
enum FileType {
    Directory,
    Image,
    Video,
    Audio,
    Document,
    Code,
    Archive,
    Text,
    Binary,
    Config,
    Data,
    Other,
}

fn get_file_type(path: &Path, name: &str, is_dir: bool) -> FileType {
    if is_dir {
        return FileType::Directory;
    }
    
    let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("").to_lowercase();
    
    match ext.as_str() {
        // Images
        "jpg" | "jpeg" | "png" | "gif" | "bmp" | "webp" | "svg" | "ico" => FileType::Image,
        // Videos
        "mp4" | "avi" | "mkv" | "mov" | "webm" | "flv" | "wmv" => FileType::Video,
        // Audio
        "mp3" | "wav" | "flac" | "aac" | "ogg" | "m4a" => FileType::Audio,
        // Documents
        "pdf" | "doc" | "docx" | "xls" | "xlsx" | "ppt" | "pptx" | "odt" | "ods" | "odp" => FileType::Document,
        // Archives
        "zip" | "rar" | "7z" | "tar" | "gz" | "bz2" => FileType::Archive,
        // Config
        "toml" | "yaml" | "yml" | "json" | "ini" | "cfg" | "conf" => FileType::Config,
        // Data
        "csv" | "tsv" | "xml" | "sql" | "db" | "sqlite" => FileType::Data,
        // Code
        "rs" | "py" | "js" | "ts" | "jsx" | "tsx" | "go" | "c" | "cpp" | "h" | "hpp" | "java" | "kt" | "swift" | "rb" | "php" | "sh" | "bash" | "zsh" | "lua" | "r" | "scala" | "cs" => FileType::Code,
        // Text
        "txt" | "md" | "rst" | "log" => FileType::Text,
        _ => FileType::Other,
    }
}

fn get_file_icon(file_type: &FileType) -> &'static str {
    match file_type {
        FileType::Directory => "📁",
        FileType::Image => "🖼️",
        FileType::Video => "🎬",
        FileType::Audio => "🎵",
        FileType::Document => "📄",
        FileType::Code => "💻",
        FileType::Archive => "📦",
        FileType::Text => "📝",
        FileType::Config => "⚙️",
        FileType::Data => "📊",
        FileType::Binary => "🔧",
        FileType::Other => "📎",
    }
}

fn get_file_color(file_type: &FileType) -> Color {
    match file_type {
        FileType::Directory => Color::Yellow,
        FileType::Image => Color::Magenta,
        FileType::Video => Color::Red,
        FileType::Audio => Color::Green,
        FileType::Document => Color::Cyan,
        FileType::Code => Color::Blue,
        FileType::Archive => Color::Rgb(255, 165, 0), // Orange
        FileType::Text => Color::White,
        FileType::Config => Color::Rgb(255, 255, 0), // Yellow
        FileType::Data => Color::Rgb(0, 255, 255), // Cyan
        FileType::Binary => Color::Rgb(128, 128, 128), // Gray
        FileType::Other => Color::White,
    }
}

#[derive(Clone)]
enum PreviewContent {
    Empty,
    Text(String),
    Directory(Vec<String>),
    Binary,
    TooLarge,
    Error(String),
}

fn main() -> Result<()> {
    let args: Vec<String> = std::env::args().collect();
    let start_path = if args.len() > 1 {
        PathBuf::from(&args[1])
    } else {
        std::env::current_dir()?
    };

    let syntax_set = SyntaxSet::load_defaults_newlines();
    let theme = ThemeSet::get_theme(&ThemeSet::all_themes()[0].path)?;

    let mut app = AppState {
        current_path: start_path.clone(),
        files: Vec::new(),
        selected_index: 0,
        search_query: String::new(),
        search_mode: false,
        preview_content: PreviewContent::Empty,
        syntax_set,
        theme,
        visual_mode: false,
        visual_start_index: 0,
        selected_files: std::collections::HashSet::new(),
        history: vec![start_path.clone()],
        history_index: 0,
        bookmarks: Vec::new(),
        command_mode: false,
        command_query: String::new(),
        operation_mode: None,
        tabs: vec![Tab {
            path: start_path.clone(),
            selected_index: 0,
        }],
        active_tab_index: 0,
    };

    app.load_files()?;

    let mut terminal = setup_terminal()?;

    let result = run_app(&mut terminal, &mut app);

    restore_terminal(terminal)?;

    result
}

fn setup_terminal() -> Result<Terminal<CrosstermBackend<Stdout>>> {
    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen)?;
    let backend = CrosstermBackend::new(stdout);
    let terminal = Terminal::new(backend)?;
    Ok(terminal)
}

fn restore_terminal(mut terminal: Terminal<CrosstermBackend<Stdout>>) -> Result<()> {
    disable_raw_mode()?;
    execute!(terminal.backend_mut(), LeaveAlternateScreen)?;
    terminal.show_cursor()?;
    Ok(())
}

fn run_app(
    terminal: &mut Terminal<CrosstermBackend<Stdout>>,
    app: &mut AppState,
) -> Result<()> {
    loop {
        terminal.draw(|f| ui(f, app))?;

        if let Event::Key(key) = event::read()? {
            if key.kind == KeyEventKind::Press {
                if app.search_mode {
                    handle_search_input(key, app)?;
                } else {
                    if handle_normal_input(key, app)? {
                        break;
                    }
                }
            }
        }
    }
}

fn handle_normal_input(key: crossterm::event::KeyEvent, app: &mut AppState) -> Result<bool> {
    match key.code {
        KeyCode::Char('q') | KeyCode::Esc => {
            if app.visual_mode {
                app.exit_visual_mode();
                return Ok(false);
            }
            return Ok(true);
        }
        KeyCode::Char('v') => {
            app.enter_visual_mode();
        }
        KeyCode::Char('j') | KeyCode::Down => {
            if app.visual_mode {
                app.visual_select_down();
            } else if app.selected_index < app.files.len().saturating_sub(1) {
                app.selected_index += 1;
                app.update_preview();
            }
        }
        KeyCode::Char('k') | KeyCode::Up => {
            if app.visual_mode {
                app.visual_select_up();
            } else if app.selected_index > 0 {
                app.selected_index -= 1;
                app.update_preview();
            }
        }

fn handle_search_input(key: crossterm::event::KeyEvent, app: &mut AppState) -> Result<()> {
    match key.code {
        KeyCode::Enter | KeyCode::Esc => {
            app.search_mode = false;
            if !app.search_query.is_empty() {
                app.filter_files();
            }
        }
        KeyCode::Char(c) => {
            app.search_query.push(c);
            app.filter_files();
        }
        KeyCode::Backspace => {
            app.search_query.pop();
            app.filter_files();
        }
        _ => {}
    }
    Ok(())
}

fn handle_normal_input(key: crossterm::event::KeyEvent, app: &mut AppState) -> Result<bool> {
    match key.code {
        KeyCode::Char('q') | KeyCode::Esc => {
            if app.visual_mode {
                app.exit_visual_mode();
                return Ok(false);
            }
            return Ok(true);
        }
        KeyCode::Char('v') => {
            app.enter_visual_mode();
        }
        KeyCode::Char('j') | KeyCode::Down => {
            if app.visual_mode {
                app.visual_select_down();
            } else if app.selected_index < app.files.len().saturating_sub(1) {
                app.selected_index += 1;
                app.update_preview();
            }
        }
        KeyCode::Char('k') | KeyCode::Up => {
            if app.visual_mode {
                app.visual_select_up();
            } else if app.selected_index > 0 {
                app.selected_index -= 1;
                app.update_preview();
            }
        }
        KeyCode::Char('l') | KeyCode::Enter | KeyCode::Right => {
            if let Some(op) = &app.operation_mode {
                match op {
                    OperationMode::Copy => {
                        let _ = app.execute_copy_operation();
                    }
                    OperationMode::Move => {
                        let _ = app.execute_move_operation();
                    }
                    OperationMode::Delete => {
                        let _ = app.execute_delete_operation();
                    }
                    OperationMode::Rename => {
                        let _ = app.execute_rename_operation();
                    }
                }
            } else if let Some(item) = app.files.get(app.selected_index) {
                if item.is_dir {
                    app.enter_directory(&item.path)?;
                }
            }
        }
        KeyCode::Char('h') | KeyCode::Backspace | KeyCode::Left => {
            app.enter_parent_directory()?;
        }
        KeyCode::Char('/') => {
            app.search_mode = true;
            app.search_query.clear();
        }
        KeyCode::Char('g') => {
            if key.modifiers.contains(KeyModifiers::CONTROL) {
                app.selected_index = 0;
                app.update_preview();
            }
        }
        KeyCode::Char('G') => {
            if key.modifiers.contains(KeyModifiers::SHIFT) {
                app.selected_index = app.files.len().saturating_sub(1);
                app.update_preview();
            }
        }
        KeyCode::Char('b') => {
            if key.modifiers.contains(KeyModifiers::CONTROL) {
                app.go_back();
            }
        }
        KeyCode::Char('f') => {
            if key.modifiers.contains(KeyModifiers::CONTROL) {
                app.go_forward();
            }
        }
        KeyCode::Char('m') => {
            app.toggle_bookmark();
        }
        KeyCode::Char('B') => {
            if key.modifiers.contains(KeyModifiers::SHIFT) {
                app.show_bookmarks();
            }
        }
        KeyCode::Char(':') => {
            app.command_mode = true;
            app.command_query.clear();
        }
        KeyCode::Char('c') => {
            if key.modifiers.contains(KeyModifiers::CONTROL) {
                app.start_copy_operation();
            }
        }
        KeyCode::Char('x') => {
            if key.modifiers.contains(KeyModifiers::CONTROL) {
                app.start_move_operation();
            }
        }
        KeyCode::Char('d') => {
            if key.modifiers.contains(KeyModifiers::CONTROL) {
                app.start_delete_operation();
            }
        }
        KeyCode::Char('r') => {
            if key.modifiers.contains(KeyModifiers::CONTROL) {
                app.start_rename_operation();
            }
        }
        KeyCode::Esc => {
            if app.operation_mode.is_some() {
                app.operation_mode = None;
            } else if app.visual_mode {
                app.exit_visual_mode();
            } else {
                return Ok(true);
            }
        }
        _ => {}
    }
    Ok(false)
}

impl AppState {
    // ... (rest of the code remains the same)

    fn start_copy_operation(&mut self) {
        self.operation_mode = Some(OperationMode::Copy);
    }

    fn start_move_operation(&mut self) {
        self.operation_mode = Some(OperationMode::Move);
    }

    fn start_delete_operation(&mut self) {
        self.operation_mode = Some(OperationMode::Delete);
    }

    fn start_rename_operation(&mut self) {
        self.operation_mode = Some(OperationMode::Rename);
    }

    fn execute_copy_operation(&mut self) -> Result<()> {
        if let Some(item) = self.files.get(self.selected_index) {
            let dst = self.current_path.join(format!("{}_copy", item.name));
            copy_file(&item.path, &dst)?;
        }
        self.operation_mode = None;
        Ok(())
    }

    fn execute_move_operation(&mut self) -> Result<()> {
        if let Some(item) = self.files.get(self.selected_index) {
            let dst = self.current_path.join(format!("{}_moved", item.name));
            move_file(&item.path, &dst)?;
        }
        self.operation_mode = None;
        Ok(())
    }

    fn execute_delete_operation(&mut self) -> Result<()> {
        if let Some(item) = self.files.get(self.selected_index) {
            delete_file(&item.path)?;
            let _ = self.load_files();
        }
        self.operation_mode = None;
        Ok(())
    }

    fn execute_rename_operation(&mut self) -> Result<()> {
        if let Some(item) = self.files.get(self.selected_index) {
            let new_name = format!("{}_renamed", item.name);
            rename_file(&item.path, &new_name)?;
            let _ = self.load_files();
        }
        self.operation_mode = None;
        Ok(())
    }

    fn execute_command(&mut self) {
        let cmd = self.command_query.trim().to_lowercase();
        match cmd.as_str() {
            "q" | "quit" => {
                std::process::exit(0);
            }
            "help" => {
                // Show help
            }
            _ => {}
        }
    }

    fn new_tab(&mut self) {
        self.tabs.push(Tab {
            path: self.current_path.clone(),
            selected_index: self.selected_index,
        });
        self.active_tab_index = self.tabs.len() - 1;
    }

    fn close_tab(&mut self) {
        if self.tabs.len() > 1 {
            self.tabs.remove(self.active_tab_index);
            if self.active_tab_index >= self.tabs.len() {
                self.active_tab_index = self.tabs.len() - 1;
            }
            let tab = &self.tabs[self.active_tab_index];
            self.current_path = tab.path.clone();
            self.selected_index = tab.selected_index;
            let _ = self.load_files();
        }
    }

    fn switch_tab(&mut self, index: usize) {
        if index < self.tabs.len() {
            // Save current tab state
            if let Some(tab) = self.tabs.get_mut(self.active_tab_index) {
                tab.path = self.current_path.clone();
                tab.selected_index = self.selected_index;
            }
            // Switch to new tab
            self.active_tab_index = index;
            let tab = &self.tabs[self.active_tab_index];
            self.current_path = tab.path.clone();
            self.selected_index = tab.selected_index;
            let _ = self.load_files();
        }
    }

    fn next_tab(&mut self) {
        let next_index = (self.active_tab_index + 1) % self.tabs.len();
        self.switch_tab(next_index);
    }

    fn prev_tab(&mut self) {
        let prev_index = if self.active_tab_index == 0 {
            self.tabs.len() - 1
        } else {
            self.active_tab_index - 1
        };
        self.switch_tab(prev_index);
    }

    fn fuzzy_search(&mut self, query: &str) {
        if query.is_empty() {
            let _ = self.load_files();
            return;
        }

        let query_lower = query.to_lowercase();
        let mut scored_files: Vec<(usize, usize)> = self
            .files
            .iter()
            .enumerate()
            .map(|(i, file)| {
                let name_lower = file.name.to_lowercase();
                let score = fuzzy_match(&name_lower, &query_lower);
                (i, score)
            })
            .filter(|(_, score)| *score > 0)
            .collect();

        scored_files.sort_by(|a, b| b.1.cmp(&a.1));

        if scored_files.is_empty() {
            self.files.clear();
        } else {
            let mut new_files = Vec::new();
            for (index, _) in scored_files {
                if let Some(file) = self.files.get(index) {
                    new_files.push(file.clone());
                }
            }
            self.files = new_files;
        }

        self.selected_index = self.selected_index.min(self.files.len().saturating_sub(1));
        self.update_preview();
    }

    fn filter_files(&mut self) {
        if self.search_query.is_empty() {
            let _ = self.load_files();
            return;
        }

        self.fuzzy_search(&self.search_query);
    }
}

fn fuzzy_match(text: &str, pattern: &str) -> usize {
    let mut text_chars = text.chars().peekable();
    let mut pattern_chars = pattern.chars().peekable();
    let mut score = 0;
    let mut consecutive = 0;

    while let Some(p) = pattern_chars.next() {
        let mut found = false;
        while let Some(&t) = text_chars.peek() {
            if t == p {
                found = true;
                text_chars.next();
                consecutive += 1;
                score += consecutive * 10;
                break;
            } else {
                text_chars.next();
                consecutive = 0;
            }
        }
        if !found {
            return 0;
        }
    }

    score
}

fn render_status_bar(f: &mut Frame, area: Rect, app: &AppState) {
    let selected_info = if let Some(item) = app.files.get(app.selected_index) {
        let item_type = match item.file_type {
            FileType::Directory => "DIR",
            FileType::Image => "IMG",
            FileType::Video => "VID",
            FileType::Audio => "AUD",
            FileType::Document => "DOC",
            FileType::Code => "CODE",
            FileType::Archive => "ARCH",
            FileType::Text => "TXT",
            FileType::Config => "CFG",
            FileType::Data => "DATA",
            FileType::Binary => "BIN",
            FileType::Other => "FILE",
        };
        format!("{}: {} ({})", item_type, item.name, format_size(item.size))
    } else {
        "No selection".to_string()
    };

    let visual_indicator = if app.visual_mode {
        format!(" [VISUAL: {} selected]", app.selected_files.len())
    } else {
        String::new()
    };

    let history_indicator = if app.history.len() > 1 {
        format!(" [{}:{}]", app.history_index + 1, app.history.len())
    } else {
        String::new()
    };

    let bookmark_indicator = if app.bookmarks.iter().any(|p| p == &app.current_path) {
        " [★]"
    } else {
        ""
    };

    let operation_indicator = if let Some(op) = &app.operation_mode {
        match op {
            OperationMode::Copy => " [COPY MODE]",
            OperationMode::Move => " [MOVE MODE]",
            OperationMode::Delete => " [DELETE MODE]",
            OperationMode::Rename => " [RENAME MODE]",
        }
    } else {
        ""
    };

    let status_text = if app.search_mode {
        format!("🔍 /{} | ESC: exit search", app.search_query)
    } else if app.command_mode {
        format!("🔧 :{} | ESC: cancel", app.command_query)
    } else {
        let help = "j/k: move | l/Enter: open | h: back | /: search | v: visual | q: quit | :cmd | Ctrl+t: new tab";
        format!("📊 {}/{} | {}{}{}{} | {}", 
            app.selected_index + 1,
            app.files.len(),
            selected_info,
            visual_indicator,
            bookmark_indicator,
            operation_indicator,
            help
        )
    };

    let status = Paragraph::new(status_text)
        .style(Style::default().fg(Color::Green))
        .block(Block::default().borders(Borders::ALL));

    f.render_widget(status, area);
}

fn render_header(f: &mut Frame, area: Rect, app: &AppState) {
    let path_text = app.current_path.display().to_string();
    let truncated_path = if path_text.width() > area.width as usize - 4 {
        let start = path_text.len().saturating_sub(area.width as usize - 7);
        format!("...{}", &path_text[start..])
    } else {
        path_text
    };

    let tab_indicator = if app.tabs.len() > 1 {
        format!(" [Tab {}/{}]", app.active_tab_index + 1, app.tabs.len())
    } else {
        String::new()
    };

    let header = Paragraph::new(Line::from(vec![
        Span::styled("📂 ", Style::default().fg(Color::Yellow)),
        Span::styled(truncated_path, Style::default().fg(Color::Cyan)),
        Span::styled(tab_indicator, Style::default().fg(Color::Magenta)),
    ]))
    .block(Block::default().borders(Borders::ALL));

    f.render_widget(header, area);
}

fn render_preview(f: &mut Frame, area: Rect, app: &AppState) {
    let content = match &app.preview_content {
        PreviewContent::Empty => vec![Line::from("Select a file to preview")],
        PreviewContent::Text(text) => {
            if let Some(item) = app.files.get(app.selected_index) {
                if let Some(syntax) = app.syntax_set.find_syntax_for_file(&item.path).ok().flatten() {
                    let highlighted = highlight_text(text, &syntax, &app.syntax_set, &app.theme);
                    highlighted
                        .lines()
                        .take(area.height as usize - 2)
                        .map(|line| Line::from(line))
                        .collect()
                } else {
                    let lines: Vec<Line> = text
                        .lines()
                        .take(area.height as usize - 2)
                        .map(|line| Line::from(line))
                        .collect();
                    if lines.is_empty() {
                        vec![Line::from("(empty file)")]
                    } else {
                        lines
                    }
                }
            } else {
                vec![Line::from("No file selected")]
            }
        }
        PreviewContent::Directory(children) => {
            children
                .iter()
                .map(|child| Line::from(child.as_str()))
                .collect()
        }
        PreviewContent::Binary => vec![Line::from("Binary file - cannot preview")],
        PreviewContent::TooLarge => vec![Line::from("File too large to preview (>50KB)")],
        PreviewContent::Error(err) => vec![Line::from(format!("Error: {}", err))],
    };

    let preview = Paragraph::new(content)
        .wrap(Wrap { trim: true })
        .block(
            Block::default()
                .borders(Borders::ALL)
                .title("Preview")
        );

    f.render_widget(preview, area);
}

fn highlight_text(text: &str, syntax: &SyntaxReference, syntax_set: &SyntaxSet, theme: &Theme) -> String {
    use syntect::easy::HighlightLines;
    use syntect::highlighting::Highlighter;
    
    let mut highlighter = Highlighter::new(theme);
    let mut h = HighlightLines::new(syntax, theme);
    
    let mut result = String::new();
    
    for line in LinesWithEndings::from(text) {
        let ranges = h.highlight_line(line, syntax_set).unwrap_or_default();
        for (style, text) in as_ansi_24bit_terminal_style(&ranges, &mut highlighter) {
            result.push_str(&text);
        }
        result.push_str("\n");
    }
    
    result
}

fn format_size(size: u64) -> String {
    const UNITS: &[&str] = &["B", "KB", "MB", "GB"];
    let mut size_f = size as f64;
    let mut unit_index = 0;

    while size_f >= 1024.0 && unit_index < UNITS.len() - 1 {
        size_f /= 1024.0;
        unit_index += 1;
    }

    if unit_index == 0 {
        format!("{} {}", size, UNITS[unit_index])
    } else {
        format!("{:.1} {}", size_f, UNITS[unit_index])
    }
}
