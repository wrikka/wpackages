use napi_derive::napi;

#[napi(object)]
pub struct RenderOptions {
    pub sanitize: Option<bool>,
    #[napi(js_name = "syntaxHighlight")]
    pub syntax_highlight: Option<bool>,
    pub toc: Option<bool>,
    pub directives: Option<bool>,
    pub gfm: Option<bool>,
    pub footnotes: Option<bool>,
    pub spoiler: Option<bool>,
    #[napi(js_name = "smartPunctuation")]
    pub smart_punctuation: Option<bool>,
    pub linkify: Option<bool>,
    pub admonitions: Option<bool>,
    pub attributes: Option<bool>,
    pub math: Option<bool>,
}

#[derive(Debug, Clone, Copy)]
pub struct RenderFlags {
    pub sanitize: bool,
    pub syntax_highlight: bool,
    pub toc: bool,
    pub directives: bool,
    pub gfm: bool,
    pub footnotes: bool,
    pub spoiler: bool,
    pub smart_punctuation: bool,
    pub linkify: bool,
    pub admonitions: bool,
    pub attributes: bool,
    pub math: bool,
}

impl Default for RenderFlags {
    fn default() -> Self {
        Self {
            sanitize: true,
            syntax_highlight: false, // Disabled by default
            toc: false, // Disabled by default
            directives: false, // Disabled by default
            gfm: true,
            footnotes: true,
            spoiler: false, // Disabled by default
            smart_punctuation: false, // Disabled by default
            linkify: false, // Disabled by default
            admonitions: false, // Disabled by default
            attributes: false, // Disabled by default
            math: false, // Disabled by default
        }
    }
}

impl RenderFlags {
    pub fn fast() -> Self {
        Self {
            sanitize: false,
            syntax_highlight: false,
            toc: false,
            directives: false,
            gfm: false,
            footnotes: false,
            spoiler: false,
            smart_punctuation: false,
            linkify: false,
            admonitions: false,
            attributes: false,
            math: false,
        }
    }

    pub fn from_options(options: Option<RenderOptions>) -> Self {
        let default_flags = Self::default();
        if let Some(o) = options {
            Self {
                sanitize: o.sanitize.unwrap_or(default_flags.sanitize),
                syntax_highlight: o.syntax_highlight.unwrap_or(default_flags.syntax_highlight),
                toc: o.toc.unwrap_or(default_flags.toc),
                directives: o.directives.unwrap_or(default_flags.directives),
                gfm: o.gfm.unwrap_or(default_flags.gfm),
                footnotes: o.footnotes.unwrap_or(default_flags.footnotes),
                spoiler: o.spoiler.unwrap_or(default_flags.spoiler),
                smart_punctuation: o.smart_punctuation.unwrap_or(default_flags.smart_punctuation),
                linkify: o.linkify.unwrap_or(default_flags.linkify),
                admonitions: o.admonitions.unwrap_or(default_flags.admonitions),
                attributes: o.attributes.unwrap_or(default_flags.attributes),
                math: o.math.unwrap_or(default_flags.math),
            }
        } else {
            default_flags
        }
    }
}
