//! # Symbolic Reasoning Types
//! Core data structures for symbolic logic programming: Terms, Facts, Rules, and KnowledgeBase.

use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::fmt;

/// Represents a term in a logical expression, which can be a constant, variable, number, boolean, or complex fact.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Term {
    /// A constant value, e.g., "Socrates"
    Constant(String),
    /// A variable, e.g., "X"
    Variable(String),
    /// A numeric value
    Number(#[serde(with = "serde_f64")] OrderedFloat),
    /// A boolean value
    Boolean(bool),
    /// A complex term containing another fact
    Complex(Box<Fact>),
}

/// Helper for serializing f64 with Eq semantics
mod serde_f64 {
    use serde::{Deserialize, Deserializer, Serialize, Serializer};

    #[derive(Debug, Clone, PartialEq, Eq, Hash)]
    pub struct OrderedFloat(pub f64);

    impl Serialize for OrderedFloat {
        fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: Serializer,
        {
            serializer.serialize_f64(self.0)
        }
    }

    impl<'de> Deserialize<'de> for OrderedFloat {
        fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
        where
            D: Deserializer<'de>,
        {
            let f = f64::deserialize(deserializer)?;
            Ok(OrderedFloat(f))
        }
    }
}

impl Term {
    /// Creates a constant term
    pub fn constant(s: impl Into<String>) -> Self {
        Term::Constant(s.into())
    }

    /// Creates a variable term
    pub fn variable(s: impl Into<String>) -> Self {
        Term::Variable(s.into())
    }

    /// Creates a number term
    pub fn number(n: f64) -> Self {
        Term::Number(OrderedFloat(n))
    }

    /// Creates a boolean term
    pub fn boolean(b: bool) -> Self {
        Term::Boolean(b)
    }

    /// Checks if this term is a variable
    pub fn is_variable(&self) -> bool {
        matches!(self, Term::Variable(_))
    }

    /// Checks if this term is a constant
    pub fn is_constant(&self) -> bool {
        matches!(self, Term::Constant(_))
    }

    /// Gets the variable name if this is a variable
    pub fn as_variable(&self) -> Option<&str> {
        match self {
            Term::Variable(v) => Some(v),
            _ => None,
        }
    }

    /// Gets the constant value if this is a constant
    pub fn as_constant(&self) -> Option<&str> {
        match self {
            Term::Constant(c) => Some(c),
            _ => None,
        }
    }
}

impl fmt::Display for Term {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Term::Constant(c) => write!(f, "{}", c),
            Term::Variable(v) => write!(f, "?{}", v),
            Term::Number(n) => write!(f, "{}", n.0),
            Term::Boolean(b) => write!(f, "{}", b),
            Term::Complex(fact) => write!(f, "{}", fact),
        }
    }
}

impl From<f64> for Term {
    fn from(n: f64) -> Self {
        Term::number(n)
    }
}

impl From<bool> for Term {
    fn from(b: bool) -> Self {
        Term::boolean(b)
    }
}

impl From<String> for Term {
    fn from(s: String) -> Self {
        Term::constant(s)
    }
}

impl From<&str> for Term {
    fn from(s: &str) -> Self {
        Term::constant(s)
    }
}

/// A structured representation of a fact, e.g., `is(Socrates, man)`.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Fact {
    /// The predicate name, e.g., "is"
    pub predicate: String,
    /// The arguments of the fact
    pub arguments: Vec<Term>,
}

impl Fact {
    /// Creates a new fact with the given predicate and arguments
    pub fn new(predicate: impl Into<String>, arguments: Vec<Term>) -> Self {
        Self {
            predicate: predicate.into(),
            arguments,
        }
    }

    /// Creates a fact with no arguments (a proposition)
    pub fn proposition(predicate: impl Into<String>) -> Self {
        Self::new(predicate, Vec::new())
    }

    /// Creates a fact with a single argument
    pub fn unary(predicate: impl Into<String>, arg: Term) -> Self {
        Self::new(predicate, vec![arg])
    }

    /// Creates a fact with two arguments (binary relation)
    pub fn binary(predicate: impl Into<String>, arg1: Term, arg2: Term) -> Self {
        Self::new(predicate, vec![arg1, arg2])
    }

    /// Creates a fact with three arguments (ternary relation)
    pub fn ternary(predicate: impl Into<String>, arg1: Term, arg2: Term, arg3: Term) -> Self {
        Self::new(predicate, vec![arg1, arg2, arg3])
    }
}

impl fmt::Display for Fact {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let args = self
            .arguments
            .iter()
            .map(|a| a.to_string())
            .collect::<Vec<_>>()
            .join(", ");
        write!(f, "{}({})", self.predicate, args)
    }
}

/// A rule in the form: `consequent :- antecedent1, antecedent2, ...`
/// Represents: IF all antecedents are true, THEN consequent is true.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Rule {
    /// The conditions that must be satisfied (the "if" part)
    pub antecedents: Vec<Fact>,
    /// The conclusion when all antecedents are satisfied (the "then" part)
    pub consequent: Fact,
}

