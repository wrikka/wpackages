//! # Backward Chaining Strategy
//! A goal-driven reasoning approach that starts with a query and works backward to find answers.

use crate::common::Error;
use crate::core::SymbolicReasoner;
use crate::formalism::{apply_subst_to_fact, unify_facts, Fact, Rule, State, Substitution, SubstitutionExt, Term};
use async_trait::async_trait;
use std::collections::HashSet;

/// A backward-chaining reasoning strategy that supports variables and unification.
#[derive(Debug)]
pub struct BackwardChainingStrategy {
    /// The goal to solve
    pub goal: Option<Fact>,
    /// Maximum depth for recursive solving
    max_depth: u32,
}

impl Default for BackwardChainingStrategy {
    fn default() -> Self {
        Self {
            goal: None,
            max_depth: 100,
        }
    }
}

impl BackwardChainingStrategy {
    /// Creates a new backward chaining strategy
    pub fn new() -> Self {
        Self::default()
    }

    /// Creates a strategy with a specific goal
    pub fn with_goal(goal: Fact) -> Self {
        Self {
            goal: Some(goal),
            ..Self::default()
        }
    }

    /// Sets the maximum depth for recursive solving
    pub fn with_max_depth(mut self, max_depth: u32) -> Self {
        self.max_depth = max_depth;
        self
    }

    /// Solves a set of goals recursively
    fn solve(
        &self,
        goals: &[Fact],
        subst: Substitution,
        kb: &crate::formalism::KnowledgeBase,
        visited: &mut HashSet<Fact>,
        depth: u32,
    ) -> Vec<Substitution> {
        if goals.is_empty() {
            return vec![subst];
        }

        if depth > self.max_depth {
            return vec![];
        }

        let mut solutions = Vec::new();
        let current_goal = apply_subst_to_fact(&goals[0], &subst);

        if !visited.insert(current_goal.clone()) {
            return vec![]; // Cycle detected
        }

        // Try to unify with facts
        for fact in &kb.facts {
            if let Some(unified_subst) = unify_facts(&current_goal, fact, &subst) {
                solutions.extend(self.solve(&goals[1..], unified_subst, kb, visited, depth + 1));
            }
        }

        // Try to unify with rule consequents
        for (i, rule) in kb.rules.iter().enumerate() {
            let fresh_rule = self.rename_variables(rule, i as u32);
            if let Some(unified_subst) = unify_facts(&current_goal, &fresh_rule.consequent, &subst) {
                let mut new_goals = fresh_rule.antecedents;
                new_goals.extend_from_slice(&goals[1..]);
                solutions.extend(self.solve(&new_goals, unified_subst, kb, visited, depth + 1));
            }
        }

        visited.remove(&current_goal);
        solutions
    }

    /// Renames variables in a rule to avoid conflicts
    fn rename_variables(&self, rule: &Rule, nonce: u32) -> Rule {
        let suffix = format!("_{}", nonce);
        Rule {
            antecedents: rule.antecedents.iter().map(|f| self.rename_variables_in_fact(f, &suffix)).collect(),
            consequent: self.rename_variables_in_fact(&rule.consequent, &suffix),
        }
    }

    /// Renames variables in a fact
    fn rename_variables_in_fact(&self, fact: &Fact, suffix: &str) -> Fact {
        Fact {
            predicate: fact.predicate.clone(),
            arguments: fact.arguments.iter().map(|t| self.rename_term(t, suffix)).collect(),
        }
    }

    /// Renames a term
    fn rename_term(&self, term: &Term, suffix: &str) -> Term {
        match term {
            Term::Variable(v) => Term::Variable(format!("{}{}", v, suffix)),
            Term::Complex(f) => Term::Complex(Box::new(self.rename_variables_in_fact(f, suffix))),
            _ => term.clone(),
        }
    }
}

#[async_trait]
impl SymbolicReasoner for BackwardChainingStrategy {
    fn name(&self) -> &str {
        "BackwardChainingStrategy"
    }

    async fn reason_symbolic(&self, state: &mut State) -> Result<(), Error> {
        if let Some(ref goal) = self.goal {
            let solutions = self.solve(
                &[goal.clone()],
                Substitution::new(),
                &state.knowledge_base,
                &mut HashSet::new(),
                0,
            );

            // Add derived facts to the knowledge base
            for subst in solutions {
                let derived_fact = apply_subst_to_fact(goal, &subst);
                state.knowledge_base.add_fact(derived_fact);
            }
            state.new_facts_derived = true;
        }
        state.steps_executed += 1;
        Ok(())
    }

    async fn query(&self, state: &State, goal: &Fact) -> Result<Vec<Substitution>, Error> {
        let solutions = self.solve(
            &[goal.clone()],
            Substitution::new(),
            &state.knowledge_base,
            &mut HashSet::new(),
            0,
        );
        Ok(solutions)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::formalism::KnowledgeBase;

    #[tokio::test]
    async fn test_backward_chaining_grandparent() {
        let mut kb = KnowledgeBase::new();
        kb.add_fact(Fact::binary("parent", Term::constant("Zeus"), Term::constant("Ares")));
        kb.add_fact(Fact::binary("parent", Term::constant("Hera"), Term::constant("Ares")));
        kb.add_fact(Fact::binary("parent", Term::constant("Ares"), Term::constant("Harmonia")));

        kb.add_rule(Rule::new(
            vec![
                Fact::binary("parent", Term::variable("X"), Term::variable("Y")),
                Fact::binary("parent", Term::variable("Y"), Term::variable("Z")),
            ],
            Fact::binary("grandparent", Term::variable("X"), Term::variable("Z")),
        ));

        let mut state = State::default();
        state.knowledge_base = kb;

        let goal = Fact::binary("grandparent", Term::variable("Who"), Term::constant("Harmonia"));
        let strategy = BackwardChainingStrategy::with_goal(goal);

        let solutions = strategy.query(&state, &Fact::binary(
            "grandparent",
            Term::variable("Who"),
            Term::constant("Harmonia"),
        )).await.unwrap();

        assert_eq!(solutions.len(), 2);
    }
}
