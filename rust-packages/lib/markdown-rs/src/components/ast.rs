use crate::types::{Alignment, Node, NodeType};
use pulldown_cmark::{CodeBlockKind, Event, Tag};

fn to_alignment(alignment: pulldown_cmark::Alignment) -> Alignment {
    match alignment {
        pulldown_cmark::Alignment::None => Alignment::None,
        pulldown_cmark::Alignment::Left => Alignment::Left,
        pulldown_cmark::Alignment::Center => Alignment::Center,
        pulldown_cmark::Alignment::Right => Alignment::Right,
    }
}

pub fn build_ast<'a>(parser: &mut dyn Iterator<Item = Event<'a>>) -> Node {
    let root = Node {
        r#type: NodeType::Document,
        ..Default::default()
    };
    let mut stack: Vec<Node> = vec![root];

    for event in parser {
        match event {
            Event::Start(tag) => {
                let node_type = match tag {
                    Tag::Paragraph => NodeType::Paragraph,
                    Tag::Heading { level, .. } => NodeType::Heading(level as u32),
                    Tag::BlockQuote => NodeType::BlockQuote,
                    Tag::CodeBlock(kind) => {
                        let lang = if let CodeBlockKind::Fenced(lang) = kind {
                            Some(lang.into_string())
                        } else {
                            None
                        };
                        NodeType::CodeBlock { lang }
                    }
                    Tag::List(start) => NodeType::List { start },
                    Tag::Item => NodeType::Item,
                    Tag::FootnoteDefinition(label) => NodeType::FootnoteDefinition {
                        label: label.into_string(),
                    },
                    Tag::Table(alignments) => {
                        NodeType::Table(alignments.into_iter().map(to_alignment).collect())
                    }
                    Tag::TableHead => NodeType::TableHead,
                    Tag::TableRow => NodeType::TableRow,
                    Tag::TableCell => NodeType::TableCell,
                    Tag::Emphasis => NodeType::Emph,
                    Tag::Strong => NodeType::Strong,
                    Tag::Strikethrough => NodeType::Strikethrough,
                    Tag::Link { dest_url, title, .. } => NodeType::Link {
                        dest_url: dest_url.into_string(),
                        title: title.into_string(),
                    },
                    Tag::Image { dest_url, title, .. } => NodeType::Image {
                        dest_url: dest_url.into_string(),
                        title: title.into_string(),
                    },
                };
                let new_node = Node {
                    r#type: node_type,
                    ..Default::default()
                };
                stack.push(new_node);
            }
            Event::End(_) => {
                if let Some(node) = stack.pop() {
                    if let Some(parent) = stack.last_mut() {
                        parent.children.push(node);
                    }
                }
            }
            Event::Text(text) => {
                if let Some(parent) = stack.last_mut() {
                    if let Some(last_child) = parent.children.last_mut() {
                        if matches!(last_child.r#type, NodeType::Text) {
                            if let Some(content) = &mut last_child.content {
                                content.push_str(&text);
                                continue;
                            }
                        }
                    }
                    parent.children.push(Node {
                        r#type: NodeType::Text,
                        content: Some(text.into_string()),
                        ..Default::default()
                    });
                }
            }
            Event::Code(text) => {
                if let Some(parent) = stack.last_mut() {
                    parent.children.push(Node {
                        r#type: NodeType::Code,
                        content: Some(text.into_string()),
                        ..Default::default()
                    });
                }
            }
            Event::Html(html) => {
                if let Some(parent) = stack.last_mut() {
                    parent.children.push(Node {
                        r#type: NodeType::Html,
                        content: Some(html.into_string()),
                        ..Default::default()
                    });
                }
            }
            Event::FootnoteReference(label) => {
                if let Some(parent) = stack.last_mut() {
                    parent.children.push(Node {
                        r#type: NodeType::FootnoteReference {
                            label: label.into_string(),
                        },
                        ..Default::default()
                    });
                }
            }
            Event::SoftBreak => {
                if let Some(parent) = stack.last_mut() {
                    parent.children.push(Node {
                        r#type: NodeType::SoftBreak,
                        ..Default::default()
                    });
                }
            }
            Event::HardBreak => {
                if let Some(parent) = stack.last_mut() {
                    parent.children.push(Node {
                        r#type: NodeType::HardBreak,
                        ..Default::default()
                    });
                }
            }
            Event::Rule => {
                if let Some(parent) = stack.last_mut() {
                    parent.children.push(Node {
                        r#type: NodeType::Rule,
                        ..Default::default()
                    });
                }
            }
            Event::TaskListMarker(_) => {}
        }
    }
    stack.remove(0)
}
