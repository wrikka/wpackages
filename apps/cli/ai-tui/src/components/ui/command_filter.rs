use super::command_fuzzy::FuzzyMatch;
use super::command_types::Command;

pub fn filter_commands(commands: &[Command], query: &str) -> Vec<(usize, FuzzyMatch)> {
    let query = query.trim();
    let mut filtered = Vec::new();

    if query.is_empty() {
        filtered = commands
            .iter()
            .enumerate()
            .map(|(idx, _)| (idx, FuzzyMatch::new(1.0, Vec::new())))
            .collect();
    } else {
        for (idx, cmd) in commands.iter().enumerate() {
            let search_text = format!("{} {}", cmd.name, cmd.description);
            if let Some(match_result) = FuzzyMatch::fuzzy_match(query, &search_text) {
                filtered.push((idx, match_result));
            }
        }

        filtered.sort_by(|a, b| b.1.score.value().partial_cmp(&a.1.score.value()).unwrap());
    }

    filtered
}