impl Rule {
    /// Creates a new rule with the given antecedents and consequent
    pub fn new(antecedents: Vec<Fact>, consequent: Fact) -> Self {
        Self {
            antecedents,
            consequent,
        }
    }

    /// Creates a rule with a single antecedent
    pub fn simple(antecedent: Fact, consequent: Fact) -> Self {
        Self::new(vec![antecedent], consequent)
    }

    /// Creates a rule with no antecedents (a fact assertion)
    pub fn axiom(consequent: Fact) -> Self {
        Self::new(Vec::new(), consequent)
    }
}

impl fmt::Display for Rule {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if self.antecedents.is_empty() {
            write!(f, "{}.", self.consequent)
        } else {
            let ants = self
                .antecedents
                .iter()
                .map(|a| a.to_string())
                .collect::<Vec<_>>()
                .join(", ");
            write!(f, "{} :- {}.", self.consequent, ants)
        }
    }
}

/// A knowledge base holding facts and rules for reasoning.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct KnowledgeBase {
    /// The set of known facts
    pub facts: HashSet<Fact>,
    /// The rules for deriving new facts
    pub rules: Vec<Rule>,
}

impl KnowledgeBase {
    /// Creates a new empty knowledge base
    pub fn new() -> Self {
        Self::default()
    }

    /// Adds a fact to the knowledge base
    pub fn add_fact(&mut self, fact: Fact) -> &mut Self {
        self.facts.insert(fact);
        self
    }

    /// Adds multiple facts to the knowledge base
    pub fn add_facts(&mut self, facts: impl IntoIterator<Item = Fact>) -> &mut Self {
        for fact in facts {
            self.facts.insert(fact);
        }
        self
    }

    /// Adds a rule to the knowledge base
    pub fn add_rule(&mut self, rule: Rule) -> &mut Self {
        self.rules.push(rule);
        self
    }

    /// Adds multiple rules to the knowledge base
    pub fn add_rules(&mut self, rules: impl IntoIterator<Item = Rule>) -> &mut Self {
        for rule in rules {
            self.rules.push(rule);
        }
        self
    }

    /// Checks if a fact is in the knowledge base
    pub fn contains_fact(&self, fact: &Fact) -> bool {
        self.facts.contains(fact)
    }

    /// Gets the number of facts
    pub fn fact_count(&self) -> usize {
        self.facts.len()
    }

    /// Gets the number of rules
    pub fn rule_count(&self) -> usize {
        self.rules.len()
    }

    /// Clears all facts and rules
    pub fn clear(&mut self) {
        self.facts.clear();
        self.rules.clear();
    }

    /// Returns an iterator over all facts
    pub fn iter_facts(&self) -> impl Iterator<Item = &Fact> {
        self.facts.iter()
    }

    /// Returns an iterator over all rules
    pub fn iter_rules(&self) -> impl Iterator<Item = &Rule> {
        self.rules.iter()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_term_creation() {
        let constant = Term::constant("Socrates");
        assert!(constant.is_constant());
        assert_eq!(constant.as_constant(), Some("Socrates"));

        let variable = Term::variable("X");
        assert!(variable.is_variable());
        assert_eq!(variable.as_variable(), Some("X"));

        let number = Term::number(42.0);
        assert!(matches!(number, Term::Number(_)));

        let boolean = Term::boolean(true);
        assert!(matches!(boolean, Term::Boolean(true)));
    }

    #[test]
    fn test_fact_creation() {
        let fact = Fact::binary("is", Term::constant("Socrates"), Term::constant("man"));
        assert_eq!(fact.predicate, "is");
        assert_eq!(fact.arguments.len(), 2);
        assert_eq!(fact.to_string(), "is(Socrates, man)");
    }

    #[test]
    fn test_rule_creation() {
        let rule = Rule::simple(
            Fact::binary("is", Term::variable("X"), Term::constant("man")),
            Fact::binary("is", Term::variable("X"), Term::constant("mortal")),
        );
        assert_eq!(rule.antecedents.len(), 1);
        assert_eq!(rule.to_string(), "is(?X, mortal) :- is(?X, man).");
    }

    #[test]
    fn test_knowledge_base() {
        let mut kb = KnowledgeBase::new();
        kb.add_fact(Fact::binary("is", Term::constant("Socrates"), Term::constant("man")));
        kb.add_rule(Rule::simple(
            Fact::binary("is", Term::variable("X"), Term::constant("man")),
            Fact::binary("is", Term::variable("X"), Term::constant("mortal")),
        ));

        assert_eq!(kb.fact_count(), 1);
        assert_eq!(kb.rule_count(), 1);
    }

    #[test]
    fn test_term_display() {
        assert_eq!(Term::constant("hello").to_string(), "hello");
        assert_eq!(Term::variable("X").to_string(), "?X");
        assert_eq!(Term::number(3.14).to_string(), "3.14");
        assert_eq!(Term::boolean(true).to_string(), "true");
    }
}
