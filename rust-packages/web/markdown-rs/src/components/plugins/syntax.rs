use crate::components::plugins::Plugin;
use crate::config::RenderFlags;
use crate::constants::{SYNTAX_SET, THEME_SET};
use pulldown_cmark::{CodeBlockKind, CowStr, Event, Tag, TagEnd};
use std::collections::{HashMap, VecDeque};
use std::fmt::Write as _;
use syntect::easy::HighlightLines;
use syntect::html::{styled_line_to_highlighted_html, IncludeBackground};
use syntect::util::LinesWithEndings;
use std::hash::{Hash, Hasher};
use std::sync::{Mutex, OnceLock};
use v_htmlescape::escape;

#[derive(Default)]
pub struct SyntaxHighlightingPlugin;

const CACHE_MAX_ENTRIES: usize = 128;

struct SyntaxCache {
    order: VecDeque<u64>,
    map: HashMap<u64, String>,
}

impl SyntaxCache {
    fn new() -> Self {
        Self {
            order: VecDeque::new(),
            map: HashMap::new(),
        }
    }

    fn get(&mut self, key: u64) -> Option<String> {
        self.map.get(&key).cloned()
    }

    fn insert(&mut self, key: u64, value: String) {
        if let std::collections::hash_map::Entry::Occupied(mut e) = self.map.entry(key) {
            e.insert(value);
            return;
        }

        self.map.insert(key, value);
        self.order.push_back(key);

        while self.order.len() > CACHE_MAX_ENTRIES {
            if let Some(old) = self.order.pop_front() {
                self.map.remove(&old);
            }
        }
    }
}

static SYNTAX_CACHE: OnceLock<Mutex<SyntaxCache>> = OnceLock::new();

fn cache_key(language: &str, text: &str) -> u64 {
    let mut hasher = std::collections::hash_map::DefaultHasher::new();
    language.hash(&mut hasher);
    text.hash(&mut hasher);
    hasher.finish()
}

pub(crate) fn highlight_code_block_html(language: &str, text: &str) -> Option<String> {
    let key = cache_key(language, text);

    if let Some(lock) = SYNTAX_CACHE.get() {
        if let Ok(mut cache) = lock.lock() {
            if let Some(html) = cache.get(key) {
                return Some(html);
            }
        }
    }

    let syntax = SYNTAX_SET
        .find_syntax_by_token(language)
        .unwrap_or_else(|| SYNTAX_SET.find_syntax_plain_text());

    let theme = &THEME_SET.themes["base16-ocean.dark"];
    let mut h = HighlightLines::new(syntax, theme);

    let mut out = String::new();

    for line in LinesWithEndings::from(text) {
        if let Ok(regions) = h.highlight_line(line, &SYNTAX_SET) {
            if let Ok(html) = styled_line_to_highlighted_html(&regions, IncludeBackground::No) {
                out.push_str(&html);
            } else {
                let _ = write!(&mut out, "{}", escape(line));
            }
        } else {
             let _ = write!(&mut out, "{}", escape(line));
        }
    }

    if let Ok(mut cache) = SYNTAX_CACHE
        .get_or_init(|| Mutex::new(SyntaxCache::new()))
        .lock()
    {
        cache.insert(key, out.clone());
    }

    Some(out)
}

impl Plugin for SyntaxHighlightingPlugin {
    fn process<'a>(&self, flags: RenderFlags, events: &mut Vec<Event<'a>>) -> bool {
        if !flags.syntax_highlight {
            return false;
        }
                let mut changed = false;
        let mut in_code_block = false;
        let mut language: Option<CowStr<'a>> = None;

        for event in events.iter_mut() {
            match event {
                Event::Start(Tag::CodeBlock(lang)) => {
                    in_code_block = true;
                    if let CodeBlockKind::Fenced(lang_str) = lang {
                        language = Some(lang_str.clone());
                    }
                    *event = Event::Html(CowStr::from("<pre><code>"));
                    changed = true;
                }
                Event::End(TagEnd::CodeBlock) => {
                    in_code_block = false;
                    language = None;
                    *event = Event::Html(CowStr::from("</code></pre>"));
                    changed = true;
                }
                Event::Text(text) if in_code_block => {
                    let lang = language.as_deref().unwrap_or("text");
                    let text_str = text.as_ref();

                    if let Some(html) = highlight_code_block_html(lang, text_str) {
                        *event = Event::Html(CowStr::from(html));
                        changed = true;
                    }
                }
                _ => {},
            }
        }
        changed
    }
}
