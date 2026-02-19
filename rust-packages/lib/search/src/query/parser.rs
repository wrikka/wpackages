use crate::query::ast::*;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ParseError {
    #[error("unexpected token: {0}")]
    UnexpectedToken(String),
    #[error("unexpected end of input")]
    UnexpectedEnd,
    #[error("invalid field: {0}")]
    InvalidField(String),
    #[error("invalid operator: {0}")]
    InvalidOperator(String),
    #[error("unterminated string")]
    UnterminatedString,
    #[error("missing value for field {0}")]
    MissingValue(String),
    #[error("parse error: {0}")]
    Other(String),
}

pub struct QueryParser {
    tokens: Vec<Token>,
    pos: usize,
}

#[derive(Debug, Clone, PartialEq)]
enum Token {
    Field(String),
    Colon,
    NotColon,
    Tilde,
    NotTilde,
    MatchRegex,
    LParen,
    RParen,
    String(String),
    And,
    Or,
    Not,
    Limit(usize),
    Offset(usize),
}

pub fn tokenize(input: &str) -> Result<Vec<Token>, ParseError> {
    let mut tokens = Vec::new();
    let mut chars = input.chars().peekable();
    
    while let Some(&ch) = chars.peek() {
        match ch {
            ' ' | '\t' | '\n' | '\r' => {
                chars.next();
            }
            '(' => {
                tokens.push(Token::LParen);
                chars.next();
            }
            ')' => {
                tokens.push(Token::RParen);
                chars.next();
            }
            ':' => {
                tokens.push(Token::Colon);
                chars.next();
            }
            '!' => {
                chars.next();
                match chars.peek() {
                    Some(':') => {
                        tokens.push(Token::NotColon);
                        chars.next();
                    }
                    Some('~') => {
                        tokens.push(Token::NotTilde);
                        chars.next();
                    }
                    Some('=') => {
                        chars.next();
                        if chars.peek() == Some(&'~') {
                            chars.next();
                            tokens.push(Token::NotTilde);
                        } else {
                            return Err(ParseError::InvalidOperator("! or !=".to_string()));
                        }
                    }
                    _ => return Err(ParseError::InvalidOperator("!".to_string())),
                }
            }
            '~' => {
                tokens.push(Token::Tilde);
                chars.next();
            }
            '=' => {
                chars.next();
                if chars.peek() == Some(&'~') {
                    chars.next();
                    tokens.push(Token::MatchRegex);
                } else {
                    return Err(ParseError::InvalidOperator("=".to_string()));
                }
            }
            '"' | '\'' => {
                let quote = ch;
                chars.next();
                let mut s = String::new();
                while let Some(&c) = chars.peek() {
                    if c == quote {
                        chars.next();
                        break;
                    }
                    if c == '\\' {
                        chars.next();
                        if let Some(&escaped) = chars.peek() {
                            match escaped {
                                'n' => s.push('\n'),
                                't' => s.push('\t'),
                                'r' => s.push('\r'),
                                _ => s.push(escaped),
                            }
                            chars.next();
                        }
                    } else {
                        s.push(c);
                        chars.next();
                    }
                }
                tokens.push(Token::String(s));
            }
            _ if ch.is_alphanumeric() || ch == '_' || ch == '*' => {
                let mut s = String::new();
                while let Some(&c) = chars.peek() {
                    if c.is_alphanumeric() || c == '_' || c == '*' || c == '.' || c == '-' {
                        s.push(c);
                        chars.next();
                    } else {
                        break;
                    }
                }
                let upper = s.to_uppercase();
                match upper.as_str() {
                    "AND" => tokens.push(Token::And),
                    "OR" => tokens.push(Token::Or),
                    "NOT" => tokens.push(Token::Not),
                    "LIMIT" => {
                        chars.next();
                        let mut num = String::new();
                        while let Some(&c) = chars.peek() {
                            if c.is_ascii_digit() {
                                num.push(c);
                                chars.next();
                            } else {
                                break;
                            }
                        }
                        let n: usize = num.parse().unwrap_or(100);
                        tokens.push(Token::Limit(n));
                    }
                    "OFFSET" => {
                        chars.next();
                        let mut num = String::new();
                        while let Some(&c) = chars.peek() {
                            if c.is_ascii_digit() {
                                num.push(c);
                                chars.next();
                            } else {
                                break;
                            }
                        }
                        let n: usize = num.parse().unwrap_or(0);
                        tokens.push(Token::Offset(n));
                    }
                    _ => tokens.push(Token::Field(s)),
                }
            }
            _ => {
                return Err(ParseError::UnexpectedToken(ch.to_string()));
            }
        }
    }
    
    Ok(tokens)
}

