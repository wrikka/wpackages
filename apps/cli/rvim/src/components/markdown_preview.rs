use pulldown_cmark::{Options, Parser};
use ratatui::{
    layout::Rect,
    style::{Modifier, Style},
    text::{Line, Span, Text},
    widgets::{Block, Borders, Paragraph, Wrap},
    Frame,
};

pub struct MarkdownPreview {
    is_visible: bool,
}

impl Default for MarkdownPreview {
    fn default() -> Self {
        Self::new()
    }
}

impl MarkdownPreview {
    pub fn new() -> Self {
        Self { is_visible: false }
    }

    pub fn set_visible(&mut self, visible: bool) {
        self.is_visible = visible;
    }

    pub fn render(&self, frame: &mut Frame, area: Rect, markdown_text: &str) {
        if !self.is_visible {
            return;
        }

        let mut options = Options::empty();
        options.insert(Options::ENABLE_STRIKETHROUGH);
        let parser = Parser::new_ext(markdown_text, options);

        let mut lines = Vec::new();
        let mut current_line = Vec::new();
        let mut style_stack = Vec::new();

        for event in parser {
            use pulldown_cmark::{Event, Tag, TagEnd};

            match event {
                Event::Start(tag) => match tag {
                    Tag::Emphasis => style_stack.push(Modifier::ITALIC),
                    Tag::Strong => style_stack.push(Modifier::BOLD),
                    Tag::Heading { .. } => style_stack.push(Modifier::BOLD),
                    _ => {}
                },
                Event::End(tag) => match tag {
                    TagEnd::Emphasis | TagEnd::Strong | TagEnd::Heading(_) => {
                        style_stack.pop();
                    }
                    TagEnd::Paragraph => {
                        lines.push(Line::from(current_line.drain(..).collect::<Vec<_>>()));
                    }
                    _ => {}
                },
                Event::Text(text) => {
                    let style = style_stack
                        .iter()
                        .fold(Style::default(), |s, m| s.add_modifier(*m));
                    current_line.push(Span::styled(text.to_string(), style));
                }
                Event::SoftBreak | Event::HardBreak => {
                    lines.push(Line::from(current_line.drain(..).collect::<Vec<_>>()));
                }
                _ => {}
            }
        }
        if !current_line.is_empty() {
            lines.push(Line::from(current_line.drain(..).collect::<Vec<_>>()));
        }

        let text = Text::from(lines);

        let paragraph = Paragraph::new(Text::from(text))
            .block(
                Block::default()
                    .borders(Borders::ALL)
                    .title("Markdown Preview"),
            )
            .wrap(Wrap { trim: true });

        frame.render_widget(paragraph, area);
    }
}
