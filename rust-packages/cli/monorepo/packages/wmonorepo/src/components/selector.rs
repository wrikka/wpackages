use crate::types::config::WmoRepoConfig;
use crate::types::workspace::Workspace;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SelectorExpr {
    Any,
    NameGlob(String),
    Tag(String),
    Not(Box<SelectorExpr>),
    And(Vec<SelectorExpr>),
    Or(Vec<SelectorExpr>),
}

#[derive(Debug, Clone, PartialEq, Eq)]
enum Token {
    Not,
    And,
    Or,
    LParen,
    RParen,
    Atom(String),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Selector {
    expr: SelectorExpr,
}

impl Selector {
    pub fn parse(input: &str) -> Result<Self, String> {
        let tokens = tokenize(input)?;
        let mut parser = Parser::new(tokens);
        let expr = parser.parse_expr()?;
        if parser.peek().is_some() {
            return Err("Unexpected tokens at end of selector".to_string());
        }
        Ok(Selector { expr })
    }

    pub fn matches_workspace(&self, ws: &Workspace, config: &WmoRepoConfig) -> bool {
        matches_expr(&self.expr, ws, config)
    }
}

fn matches_expr(expr: &SelectorExpr, ws: &Workspace, config: &WmoRepoConfig) -> bool {
    match expr {
        SelectorExpr::Any => true,
        SelectorExpr::NameGlob(glob) => match glob::Pattern::new(glob) {
            Ok(pat) => pat.matches(&ws.package_json.name),
            Err(_) => false,
        },
        SelectorExpr::Tag(tag) => {
            let tags = config
                .projects
                .get(&ws.package_json.name)
                .map(|p| p.tags.as_slice())
                .unwrap_or(&[]);
            tags.iter().any(|t| t == tag)
        }
        SelectorExpr::Not(inner) => !matches_expr(inner, ws, config),
        SelectorExpr::And(items) => items.iter().all(|it| matches_expr(it, ws, config)),
        SelectorExpr::Or(items) => items.iter().any(|it| matches_expr(it, ws, config)),
    }
}

fn tokenize(input: &str) -> Result<Vec<Token>, String> {
    let mut out = Vec::new();
    let mut buf = String::new();

    let flush = |buf: &mut String, out: &mut Vec<Token>| {
        if !buf.trim().is_empty() {
            out.push(Token::Atom(buf.trim().to_string()));
        }
        buf.clear();
    };

    for ch in input.chars() {
        match ch {
            '!' => {
                flush(&mut buf, &mut out);
                out.push(Token::Not);
            }
            '&' => {
                flush(&mut buf, &mut out);
                out.push(Token::And);
            }
            '|' => {
                flush(&mut buf, &mut out);
                out.push(Token::Or);
            }
            '(' => {
                flush(&mut buf, &mut out);
                out.push(Token::LParen);
            }
            ')' => {
                flush(&mut buf, &mut out);
                out.push(Token::RParen);
            }
            c if c.is_whitespace() => {
                flush(&mut buf, &mut out);
            }
            _ => buf.push(ch),
        }
    }

    flush(&mut buf, &mut out);

    if out.is_empty() {
        return Ok(vec![Token::Atom("*".to_string())]);
    }

    Ok(out)
}

struct Parser {
    tokens: Vec<Token>,
    pos: usize,
}

impl Parser {
    fn new(tokens: Vec<Token>) -> Self {
        Self { tokens, pos: 0 }
    }

    fn peek(&self) -> Option<&Token> {
        self.tokens.get(self.pos)
    }

    fn next(&mut self) -> Option<Token> {
        let t = self.tokens.get(self.pos).cloned();
        if t.is_some() {
            self.pos += 1;
        }
        t
    }

    fn parse_expr(&mut self) -> Result<SelectorExpr, String> {
        self.parse_or()
    }

    fn parse_or(&mut self) -> Result<SelectorExpr, String> {
        let mut items = vec![self.parse_and()?];
        while matches!(self.peek(), Some(Token::Or)) {
            self.next();
            items.push(self.parse_and()?);
        }

        if items.len() == 1 {
            Ok(items.remove(0))
        } else {
            Ok(SelectorExpr::Or(items))
        }
    }

