//! Spacing tokens for the application

/// Spacing tokens
#[derive(Debug, Clone, Copy)]
pub struct Spacing {
    pub xs: u16,
    pub sm: u16,
    pub md: u16,
    pub lg: u16,
    pub xl: u16,
}

impl Default for Spacing {
    fn default() -> Self {
        Self {
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 6,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_spacing() {
        let spacing = Spacing::default();
        assert_eq!(spacing.xs, 1);
        assert_eq!(spacing.sm, 2);
        assert_eq!(spacing.md, 3);
        assert_eq!(spacing.lg, 4);
        assert_eq!(spacing.xl, 6);
    }
}
