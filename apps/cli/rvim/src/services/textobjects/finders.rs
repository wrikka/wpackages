use super::types::{TextObject, TextObjectRange};
use crate::error::Result;
use tree_sitter::Node;

pub fn find_text_object(
    source: &str,
    root: &Node,
    line: usize,
    col: usize,
    text_object: TextObject,
) -> Result<Option<TextObjectRange>> {
    let node = find_node_at_position(root, line, col);

    if let Some(node) = node {
        match text_object {
            TextObject::Word => find_word(source, line, col),
            TextObject::Line => find_line(source, line),
            TextObject::Block => find_block(&node),
            TextObject::Function => find_function(&node),
            TextObject::Class => find_class(&node),
            TextObject::Parameter => find_parameter(&node),
            TextObject::Argument => find_argument(&node),
            TextObject::String => find_string(&node),
            TextObject::Comment => find_comment(&node),
            TextObject::Tag => find_tag(&node),
            TextObject::Attribute => find_attribute(&node),
        }
    } else {
        Ok(None)
    }
}

fn find_node_at_position<'a>(node: &Node<'a>, line: usize, col: usize) -> Option<Node<'a>> {
    for child in node.children(&mut node.walk()) {
        if child.start_position().row <= line && child.end_position().row >= line {
            if child.start_position().row == line && child.start_position().column > col {
                continue;
            }
            if child.end_position().row == line && child.end_position().column < col {
                continue;
            }
            return find_node_at_position(&child, line, col);
        }
    }
    Some(*node)
}

fn find_word(source: &str, line: usize, col: usize) -> Result<Option<TextObjectRange>> {
    if let Some(line_content) = source.lines().nth(line) {
        let chars: Vec<char> = line_content.chars().collect();

        let mut start = col;
        while start > 0
            && chars
                .get(start - 1)
                .is_some_and(|c| c.is_alphanumeric() || *c == '_')
        {
            start -= 1;
        }

        let mut end = col;
        while end < chars.len()
            && chars
                .get(end)
                .is_some_and(|c| c.is_alphanumeric() || *c == '_')
        {
            end += 1;
        }

        if start < end {
            Ok(Some(TextObjectRange::new(line, start, line, end)))
        } else {
            Ok(None)
        }
    } else {
        Ok(None)
    }
}

fn find_line(source: &str, line: usize) -> Result<Option<TextObjectRange>> {
    if let Some(line_content) = source.lines().nth(line) {
        Ok(Some(TextObjectRange::new(
            line,
            0,
            line,
            line_content.len(),
        )))
    } else {
        Ok(None)
    }
}

fn find_block(node: &Node) -> Result<Option<TextObjectRange>> {
    let mut current = *node;

    while !current.is_named()
        || !matches!(
            current.kind(),
            "block" | "statement_block" | "compound_statement"
        )
    {
        if let Some(parent) = current.parent() {
            current = parent;
        } else {
            return Ok(None);
        }
    }

    Ok(Some(TextObjectRange::new(
        current.start_position().row,
        current.start_position().column,
        current.end_position().row,
        current.end_position().column,
    )))
}

fn find_function(node: &Node) -> Result<Option<TextObjectRange>> {
    let mut current = *node;

    while !matches!(
        current.kind(),
        "function_definition" | "function_declaration" | "function_item"
    ) {
        if let Some(parent) = current.parent() {
            current = parent;
        } else {
            return Ok(None);
        }
    }

    Ok(Some(TextObjectRange::new(
        current.start_position().row,
        current.start_position().column,
        current.end_position().row,
        current.end_position().column,
    )))
}

fn find_class(node: &Node) -> Result<Option<TextObjectRange>> {
    let mut current = *node;

    while !matches!(
        current.kind(),
        "class_definition" | "struct_definition" | "impl_block"
    ) {
        if let Some(parent) = current.parent() {
            current = parent;
        } else {
            return Ok(None);
        }
    }

    Ok(Some(TextObjectRange::new(
        current.start_position().row,
        current.start_position().column,
        current.end_position().row,
        current.end_position().column,
    )))
}

fn find_parameter(node: &Node) -> Result<Option<TextObjectRange>> {
    if matches!(node.kind(), "parameter" | "formal_parameter") {
        Ok(Some(TextObjectRange::new(
            node.start_position().row,
            node.start_position().column,
            node.end_position().row,
            node.end_position().column,
        )))
    } else {
        Ok(None)
    }
}

fn find_argument(node: &Node) -> Result<Option<TextObjectRange>> {
    if matches!(node.kind(), "argument" | "arguments") {
        Ok(Some(TextObjectRange::new(
            node.start_position().row,
            node.start_position().column,
            node.end_position().row,
            node.end_position().column,
        )))
    } else {
        Ok(None)
    }
}

fn find_string(node: &Node) -> Result<Option<TextObjectRange>> {
    if matches!(node.kind(), "string" | "string_literal") {
        Ok(Some(TextObjectRange::new(
            node.start_position().row,
            node.start_position().column,
            node.end_position().row,
            node.end_position().column,
        )))
    } else {
        Ok(None)
    }
}

fn find_comment(node: &Node) -> Result<Option<TextObjectRange>> {
    if matches!(node.kind(), "comment" | "line_comment" | "block_comment") {
        Ok(Some(TextObjectRange::new(
            node.start_position().row,
            node.start_position().column,
            node.end_position().row,
            node.end_position().column,
        )))
    } else {
        Ok(None)
    }
}

fn find_tag(node: &Node) -> Result<Option<TextObjectRange>> {
    if matches!(node.kind(), "tag" | "element") {
        Ok(Some(TextObjectRange::new(
            node.start_position().row,
            node.start_position().column,
            node.end_position().row,
            node.end_position().column,
        )))
    } else {
        Ok(None)
    }
}

fn find_attribute(node: &Node) -> Result<Option<TextObjectRange>> {
    if matches!(node.kind(), "attribute" | "attribute_item") {
        Ok(Some(TextObjectRange::new(
            node.start_position().row,
            node.start_position().column,
            node.end_position().row,
            node.end_position().column,
        )))
    } else {
        Ok(None)
    }
}
