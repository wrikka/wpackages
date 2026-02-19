use crate::components::graph::build_dependency_graph;
use crate::types::workspace::Workspace;
use std::collections::{BTreeSet, HashSet, VecDeque};
use std::path::Path;

pub fn affected_projects_from_files(
    workspaces: &[Workspace],
    changed_files: &[String],
) -> BTreeSet<String> {
    let mut directly = BTreeSet::new();

    for file in changed_files {
        let file_path = Path::new(file);
        for ws in workspaces {
            if file_path.starts_with(&ws.path) {
                directly.insert(ws.package_json.name.clone());
            }
        }
    }

    expand_dependents(workspaces, &directly)
}

pub fn expand_dependents(workspaces: &[Workspace], roots: &BTreeSet<String>) -> BTreeSet<String> {
    let (graph, node_map) = build_dependency_graph(workspaces);

    let mut visited = HashSet::new();
    let mut out = BTreeSet::new();
    let mut queue = VecDeque::new();

    for name in roots {
        if let Some(&idx) = node_map.get(name) {
            visited.insert(idx);
            queue.push_back(idx);
            out.insert(name.clone());
        }
    }

    while let Some(idx) = queue.pop_front() {
        for next in graph.neighbors_directed(idx, petgraph::Direction::Outgoing) {
            if visited.insert(next) {
                let name = graph[next].clone();
                out.insert(name);
                queue.push_back(next);
            }
        }
    }

    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::workspace::{PackageJson, Workspace};
    use std::collections::HashMap;
    use std::path::PathBuf;

    fn ws(name: &str, path: &str, deps: &[&str]) -> Workspace {
        let mut dependencies = HashMap::new();
        for d in deps {
            dependencies.insert(d.to_string(), "workspace:*".to_string());
        }

        Workspace {
            path: PathBuf::from(path),
            package_json: PackageJson {
                name: name.to_string(),
                dependencies,
                scripts: HashMap::new(),
            },
        }
    }

    #[test]
    fn affected_includes_dependents() {
        // a -> b -> c  (b depends on a, c depends on b)
        let a = ws("a", "packages/a", &[]);
        let b = ws("b", "packages/b", &["a"]);
        let c = ws("c", "packages/c", &["b"]);

        let workspaces = vec![a, b, c];
        let changed = vec!["packages/a/src/index.ts".to_string()];

        let affected = affected_projects_from_files(&workspaces, &changed);
        let names = affected.into_iter().collect::<Vec<_>>();
        assert_eq!(
            names,
            vec!["a".to_string(), "b".to_string(), "c".to_string()]
        );
    }

    #[test]
    fn affected_empty_when_no_match() {
        let a = ws("a", "packages/a", &[]);
        let workspaces = vec![a];
        let changed = vec!["README.md".to_string()];
        let affected = affected_projects_from_files(&workspaces, &changed);
        assert!(affected.is_empty());
    }
}
