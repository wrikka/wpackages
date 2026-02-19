use crate::components::plugins::Plugin;
use crate::config::RenderFlags;
use pulldown_cmark::Event;

pub struct MathPlugin;

impl Plugin for MathPlugin {
    fn process<'a>(&self, _flags: RenderFlags, events: &mut Vec<Event<'a>>) -> bool {
        let mut changed = false;
        let mut new_events = Vec::with_capacity(events.len());
        let mut math_content: Option<String> = None;
        let mut is_block = false;

        for event in events.drain(..) {
            if let Event::Text(text) = event {
                let mut last_end = 0;
                let mut in_math_block = false;

                for (i, c) in text.char_indices() {
                    if c == '$' {
                        if let Some(next_char) = text.chars().nth(i + 1) {
                            if next_char == '$' && !in_math_block {
                                if i > last_end {
                                    new_events.push(Event::Text(text[last_end..i].to_string().into()));
                                }
                                is_block = true;
                                in_math_block = true;
                                math_content = Some(String::new());
                                last_end = i + 2;
                                changed = true;
                            } else if in_math_block {
                                if is_block && next_char == '$' {
                                    if let Some(content) = &math_content {
                                        new_events.push(Event::Html(format!("<div class=\"math-block\">{}", content).into()));
                                        new_events.push(Event::Html("</div>".into()));
                                    }
                                    in_math_block = false;
                                    math_content = None;
                                    last_end = i + 2;
                                } else if !is_block {
                                    if let Some(content) = &math_content {
                                        new_events.push(Event::Html(format!("<span class=\"math-inline\">{}", content).into()));
                                        new_events.push(Event::Html("</span>".into()));
                                    }
                                    in_math_block = false;
                                    math_content = None;
                                    last_end = i + 1;
                                }
                            }
                        } else if !in_math_block {
                            if i > last_end {
                                new_events.push(Event::Text(text[last_end..i].to_string().into()));
                            }
                            is_block = false;
                            in_math_block = true;
                            math_content = Some(String::new());
                            last_end = i + 1;
                            changed = true;
                        }
                    }
                    if in_math_block {
                        if let Some(content) = &mut math_content {
                            content.push(c);
                        }
                    }
                }
                if last_end < text.len() {
                    new_events.push(Event::Text(text[last_end..].to_string().into()));
                }
            } else {
                new_events.push(event);
            }
        }

        if changed {
            *events = new_events;
        }

        changed
    }
}
