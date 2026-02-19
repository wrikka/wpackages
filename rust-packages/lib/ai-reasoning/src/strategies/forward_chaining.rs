//! # Forward Chaining Strategy
//! A data-driven reasoning approach that starts with known facts and applies rules to derive conclusions.

use crate::common::Error;
use crate::core::SymbolicReasoner;
use crate::formalism::{apply_subst_to_fact, unify_facts, Fact, Rule, State, Substitution, SubstitutionExt};
use async_trait::async_trait;

/// A forward-chaining reasoning strategy that supports variables and unification.
#[derive(Default, Debug)]
pub struct ForwardChainingStrategy {
    max_iterations: u32,
}

impl ForwardChainingStrategy {
    /// Creates a new forward chaining strategy
    pub fn new() -> Self {
        Self::default()
    }

    /// Creates a strategy with a maximum number of iterations
    pub fn with_max_iterations(max_iterations: u32) -> Self {
        Self { max_iterations }
    }

    /// Finds all substitutions that satisfy a rule's antecedents
    fn find_substitutions_for_rule(&self, rule: &Rule, facts: &[Fact]) -> Vec<Substitution> {
        self.find_substitutions_recursive(&rule.antecedents, Substitution::new(), facts)
    }

    /// Recursively finds substitutions for antecedents
    fn find_substitutions_recursive(
        &self,
        antecedents: &[Fact],
        initial_subst: Substitution,
        facts: &[Fact],
    ) -> Vec<Substitution> {
        if antecedents.is_empty() {
            return vec![initial_subst];
        }

        let mut solutions = Vec::new();
        let first_antecedent = &antecedents[0];

        for fact in facts {
            if let Some(unified_subst) = unify_facts(first_antecedent, fact, &initial_subst) {
                let sub_solutions = self
                    .find_substitutions_recursive(&antecedents[1..], unified_subst, facts);
                solutions.extend(sub_solutions);
            }
        }

        solutions
    }
}

#[async_trait]
impl SymbolicReasoner for ForwardChainingStrategy {
    fn name(&self) -> &str {
        "ForwardChainingStrategy"
    }

    async fn reason_symbolic(&self, state: &mut State) -> Result<(), Error> {
        let mut iterations = 0u32;
        
        loop {
            if iterations >= self.max_iterations {
                break;
            }
            iterations += 1;

            let mut new_facts_found = false;
            let mut derived_facts = Vec::new();

            let facts_snapshot: Vec<_> = state.knowledge_base.facts.iter().cloned().collect();

            for rule in &state.knowledge_base.rules {
                let substitutions = self.find_substitutions_for_rule(rule, &facts_snapshot);

                for subst in substitutions {
                    let new_fact = apply_subst_to_fact(&rule.consequent, &subst);
                    if !state.knowledge_base.facts.contains(&new_fact) {
                        derived_facts.push(new_fact);
                    }
                }
            }

            if !derived_facts.is_empty() {
                new_facts_found = true;
                state.new_facts_derived = true;
                for fact in derived_facts {
                    state.knowledge_base.add_fact(fact);
                }
            }

            if !new_facts_found {
                break;
            }
        }

        state.steps_executed += iterations;
        Ok(())
    }

    async fn query(&self, state: &State, goal: &Fact) -> Result<Vec<Substitution>, Error> {
        // Forward chaining doesn't query - it derives
        // Return empty if fact exists, otherwise check if it can be derived
        if state.knowledge_base.facts.contains(goal) {
            Ok(vec![Substitution::new()])
        } else {
            Ok(Vec::new())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::formalism::{KnowledgeBase, Term};

    #[tokio::test]
    async fn test_forward_chaining_socrates() {
        let mut kb = KnowledgeBase::new();
        kb.add_fact(Fact::binary("is", Term::constant("Socrates"), Term::constant("man")));
        kb.add_rule(Rule::simple(
            Fact::binary("is", Term::variable("X"), Term::constant("man")),
            Fact::binary("is", Term::variable("X"), Term::constant("mortal")),
        ));

        let mut state = State::default();
        state.knowledge_base = kb;

        let strategy = ForwardChainingStrategy::new();
        strategy.reason_symbolic(&mut state).await.unwrap();

        let expected = Fact::binary("is", Term::constant("Socrates"), Term::constant("mortal"));
        assert!(state.knowledge_base.contains_fact(&expected));
    }
}
