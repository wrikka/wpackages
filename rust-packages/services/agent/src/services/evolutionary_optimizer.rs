//! services/evolutionary_optimizer.rs

use crate::types::evolution::AgentGenome;
use rand::seq::SliceRandom;
use rand::Rng;

/// A service that uses a genetic algorithm to optimize a population of agents.
#[derive(Clone, Default)]
pub struct EvolutionaryOptimizer;

impl EvolutionaryOptimizer {
    pub fn new() -> Self {
        Self::default()
    }

    /// Runs the evolutionary process for a given number of generations.
    pub async fn run_evolution(&self, initial_population: &mut Vec<AgentGenome>, generations: u32) {
        for i in 0..generations {
            println!("--- Generation {} ---", i + 1);

            // 1. Evaluate fitness (placeholder)
            self.evaluate_fitness(initial_population).await;

            // 2. Select the fittest individuals
            let parents = self.select_fittest(initial_population);

            // 3. Create the next generation through crossover and mutation
            let mut next_generation = self.crossover_and_mutate(&parents);

            // Replace the old population with the new one
            *initial_population = next_generation;
        }
    }

    /// Placeholder for fitness evaluation.
    async fn evaluate_fitness(&self, population: &mut Vec<AgentGenome>) {
        for genome in population {
            // In a real system, this would run the agent and measure its performance.
            genome.fitness = rand::thread_rng().gen_range(0.0..1.0);
        }
    }

    /// Selects the top 50% of the population as parents for the next generation.
    fn select_fittest(&self, population: &[AgentGenome]) -> Vec<AgentGenome> {
        let mut sorted_population = population.to_vec();
        sorted_population.sort_by(|a, b| b.fitness.partial_cmp(&a.fitness).unwrap());
        sorted_population.truncate(population.len() / 2);
        sorted_population
    }

    /// Creates a new generation by combining and mutating parent genomes.
    fn crossover_and_mutate(&self, parents: &[AgentGenome]) -> Vec<AgentGenome> {
        let mut next_generation = parents.to_vec(); // Elitism
        let mut rng = rand::thread_rng();

        while next_generation.len() < parents.len() * 2 {
            let parent1 = parents.choose(&mut rng).unwrap();
            let parent2 = parents.choose(&mut rng).unwrap();

            // Crossover (simplified)
            let mut child_id = parent1.id.clone();
            // Mutation (simplified)
            if rng.gen_bool(0.1) { // 10% mutation chance
                child_id.push_str("_mutated");
            }

            next_generation.push(AgentGenome { id: child_id, fitness: 0.0 });
        }
        next_generation
    }
}
