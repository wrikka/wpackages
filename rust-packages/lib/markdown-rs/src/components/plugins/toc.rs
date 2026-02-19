use pulldown_cmark::{CowStr, Event, HeadingLevel, Tag, TagEnd};
use crate::components::plugins::Plugin;

#[derive(Debug, Clone)]
struct Heading {
    level: HeadingLevel,
    text: String,
    id: String,
}

pub struct TocPlugin;

impl Plugin for TocPlugin {
    fn process<'a>(
        &self,
        events: Box<dyn Iterator<Item = Event<'a>> + 'a>,
    ) -> Box<dyn Iterator<Item = Event<'a>> + 'a> {
        // First pass: Collect events to enable a second pass
        let events_vec: Vec<Event<'a>> = events.collect();
        let mut has_toc_placeholder = false;

        // Second pass (on the collected vector): Collect headings and check for placeholder
        let mut current_heading_text = String::new();
        let mut in_heading = false;

        for event in &events_vec {
            match event {
                Event::Start(Tag::Heading { .. }) => {
                    in_heading = true;
                    current_heading_text.clear();
                }
                Event::End(TagEnd::Heading(..)) => {
                    in_heading = false;
                }
                Event::Text(text) => {
                    if in_heading {
                        current_heading_text.push_str(text);
                    } else if text.contains("[toc]") {
                        has_toc_placeholder = true;
                    }
                }
                _ => {}
            }
        }

        if !has_toc_placeholder {
            return Box::new(events_vec.into_iter());
        }

        // Generate TOC HTML
        let toc_html = Self::generate_toc_html_from_events(&events_vec);

        // Third pass: Map and replace
        let final_events = events_vec.into_iter().flat_map(move |event| {
            if let Event::Text(text) = &event {
                if text.contains("[toc]") {
                    let new_text = text.replace("[toc]", &toc_html);
                    return vec![Event::Html(CowStr::from(new_text))].into_iter();
                }
            }
            vec![event].into_iter()
        });

        Box::new(final_events)
    }
}

impl TocPlugin {
    fn generate_toc_html_from_events(events: &[Event]) -> String {
        let mut headings: Vec<Heading> = Vec::new();
        let mut current_heading_text = String::new();
        let mut current_level = HeadingLevel::H1;

        for event in events {
            match event {
                Event::Start(Tag::Heading { level, .. }) => {
                    current_level = *level;
                    current_heading_text.clear();
                }
                Event::Text(text) => {
                    current_heading_text.push_str(text);
                }
                Event::End(TagEnd::Heading(..)) => {
                    let slug = current_heading_text.to_lowercase().replace(' ', "-");
                    headings.push(Heading {
                        level: current_level,
                        text: current_heading_text.clone(),
                        id: slug,
                    });
                }
                _ => {}
            }
        }

        if headings.is_empty() {
            return String::new();
        }

        let mut html = String::from("<ul class=\"toc\">");
        let mut last_level = headings[0].level;

        for heading in &headings {
            let level_diff = heading.level as i8 - last_level as i8;

            if level_diff > 0 {
                for _ in 0..level_diff {
                    html.push_str("<ul>");
                }
            } else if level_diff < 0 {
                for _ in 0..-level_diff {
                    html.push_str("</ul></li>");
                }
            }

            if level_diff <= 0 {
                html.push_str("</li>");
            }

            html.push_str(&format!(
                "<li><a href=\"#{}\" rel=\"noopener noreferrer\">{}",
                heading.id, heading.text
            ));
            last_level = heading.level;
        }

        // Close remaining tags
        let mut open_tags = last_level as i8 - headings[0].level as i8;
        while open_tags >= 0 {
            html.push_str("</li></ul>");
            open_tags -= 1;
        }

        html
    }
}
