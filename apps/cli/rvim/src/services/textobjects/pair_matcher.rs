use crate::error::Result;

pub fn find_matching_pair(
    source: &str,
    line: usize,
    col: usize,
) -> Result<Option<(usize, usize, usize, usize)>> {
    if let Some(line_content) = source.lines().nth(line) {
        let chars: Vec<char> = line_content.chars().collect();

        if let Some(&c) = chars.get(col) {
            let pairs = [('(', ')'), ('[', ']'), ('{', '}'), ('<', '>')];

            for &(open, close) in &pairs {
                if c == open {
                    return find_matching_forward(source, line, col, open, close);
                } else if c == close {
                    return find_matching_backward(source, line, col, open, close);
                }
            }
        }
    }

    Ok(None)
}

fn find_matching_forward(
    source: &str,
    start_line: usize,
    start_col: usize,
    open: char,
    close: char,
) -> Result<Option<(usize, usize, usize, usize)>> {
    let mut depth = 1;
    let mut current_line = start_line;
    let mut current_col = start_col + 1;

    while let Some(line_content) = source.lines().nth(current_line) {
        let chars: Vec<char> = line_content.chars().collect();

        while current_col < chars.len() {
            let c = chars[current_col];

            if c == open {
                depth += 1;
            } else if c == close {
                depth -= 1;

                if depth == 0 {
                    return Ok(Some((start_line, start_col, current_line, current_col)));
                }
            }

            current_col += 1;
        }

        current_line += 1;
        current_col = 0;
    }

    Ok(None)
}

fn find_matching_backward(
    source: &str,
    start_line: usize,
    start_col: usize,
    open: char,
    close: char,
) -> Result<Option<(usize, usize, usize, usize)>> {
    let mut depth = 1;
    let mut current_line = start_line;
    let mut current_col = if start_col > 0 { start_col - 1 } else { 0 };

    while let Some(line_content) = source.lines().nth(current_line) {
        let chars: Vec<char> = line_content.chars().collect();

        while let Some(c) = chars.get(current_col) {
            if *c == close {
                depth += 1;
            } else if *c == open {
                depth -= 1;

                if depth == 0 {
                    return Ok(Some((current_line, current_col, start_line, start_col)));
                }
            }

            if current_col == 0 {
                break;
            }
            current_col -= 1;
        }

        if current_line == 0 {
            break;
        }
        current_line -= 1;
        current_col = source
            .lines()
            .nth(current_line)
            .unwrap_or("")
            .chars()
            .count()
            .saturating_sub(1);
    }

    Ok(None)
}
