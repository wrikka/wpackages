use crate::error::AppResult;
use lazy_static::lazy_static;
use ammonia::Builder;
use std::collections::{HashMap, HashSet};

lazy_static! {
    static ref AMMONIA_BUILDER: Builder<'static> = {
        let mut builder = Builder::new();
        builder.link_rel(Some("noopener noreferrer"));

        let mut tag_attributes: HashMap<&'static str, HashSet<&'static str>> = builder.clone_tag_attributes();
        tag_attributes
            .entry("ul")
            .or_default()
            .insert("class");
        tag_attributes
            .entry("ol")
            .or_default()
            .insert("class");
        builder.tag_attributes(tag_attributes);

        builder
    };
}

pub trait SanitizerService {
    fn clean(&self, html: &str) -> AppResult<String>;
}

pub struct AmmoniaSanitizer;

impl SanitizerService for AmmoniaSanitizer {
    fn clean(&self, html: &str) -> AppResult<String> {
        Ok(AMMONIA_BUILDER.clean(html).to_string())
    }
}

pub fn sanitize(html: String, should_sanitize: bool) -> String {
    if !should_sanitize {
        return html;
    }
    let sanitizer = AmmoniaSanitizer;
    sanitizer.clean(&html).unwrap_or(html)
}
