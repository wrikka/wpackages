use crate::error::{TestingError, TestingResult};
use crate::types::{TestCase, TestCaseId};
use petgraph::{graph::{DiGraph, NodeIndex}, visit::EdgeRef};
use petgraph::Direction;
use std::collections::{HashMap, HashSet, VecDeque};
use tracing::{debug, info, warn};

#[derive(Debug, Clone)]
pub struct DependencyGraph {
    graph: DiGraph<TestCaseId, DependencyEdge>,
    node_indices: HashMap<String, NodeIndex>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DependencyType {
    MustPassBefore,
    MustRunAfter,
    SameGroup,
    Exclusive,
}

#[derive(Debug, Clone)]
pub struct DependencyEdge {
    pub dependency_type: DependencyType,
    pub description: Option<String>,
}

impl Default for DependencyEdge {
    fn default() -> Self {
        Self {
            dependency_type: DependencyType::MustPassBefore,
            description: None,
        }
    }
}

impl DependencyGraph {
    pub fn new() -> Self {
        Self {
            graph: DiGraph::new(),
            node_indices: HashMap::new(),
        }
    }

    pub fn add_test(&mut self, test_id: &TestCaseId) -> NodeIndex {
        if let Some(&idx) = self.node_indices.get(test_id.as_str()) {
            return idx;
        }

        let idx = self.graph.add_node(test_id.clone());
        self.node_indices.insert(test_id.as_str().to_string(), idx);
        idx
    }

    pub fn add_dependency(
        &mut self,
        from: &TestCaseId,
        to: &TestCaseId,
        dep_type: DependencyType,
    ) -> TestingResult<()> {
        let from_idx = self.add_test(from);
        let to_idx = self.add_test(to);

        let edge = DependencyEdge {
            dependency_type: dep_type,
            description: None,
        };

        self.graph.add_edge(from_idx, to_idx, edge);

        if self.has_cycle() {
            self.graph.remove_edge(
                petgraph::algo::toposort(&self.graph, None)
                    .err()
                    .and_then(|_| self.graph.edges_connecting(from_idx, to_idx).next())
                    .map(|e| e.id())
                    .unwrap(),
            );
            return Err(TestingError::dependency_cycle(format!(
                "Adding dependency from {} to {} would create a cycle",
                from, to
            )));
        }

        Ok(())
    }

    pub fn has_cycle(&self) -> bool {
        petgraph::algo::toposort(&self.graph, None).is_err()
    }

    pub fn topological_sort(&self) -> TestingResult<Vec<TestCaseId>> {
        let sorted = petgraph::algo::toposort(&self.graph, None)
            .map_err(|_| TestingError::dependency_cycle("Graph contains a cycle"))?;

        Ok(sorted.into_iter().map(|idx| self.graph[idx].clone()).collect())
    }

    pub fn execution_order(&self, tests: &[TestCase]) -> TestingResult<Vec<TestCase>> {
        let mut sorted_ids = self.topological_sort()?;
        let test_map: HashMap<String, &TestCase> = tests
            .iter()
            .map(|t| (t.id.as_str().to_string(), t))
            .collect();

        let mut ordered = Vec::with_capacity(tests.len());
        for id in sorted_ids {
            if let Some(test) = test_map.get(id.as_str()) {
                ordered.push((*test).clone());
            }
        }

        for test in tests {
            if !ordered.iter().any(|t| t.id == test.id) {
                ordered.push(test.clone());
            }
        }

        Ok(ordered)
    }

    pub fn get_dependencies(&self, test_id: &TestCaseId) -> Vec<TestCaseId> {
        if let Some(&idx) = self.node_indices.get(test_id.as_str()) {
            self.graph
                .neighbors_directed(idx, Direction::Outgoing)
                .map(|n| self.graph[n].clone())
                .collect()
        } else {
            Vec::new()
        }
    }

    pub fn get_dependents(&self, test_id: &TestCaseId) -> Vec<TestCaseId> {
        if let Some(&idx) = self.node_indices.get(test_id.as_str()) {
            self.graph
                .neighbors_directed(idx, Direction::Incoming)
                .map(|n| self.graph[n].clone())
                .collect()
        } else {
            Vec::new()
        }
    }

    pub fn find_cycles(&self) -> Vec<Vec<TestCaseId>> {
        let mut cycles = Vec::new();
        let mut visited = HashSet::new();
        let mut rec_stack = HashSet::new();
        let mut path = Vec::new();

        for node_idx in self.graph.node_indices() {
            if !visited.contains(&node_idx) {
                self.find_cycles_dfs(node_idx, &mut visited, &mut rec_stack, &mut path, &mut cycles);
            }
        }

        cycles
    }

    fn find_cycles_dfs(
        &self,
        node: NodeIndex,
        visited: &mut HashSet<NodeIndex>,
        rec_stack: &mut HashSet<NodeIndex>,
        path: &mut Vec<NodeIndex>,
        cycles: &mut Vec<Vec<TestCaseId>>,
    ) {
        visited.insert(node);
        rec_stack.insert(node);
        path.push(node);

        for neighbor in self.graph.neighbors_directed(node, Direction::Outgoing) {
            if !visited.contains(&neighbor) {
                self.find_cycles_dfs(neighbor, visited, rec_stack, path, cycles);
            } else if rec_stack.contains(&neighbor) {
                let cycle_start = path.iter().position(|&n| n == neighbor).unwrap_or(0);
                let cycle: Vec<TestCaseId> = path[cycle_start..]
                    .iter()
                    .map(|&n| self.graph[n].clone())
                    .collect();
                cycles.push(cycle);
            }
        }

        path.pop();
        rec_stack.remove(&node);
    }