    fn parse_and(&mut self) -> Result<SelectorExpr, String> {
        let mut items = vec![self.parse_unary()?];
        while matches!(self.peek(), Some(Token::And)) {
            self.next();
            items.push(self.parse_unary()?);
        }

        if items.len() == 1 {
            Ok(items.remove(0))
        } else {
            Ok(SelectorExpr::And(items))
        }
    }

    fn parse_unary(&mut self) -> Result<SelectorExpr, String> {
        if matches!(self.peek(), Some(Token::Not)) {
            self.next();
            return Ok(SelectorExpr::Not(Box::new(self.parse_unary()?)));
        }

        self.parse_primary()
    }

    fn parse_primary(&mut self) -> Result<SelectorExpr, String> {
        match self.next() {
            Some(Token::LParen) => {
                let expr = self.parse_expr()?;
                match self.next() {
                    Some(Token::RParen) => Ok(expr),
                    _ => Err("Missing ')' in selector".to_string()),
                }
            }
            Some(Token::Atom(atom)) => parse_atom(&atom),
            Some(Token::RParen) => Err("Unexpected ')' in selector".to_string()),
            Some(Token::And) | Some(Token::Or) => {
                Err("Unexpected operator in selector".to_string())
            }
            None => Err("Unexpected end of selector".to_string()),
            Some(Token::Not) => Err("Unexpected '!' in selector".to_string()),
        }
    }
}

fn parse_atom(atom: &str) -> Result<SelectorExpr, String> {
    if atom == "*" {
        return Ok(SelectorExpr::Any);
    }

    if let Some(tag) = atom.strip_prefix("tag:") {
        if tag.trim().is_empty() {
            return Err("tag: requires a value".to_string());
        }
        return Ok(SelectorExpr::Tag(tag.trim().to_string()));
    }

    Ok(SelectorExpr::NameGlob(atom.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::config::{ProjectConfig, WmoRepoConfig};
    use crate::types::workspace::{PackageJson, Workspace};
    use std::collections::HashMap;
    use std::path::PathBuf;

    fn ws(name: &str) -> Workspace {
        Workspace {
            path: PathBuf::from("."),
            package_json: PackageJson {
                name: name.to_string(),
                dependencies: HashMap::new(),
                scripts: HashMap::new(),
            },
        }
    }

    fn cfg_with_tags(name: &str, tags: &[&str]) -> WmoRepoConfig {
        let mut projects = HashMap::new();
        projects.insert(
            name.to_string(),
            ProjectConfig {
                tags: tags.iter().map(|t| t.to_string()).collect(),
            },
        );

        WmoRepoConfig {
            schema: None,
            extends: vec![],
            remote_cache_url: None,
            workspaces: vec![],
            pipeline: HashMap::new(),
            projects,
            constraints: crate::types::config::ConstraintsConfig::default(),
            plugins: vec![],
        }
    }

    #[test]
    fn parse_and_match_tag() {
        let sel = Selector::parse("tag:frontend & !tag:deprecated").unwrap();
        let cfg = cfg_with_tags("@acme/app", &["frontend"]);
        assert!(sel.matches_workspace(&ws("@acme/app"), &cfg));
    }

    #[test]
    fn parse_or_name_glob() {
        let sel = Selector::parse("@acme/* | tag:backend").unwrap();
        let cfg = cfg_with_tags("@acme/api", &["backend"]);
        assert!(sel.matches_workspace(&ws("@acme/api"), &cfg));
    }

    #[test]
    fn parentheses_precedence() {
        let sel = Selector::parse("tag:a & (tag:b | tag:c)").unwrap();
        let mut cfg = cfg_with_tags("p", &["a", "c"]);
        cfg.projects.insert(
            "p".to_string(),
            ProjectConfig {
                tags: vec!["a".to_string(), "c".to_string()],
            },
        );
        assert!(sel.matches_workspace(&ws("p"), &cfg));
    }
}
