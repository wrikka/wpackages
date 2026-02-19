//! # Unification Engine
//! Implements the unification algorithm for pattern matching with variables.

use super::symbolic::{Fact, Term};
use std::collections::HashMap;

/// A substitution is a mapping from variable names to terms.
pub type Substitution = HashMap<String, Term>;

/// Unifies two facts. Returns a substitution if they can be unified, otherwise None.
pub fn unify_facts(f1: &Fact, f2: &Fact, subst: &Substitution) -> Option<Substitution> {
    if f1.predicate != f2.predicate || f1.arguments.len() != f2.arguments.len() {
        return None;
    }

    let mut current_subst = subst.clone();
    for (a1, a2) in f1.arguments.iter().zip(f2.arguments.iter()) {
        match unify(a1, a2, &current_subst) {
            Some(new_subst) => current_subst = new_subst,
            None => return None,
        }
    }
    Some(current_subst)
}

/// Unifies two terms under a given substitution.
/// Returns a new substitution if successful, otherwise None.
pub fn unify(t1: &Term, t2: &Term, subst: &Substitution) -> Option<Substitution> {
    match (apply(t1, subst), apply(t2, subst)) {
        (Term::Constant(c1), Term::Constant(c2)) if c1 == c2 => Some(subst.clone()),
        (Term::Number(n1), Term::Number(n2)) if (n1.0 - n2.0).abs() < f64::EPSILON => {
            Some(subst.clone())
        }
        (Term::Boolean(b1), Term::Boolean(b2)) if b1 == b2 => Some(subst.clone()),
        (Term::Variable(v), t) | (t, Term::Variable(v)) => unify_variable(&v, &t, subst),
        (Term::Complex(f1), Term::Complex(f2)) => unify_facts(&f1, &f2, subst),
        _ => None,
    }
}

/// Binds a variable to a term, performing the occurs check.
fn unify_variable(var: &str, term: &Term, subst: &Substitution) -> Option<Substitution> {
    if let Term::Variable(var2) = term {
        if var == var2 {
            return Some(subst.clone());
        }
    }
    if occurs_check(var, term, subst) {
        return None;
    }
    let mut new_subst = subst.clone();
    new_subst.insert(var.to_string(), term.clone());
    Some(new_subst)
}

/// Applies the current substitution to a term, resolving it to its final value.
pub fn apply(term: &Term, subst: &Substitution) -> Term {
    match term {
        Term::Variable(v) => subst.get(v).map_or(term.clone(), |t| apply(t, subst)),
        Term::Constant(_) | Term::Number(_) | Term::Boolean(_) => term.clone(),
        Term::Complex(fact) => Term::Complex(Box::new(apply_subst_to_fact(fact, subst))),
    }
}

/// Applies a substitution to all terms in a fact.
pub fn apply_subst_to_fact(fact: &Fact, subst: &Substitution) -> Fact {
    Fact {
        predicate: fact.predicate.clone(),
        arguments: fact.arguments.iter().map(|arg| apply(arg, subst)).collect(),
    }
}

/// Performs the occurs check to prevent infinite recursive unification.
fn occurs_check(var: &str, term: &Term, subst: &Substitution) -> bool {
    match apply(term, subst) {
        Term::Variable(v) => var == v,
        Term::Constant(_) | Term::Number(_) | Term::Boolean(_) => false,
        Term::Complex(fact) => fact
            .arguments
            .iter()
            .any(|arg| occurs_check(var, arg, subst)),
    }
}

/// Extension trait for Substitution with helper methods
pub trait SubstitutionExt {
    /// Creates a new empty substitution
    fn new() -> Self;
    /// Gets a variable's value
    fn get_var(&self, var: &str) -> Option<&Term>;
    /// Binds a variable to a term
    fn bind(&mut self, var: impl Into<String>, term: Term);
}

impl SubstitutionExt for Substitution {
    fn new() -> Self {
        HashMap::new()
    }

    fn get_var(&self, var: &str) -> Option<&Term> {
        self.get(var)
    }

    fn bind(&mut self, var: impl Into<String>, term: Term) {
        self.insert(var.into(), term);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_unify_constants() {
        let subst = Substitution::new();
        let result = unify(
            &Term::constant("a"),
            &Term::constant("a"),
            &subst,
        );
        assert!(result.is_some());
    }

    #[test]
    fn test_unify_different_constants() {
        let subst = Substitution::new();
        let result = unify(
            &Term::constant("a"),
            &Term::constant("b"),
            &subst,
        );
        assert!(result.is_none());
    }

    #[test]
    fn test_unify_variable_with_constant() {
        let subst = Substitution::new();
        let result = unify(
            &Term::variable("X"),
            &Term::constant("a"),
            &subst,
        );
        assert!(result.is_some());
        let new_subst = result.unwrap();
        assert_eq!(new_subst.get_var("X"), Some(&Term::constant("a")));
    }

    #[test]
    fn test_unify_facts() {
        let subst = Substitution::new();
        let f1 = Fact::binary("is", Term::variable("X"), Term::constant("man"));
        let f2 = Fact::binary("is", Term::constant("Socrates"), Term::constant("man"));

        let result = unify_facts(&f1, &f2, &subst);
        assert!(result.is_some());
        let new_subst = result.unwrap();
        assert_eq!(new_subst.get_var("X"), Some(&Term::constant("Socrates")));
    }

    #[test]
    fn test_apply_substitution() {
        let mut subst = Substitution::new();
        subst.bind("X", Term::constant("Socrates"));

        let fact = Fact::binary("is", Term::variable("X"), Term::constant("mortal"));
        let applied = apply_subst_to_fact(&fact, &subst);

        assert_eq!(
            applied,
            Fact::binary("is", Term::constant("Socrates"), Term::constant("mortal"))
        );
    }

    #[test]
    fn test_occurs_check() {
        let subst = Substitution::new();
        // X = f(X) should fail
        let result = unify(
            &Term::variable("X"),
            &Term::Complex(Box::new(Fact::unary("f", Term::variable("X")))),
            &subst,
        );
        assert!(result.is_none());
    }
}