impl QueryParser {
    pub fn new(input: &str) -> Result<Self, ParseError> {
        let tokens = tokenize(input)?;
        Ok(Self { tokens, pos: 0 })
    }
    
    fn peek(&self) -> Option<&Token> {
        self.tokens.get(self.pos)
    }
    
    fn advance(&mut self) -> Option<Token> {
        if self.pos < self.tokens.len() {
            let token = self.tokens[self.pos].clone();
            self.pos += 1;
            Some(token)
        } else {
            None
        }
    }
    
    pub fn parse(&mut self) -> Result<Query, ParseError> {
        self.parse_or()
    }
    
    fn parse_or(&mut self) -> Result<Query, ParseError> {
        let mut left = self.parse_and()?;
        
        while let Some(Token::Or) = self.peek() {
            self.advance();
            let right = self.parse_and()?;
            left = Query::Logical(LogicalQuery {
                left: Box::new(left),
                operator: LogicalOp::Or,
                right: Box::new(right),
            });
        }
        
        Ok(left)
    }
    
    fn parse_and(&mut self) -> Result<Query, ParseError> {
        let mut left = self.parse_not()?;
        
        while let Some(Token::And) = self.peek() {
            self.advance();
            let right = self.parse_not()?;
            left = Query::Logical(LogicalQuery {
                left: Box::new(left),
                operator: LogicalOp::And,
                right: Box::new(right),
            });
        }
        
        Ok(left)
    }
    
    fn parse_not(&mut self) -> Result<Query, ParseError> {
        if let Some(Token::Not) = self.peek() {
            self.advance();
            let query = self.parse_primary()?;
            Ok(Query::Logical(LogicalQuery {
                left: Box::new(query),
                operator: LogicalOp::Not,
                right: Box::new(Query::Search(SearchQuery {
                    field: SearchField::Symbol,
                    operator: ComparisonOp::Eq,
                    value: "".to_string(),
                })),
            }))
        } else {
            self.parse_primary()
        }
    }
    
    fn parse_primary(&mut self) -> Result<Query, ParseError> {
        match self.peek() {
            Some(Token::LParen) => {
                self.advance();
                let query = self.parse_or()?;
                match self.advance() {
                    Some(Token::RParen) => Ok(query),
                    _ => Err(ParseError::UnexpectedToken("expected )".to_string())),
                }
            }
            Some(Token::Field(field)) => {
                let field = field.clone();
                self.advance();
                let search_field: SearchField = field.parse()
                    .map_err(|e| ParseError::InvalidField(e))?;
                
                let operator = match self.peek() {
                    Some(Token::Colon) => {
                        self.advance();
                        ComparisonOp::Eq
                    }
                    Some(Token::NotColon) => {
                        self.advance();
                        ComparisonOp::NotEq
                    }
                    Some(Token::Tilde) => {
                        self.advance();
                        ComparisonOp::Like
                    }
                    Some(Token::NotTilde) => {
                        self.advance();
                        ComparisonOp::NotLike
                    }
                    Some(Token::MatchRegex) => {
                        self.advance();
                        ComparisonOp::Matches
                    }
                    _ => ComparisonOp::Eq,
                };
                
                let value = match self.advance() {
                    Some(Token::String(s)) => s,
                    Some(Token::Field(s)) => s,
                    _ => return Err(ParseError::MissingValue(field)),
                };
                
                Ok(Query::Search(SearchQuery {
                    field: search_field,
                    operator,
                    value,
                }))
            }
            Some(Token::String(value)) => {
                let value = value.clone();
                self.advance();
                Ok(Query::Search(SearchQuery {
                    field: SearchField::Text,
                    operator: ComparisonOp::Like,
                    value,
                }))
            }
            _ => Err(ParseError::UnexpectedEnd),
        }
    }
}

pub fn parse_query(input: &str) -> Result<Query, ParseError> {
    let mut parser = QueryParser::new(input)?;
    parser.parse()
}
