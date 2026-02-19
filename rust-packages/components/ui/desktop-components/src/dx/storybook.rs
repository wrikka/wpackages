//! Storybook for component showcase
//! 
//! Provides a storybook system for showcasing components

use std::collections::HashMap;

/// Story for a component
#[derive(Debug, Clone)]
pub struct Story {
    pub name: String,
    pub description: String,
    pub code: String,
}

/// Component stories
pub struct ComponentStories {
    component_name: String,
    stories: Vec<Story>,
}

impl ComponentStories {
    /// Create new component stories
    pub fn new(component_name: String) -> Self {
        Self {
            component_name,
            stories: Vec::new(),
        }
    }

    /// Add a story
    pub fn add_story(&mut self, story: Story) {
        self.stories.push(story);
    }

    /// Get all stories
    pub fn stories(&self) -> &[Story] {
        &self.stories
    }

    /// Get component name
    pub fn component_name(&self) -> &str {
        &self.component_name
    }
}

/// Storybook manager
pub struct Storybook {
    components: HashMap<String, ComponentStories>,
}

impl Storybook {
    /// Create a new storybook
    pub fn new() -> Self {
        Self {
            components: HashMap::new(),
        }
    }

    /// Register a component
    pub fn register_component(&mut self, stories: ComponentStories) {
        self.components.insert(stories.component_name().to_string(), stories);
    }

    /// Get component stories
    pub fn get_component(&self, name: &str) -> Option<&ComponentStories> {
        self.components.get(name)
    }

    /// Get all component names
    pub fn component_names(&self) -> impl Iterator<Item = &str> {
        self.components.keys().map(|s| s.as_str())
    }

    /// Search stories
    pub fn search(&self, query: &str) -> Vec<(&str, &Story)> {
        let mut results = Vec::new();
        
        for (component_name, stories) in &self.components {
            if component_name.to_lowercase().contains(&query.to_lowercase()) {
                for story in stories.stories() {
                    results.push((component_name.as_str(), story));
                }
            } else {
                for story in stories.stories() {
                    if story.name.to_lowercase().contains(&query.to_lowercase()) {
                        results.push((component_name.as_str(), story));
                    }
                }
            }
        }
        
        results
    }
}

impl Default for Storybook {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_storybook() {
        let mut storybook = Storybook::new();
        let mut stories = ComponentStories::new("Button".to_string());
        
        stories.add_story(Story {
            name: "Primary".to_string(),
            description: "Primary button".to_string(),
            code: "button()".to_string(),
        });
        
        storybook.register_component(stories);
        assert!(storybook.get_component("Button").is_some());
    }
}
