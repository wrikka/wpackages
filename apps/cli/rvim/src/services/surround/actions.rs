use super::types::{SelectionRange, SurroundPair};
use crate::error::Result;

pub fn add_surround(
    source: &str,
    line: usize,
    start_col: usize,
    end_col: usize,
    pair: SurroundPair,
) -> Result<String> {
    let lines: Vec<&str> = source.lines().collect();
    let mut result = Vec::new();

    for (i, &line_content) in lines.iter().enumerate() {
        if i == line {
            let before = &line_content[..start_col.min(line_content.len())];
            let middle = &line_content[start_col..end_col.min(line_content.len())];
            let after = &line_content[end_col.min(line_content.len())..];

            result.push(format!(
                "{}{}{}{}{}",
                before,
                pair.open(),
                middle,
                pair.close(),
                after
            ));
        } else {
            result.push(line_content.to_string());
        }
    }

    Ok(result.join("\n"))
}

pub fn change_surround(
    source: &str,
    line: usize,
    _col: usize,
    old_pair: SurroundPair,
    new_pair: SurroundPair,
) -> Result<String> {
    let lines: Vec<&str> = source.lines().collect();
    let mut result = Vec::new();

    for (i, &line_content) in lines.iter().enumerate() {
        if i == line {
            let mut modified = line_content.to_string();

            modified = modified.replace(&old_pair.open().to_string(), &new_pair.open().to_string());
            modified =
                modified.replace(&old_pair.close().to_string(), &new_pair.close().to_string());

            result.push(modified);
        } else {
            result.push(line_content.to_string());
        }
    }

    Ok(result.join("\n"))
}

pub fn delete_surround(
    source: &str,
    line: usize,
    _col: usize,
    pair: SurroundPair,
) -> Result<String> {
    let lines: Vec<&str> = source.lines().collect();
    let mut result = Vec::new();

    for (i, &line_content) in lines.iter().enumerate() {
        if i == line {
            let mut modified = line_content.to_string();

            modified = modified.replace(&pair.open().to_string(), "");
            modified = modified.replace(&pair.close().to_string(), "");

            result.push(modified);
        } else {
            result.push(line_content.to_string());
        }
    }

    Ok(result.join("\n"))
}

pub fn find_surround_pair_at_position(
    source: &str,
    line: usize,
    _col: usize,
) -> Result<Option<SurroundPair>> {
    if let Some(line_content) = source.lines().nth(line) {
        let chars: Vec<char> = line_content.chars().collect();

        if let Some(&c) = chars.get(_col) {
            if let Some(pair) = SurroundPair::from_char(c) {
                return Ok(Some(pair));
            }
        }

        if _col > 0 {
            if let Some(&c) = chars.get(_col - 1) {
                if let Some(pair) = SurroundPair::from_char(c) {
                    return Ok(Some(pair));
                }
            }
        }
    }

    Ok(None)
}

pub fn surround_selection(
    source: &str,
    start_line: usize,
    start_col: usize,
    end_line: usize,
    end_col: usize,
    pair: SurroundPair,
) -> Result<String> {
    let lines: Vec<&str> = source.lines().collect();
    let mut result = Vec::new();

    for (i, &line_content) in lines.iter().enumerate() {
        if i == start_line {
            let before = &line_content[..start_col.min(line_content.len())];
            let middle = &line_content[start_col.min(line_content.len())..];
            result.push(format!("{}{}{}", before, pair.open(), middle));
        } else if i > start_line && i < end_line {
            result.push(line_content.to_string());
        } else if i == end_line {
            let middle = &line_content[..end_col.min(line_content.len())];
            let after = &line_content[end_col.min(line_content.len())..];
            result.push(format!("{}{}{}", middle, pair.close(), after));
        } else {
            result.push(line_content.to_string());
        }
    }

    Ok(result.join("\n"))
}

pub fn replace_surround_in_selection(
    source: &str,
    selection: SelectionRange,
    old_pair: SurroundPair,
    new_pair: SurroundPair,
) -> Result<String> {
    let lines: Vec<&str> = source.lines().collect();
    let mut result = Vec::new();

    for (i, &line_content) in lines.iter().enumerate() {
        if i >= selection.start_line && i <= selection.end_line {
            let mut modified = line_content.to_string();

            if i == selection.start_line {
                let before = &line_content[..selection.start_col.min(line_content.len())];
                let middle = &line_content[selection.start_col.min(line_content.len())..];
                modified = format!(
                    "{}{}",
                    before,
                    middle.replace(&old_pair.open().to_string(), &new_pair.open().to_string())
                );
            }

            if i == selection.end_line {
                let middle = &line_content[..selection.end_col.min(line_content.len())];
                let after = &line_content[selection.end_col.min(line_content.len())..];
                modified = format!(
                    "{}{}",
                    middle.replace(&old_pair.close().to_string(), &new_pair.close().to_string()),
                    after
                );
            }

            result.push(modified);
        } else {
            result.push(line_content.to_string());
        }
    }

    Ok(result.join("\n"))
}

pub fn delete_surround_in_selection(
    source: &str,
    start_line: usize,
    start_col: usize,
    end_line: usize,
    end_col: usize,
    pair: SurroundPair,
) -> Result<String> {
    let lines: Vec<&str> = source.lines().collect();
    let mut result = Vec::new();

    for (i, &line_content) in lines.iter().enumerate() {
        if i >= start_line && i <= end_line {
            let mut modified = line_content.to_string();

            if i == start_line {
                let before = &line_content[..start_col.min(line_content.len())];
                let middle = &line_content[start_col.min(line_content.len())..];
                modified = format!("{}{}", before, middle.replace(&pair.open().to_string(), ""));
            }

            if i == end_line {
                let middle = &line_content[..end_col.min(line_content.len())];
                let after = &line_content[end_col.min(line_content.len())..];
                modified = format!("{}{}", middle.replace(&pair.close().to_string(), ""), after);
            }

            result.push(modified);
        } else {
            result.push(line_content.to_string());
        }
    }

    Ok(result.join("\n"))
}
