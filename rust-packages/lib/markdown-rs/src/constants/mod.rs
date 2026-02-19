use syntect::highlighting::ThemeSet;
use syntect::parsing::SyntaxSet;

lazy_static::lazy_static! {
    pub static ref SYNTAX_SET: SyntaxSet = SyntaxSet::load_defaults_newlines();
    pub static ref THEME_SET: ThemeSet = ThemeSet::load_defaults();
}
