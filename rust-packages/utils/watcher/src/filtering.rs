use crate::config::Filtering as FilteringConfig;
use ignore::gitignore::{Gitignore, GitignoreBuilder};
use regex::RegexSet;
use std::path::Path;

/// Determines if a path should be processed based on filtering rules.
pub struct PathFilter {
    config: FilteringConfig,
    include: Option<RegexSet>,
    exclude: Option<RegexSet>,
    vcs_ignore: Option<Gitignore>,
}

impl PathFilter {
    pub fn new(config: FilteringConfig, root_path: &Path) -> Result<Self, anyhow::Error> {
        let include = if config.include.is_empty() {
            None
        } else {
            Some(RegexSet::new(&config.include)?)
        };

        let exclude = if config.exclude.is_empty() {
            None
        } else {
            Some(RegexSet::new(&config.exclude)?)
        };

        let vcs_ignore = if config.ignore_vcs {
            let mut builder = GitignoreBuilder::new(root_path);
            // In a real implementation, we would add relevant .gitignore files.
            // For now, we create an empty one.
            Some(builder.build()?)
        } else {
            None
        };

        Ok(Self {
            config,
            include,
            exclude,
            vcs_ignore,
        })
    }

    /// Checks if a given path should be ignored.
    pub fn is_ignored(&self, path: &Path) -> bool {
        if let Some(vcs_ignore) = &self.vcs_ignore {
            if vcs_ignore.matched(path, path.is_dir()).is_ignore() {
                return true;
            }
        }

        let path_str = path.to_string_lossy();

        if let Some(exclude) = &self.exclude {
            if exclude.is_match(&path_str) {
                return true;
            }
        }

        if let Some(include) = &self.include {
            if !include.is_match(&path_str) {
                return true;
            }
        }

        false
    }
}
