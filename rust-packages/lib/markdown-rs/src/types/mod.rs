use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone, Copy)]
pub enum Alignment {
    None,
    Left,
    Center,
    Right,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone, Default)]
pub enum NodeType {
    // Block-level
    #[default]
    Document,
    BlockQuote,
    List { start: Option<u64> },
    Item,
    FootnoteDefinition { label: String },
    Table(Vec<Alignment>),
    TableHead,
    TableRow,
    TableCell,
    Heading(u32),
    CodeBlock { lang: Option<String> },
    Paragraph,
    Rule,
    Html,

    // Inline-level
    Text,
    Strong,
    Emph,
    Strikethrough,
    Link { dest_url: String, title: String },
    Image { dest_url: String, title: String },
    Code,
    SoftBreak,
    HardBreak,
    FootnoteReference { label: String },
}

#[derive(Serialize, Deserialize, Debug, Default, PartialEq, Clone)]
pub struct Node {
    pub r#type: NodeType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub children: Vec<Node>,
}
