use std::fs::File;
use std::io::Write;
use std::path::PathBuf;

pub(crate) fn export_diff_to_file(comparison: &crate::types::commit_comparison::ComparisonResult) -> Result<(), Box<dyn std::error::Error>> {
    let mut path = PathBuf::from("diff_export.txt");
    let mut counter = 1;

    while path.exists() {
        path = PathBuf::from(format!("diff_export_{}.txt", counter));
        counter += 1;
    }

    let mut file = File::create(&path)?;

    writeln!(file, "Commit Comparison Export")?;
    writeln!(file, "========================")?;
    writeln!(file, "Total Files: {}", comparison.stats.total_files)?;
    writeln!(file, "Added Files: {}", comparison.stats.added_files)?;
    writeln!(file, "Modified Files: {}", comparison.stats.modified_files)?;
    writeln!(file, "Deleted Files: {}", comparison.stats.deleted_files)?;
    writeln!(file, "Total Additions: +{}", comparison.stats.total_additions)?;
    writeln!(file, "Total Deletions: -{}", comparison.stats.total_deletions)?;
    writeln!(file)?;

    for file in &comparison.files {
        writeln!(file, "File: {}", file.path)?;
        writeln!(file, "Status: {:?}", file.status)?;
        writeln!(file, "Additions: +{}", file.additions)?;
        writeln!(file, "Deletions: -{}", file.deletions)?;
        writeln!(file)?;
    }

    Ok(())
}