    pub fn parallel_groups(&self) -> Vec<Vec<TestCaseId>> {
        let mut groups: Vec<Vec<TestCaseId>> = Vec::new();
        let mut assigned: HashSet<String> = HashSet::new();

        let sorted = self.topological_sort().unwrap_or_default();

        for test_id in sorted {
            if assigned.contains(test_id.as_str()) {
                continue;
            }

            let mut group = vec![test_id.clone()];
            assigned.insert(test_id.as_str().to_string());

            let deps: HashSet<String> = self.get_dependencies(&test_id)
                .iter()
                .map(|id| id.as_str().to_string())
                .collect();

            for other in self.node_indices.keys() {
                if assigned.contains(other) {
                    continue;
                }

                let other_deps: HashSet<String> = self
                    .get_dependencies(&TestCaseId::new(other))
                    .iter()
                    .map(|id| id.as_str().to_string())
                    .collect();

                if deps.is_disjoint(&other_deps) {
                    group.push(TestCaseId::new(other));
                    assigned.insert(other.clone());
                }
            }

            groups.push(group);
        }

        groups
    }

    pub fn node_count(&self) -> usize {
        self.graph.node_count()
    }

    pub fn edge_count(&self) -> usize {
        self.graph.edge_count()
    }
}

impl Default for DependencyGraph {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Default)]
pub struct DependencyResolver {
    graph: DependencyGraph,
}

impl DependencyResolver {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn add_test(&mut self, test: &TestCase) {
        self.graph.add_test(&test.id);

        for dep in &test.dependencies {
            if let Err(e) = self.graph.add_dependency(&test.id, dep, DependencyType::MustPassBefore) {
                warn!("Failed to add dependency: {}", e);
            }
        }
    }

    pub fn resolve(&self, tests: &[TestCase]) -> TestingResult<Vec<TestCase>> {
        self.graph.execution_order(tests)
    }

    pub fn get_parallel_groups(&self) -> Vec<Vec<TestCaseId>> {
        self.graph.parallel_groups()
    }

    pub fn validate(&self) -> TestingResult<()> {
        let cycles = self.graph.find_cycles();
        if !cycles.is_empty() {
            let cycle_str = cycles
                .iter()
                .map(|c| c.iter().map(|id| id.to_string()).collect::<Vec<_>>().join(" -> "))
                .collect::<Vec<_>>()
                .join("; ");
            return Err(TestingError::dependency_cycle(format!("Found cycles: {}", cycle_str)));
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn create_test(id: &str, deps: Vec<&str>) -> TestCase {
        let mut test = TestCase::new(id, format!("test_{}", id), PathBuf::from("test.rs"), 1);
        for dep in deps {
            test = test.with_dependency(TestCaseId::new(dep));
        }
        test
    }

    #[test]
    fn test_dependency_graph_basic() {
        let mut graph = DependencyGraph::new();

        graph.add_test(&TestCaseId::new("a"));
        graph.add_test(&TestCaseId::new("b"));

        graph.add_dependency(
            &TestCaseId::new("a"),
            &TestCaseId::new("b"),
            DependencyType::MustPassBefore,
        ).unwrap();

        assert_eq!(graph.node_count(), 2);
        assert_eq!(graph.edge_count(), 1);
    }

    #[test]
    fn test_topological_sort() {
        let mut graph = DependencyGraph::new();

        graph.add_test(&TestCaseId::new("a"));
        graph.add_test(&TestCaseId::new("b"));
        graph.add_test(&TestCaseId::new("c"));

        graph.add_dependency(&TestCaseId::new("a"), &TestCaseId::new("b"), DependencyType::MustPassBefore).unwrap();
        graph.add_dependency(&TestCaseId::new("b"), &TestCaseId::new("c"), DependencyType::MustPassBefore).unwrap();

        let sorted = graph.topological_sort().unwrap();
        assert_eq!(sorted.len(), 3);
        assert!(sorted.iter().position(|id| id.as_str() == "a").unwrap() < sorted.iter().position(|id| id.as_str() == "b").unwrap());
    }

    #[test]
    fn test_cycle_detection() {
        let mut graph = DependencyGraph::new();

        graph.add_test(&TestCaseId::new("a"));
        graph.add_test(&TestCaseId::new("b"));

        graph.add_dependency(&TestCaseId::new("a"), &TestCaseId::new("b"), DependencyType::MustPassBefore).unwrap();
        let result = graph.add_dependency(&TestCaseId::new("b"), &TestCaseId::new("a"), DependencyType::MustPassBefore);

        assert!(result.is_err());
    }

    #[test]
    fn test_resolver() {
        let mut resolver = DependencyResolver::new();

        let tests = vec![
            create_test("a", vec![]),
            create_test("b", vec!["a"]),
            create_test("c", vec!["b"]),
        ];

        for test in &tests {
            resolver.add_test(test);
        }

        let ordered = resolver.resolve(&tests).unwrap();
        assert_eq!(ordered.len(), 3);
    }
}
