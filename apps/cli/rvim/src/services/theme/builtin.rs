use super::types::{SyntaxHighlightTheme, Theme, ThemeColor, UiTheme};

pub fn all_themes() -> Vec<Theme> {
    vec![
        dark_theme(),
        light_theme(),
        nord_theme(),
        dracula_theme(),
        gruvbox_theme(),
    ]
}

fn dark_theme() -> Theme {
    Theme {
        name: "dark".to_string(),
        background: ThemeColor::new(0, 0, 0),
        foreground: ThemeColor::new(255, 255, 255),
        cursor: ThemeColor::new(255, 255, 255),
        selection: ThemeColor::new(50, 50, 100),
        line_number: ThemeColor::new(100, 100, 100),
        line_number_active: ThemeColor::new(150, 150, 150),
        syntax_highlight: SyntaxHighlightTheme {
            keyword: ThemeColor::new(197, 134, 192),
            string: ThemeColor::new(163, 190, 140),
            function: ThemeColor::new(130, 170, 255),
            variable: ThemeColor::new(224, 226, 228),
            comment: ThemeColor::new(94, 92, 84),
            type_color: ThemeColor::new(86, 182, 194),
            number: ThemeColor::new(229, 192, 123),
            operator: ThemeColor::new(197, 134, 192),
            punctuation: ThemeColor::new(197, 134, 192),
            constant: ThemeColor::new(229, 192, 123),
            attribute: ThemeColor::new(86, 182, 194),
            tag: ThemeColor::new(208, 135, 112),
            special: ThemeColor::new(86, 182, 194),
        },
        ui: UiTheme {
            border: ThemeColor::new(60, 60, 60),
            border_active: ThemeColor::new(100, 100, 100),
            title: ThemeColor::new(150, 150, 150),
            title_active: ThemeColor::new(200, 200, 200),
            command_palette: ThemeColor::new(30, 30, 30),
            file_explorer: ThemeColor::new(20, 20, 20),
        },
    }
}

fn light_theme() -> Theme {
    Theme {
        name: "light".to_string(),
        background: ThemeColor::new(255, 255, 255),
        foreground: ThemeColor::new(0, 0, 0),
        cursor: ThemeColor::new(0, 0, 0),
        selection: ThemeColor::new(200, 200, 255),
        line_number: ThemeColor::new(128, 128, 128),
        line_number_active: ThemeColor::new(0, 0, 0),
        syntax_highlight: SyntaxHighlightTheme {
            keyword: ThemeColor::new(128, 0, 128),
            string: ThemeColor::new(0, 128, 0),
            function: ThemeColor::new(0, 0, 255),
            variable: ThemeColor::new(0, 0, 0),
            comment: ThemeColor::new(128, 128, 128),
            type_color: ThemeColor::new(0, 128, 128),
            number: ThemeColor::new(128, 0, 0),
            operator: ThemeColor::new(128, 0, 128),
            punctuation: ThemeColor::new(128, 0, 128),
            constant: ThemeColor::new(128, 0, 0),
            attribute: ThemeColor::new(0, 128, 128),
            tag: ThemeColor::new(128, 0, 0),
            special: ThemeColor::new(0, 128, 128),
        },
        ui: UiTheme {
            border: ThemeColor::new(200, 200, 200),
            border_active: ThemeColor::new(0, 0, 0),
            title: ThemeColor::new(0, 0, 0),
            title_active: ThemeColor::new(0, 0, 255),
            command_palette: ThemeColor::new(240, 240, 240),
            file_explorer: ThemeColor::new(245, 245, 245),
        },
    }
}

fn nord_theme() -> Theme {
    Theme {
        name: "nord".to_string(),
        background: ThemeColor::new(46, 52, 64),
        foreground: ThemeColor::new(216, 222, 233),
        cursor: ThemeColor::new(136, 192, 208),
        selection: ThemeColor::new(76, 86, 106),
        line_number: ThemeColor::new(94, 129, 172),
        line_number_active: ThemeColor::new(136, 192, 208),
        syntax_highlight: SyntaxHighlightTheme {
            keyword: ThemeColor::new(191, 97, 106),
            string: ThemeColor::new(163, 190, 140),
            function: ThemeColor::new(129, 161, 193),
            variable: ThemeColor::new(216, 222, 233),
            comment: ThemeColor::new(94, 129, 172),
            type_color: ThemeColor::new(129, 161, 193),
            number: ThemeColor::new(235, 203, 139),
            operator: ThemeColor::new(191, 97, 106),
            punctuation: ThemeColor::new(191, 97, 106),
            constant: ThemeColor::new(235, 203, 139),
            attribute: ThemeColor::new(129, 161, 193),
            tag: ThemeColor::new(208, 135, 112),
            special: ThemeColor::new(129, 161, 193),
        },
        ui: UiTheme {
            border: ThemeColor::new(59, 66, 82),
            border_active: ThemeColor::new(94, 129, 172),
            title: ThemeColor::new(94, 129, 172),
            title_active: ThemeColor::new(136, 192, 208),
            command_palette: ThemeColor::new(59, 66, 82),
            file_explorer: ThemeColor::new(59, 66, 82),
        },
    }
}

fn dracula_theme() -> Theme {
    Theme {
        name: "dracula".to_string(),
        background: ThemeColor::new(40, 42, 54),
        foreground: ThemeColor::new(248, 248, 242),
        cursor: ThemeColor::new(248, 248, 242),
        selection: ThemeColor::new(68, 71, 90),
        line_number: ThemeColor::new(98, 114, 164),
        line_number_active: ThemeColor::new(255, 184, 108),
        syntax_highlight: SyntaxHighlightTheme {
            keyword: ThemeColor::new(255, 121, 198),
            string: ThemeColor::new(241, 250, 140),
            function: ThemeColor::new(139, 233, 253),
            variable: ThemeColor::new(248, 248, 242),
            comment: ThemeColor::new(98, 114, 164),
            type_color: ThemeColor::new(80, 250, 123),
            number: ThemeColor::new(189, 147, 249),
            operator: ThemeColor::new(255, 121, 198),
            punctuation: ThemeColor::new(255, 121, 198),
            constant: ThemeColor::new(189, 147, 249),
            attribute: ThemeColor::new(80, 250, 123),
            tag: ThemeColor::new(255, 184, 108),
            special: ThemeColor::new(139, 233, 253),
        },
        ui: UiTheme {
            border: ThemeColor::new(68, 71, 90),
            border_active: ThemeColor::new(98, 114, 164),
            title: ThemeColor::new(98, 114, 164),
            title_active: ThemeColor::new(139, 233, 253),
            command_palette: ThemeColor::new(68, 71, 90),
            file_explorer: ThemeColor::new(68, 71, 90),
        },
    }
}

fn gruvbox_theme() -> Theme {
    Theme {
        name: "gruvbox".to_string(),
        background: ThemeColor::new(40, 40, 40),
        foreground: ThemeColor::new(235, 219, 178),
        cursor: ThemeColor::new(235, 219, 178),
        selection: ThemeColor::new(69, 69, 69),
        line_number: ThemeColor::new(146, 131, 116),
        line_number_active: ThemeColor::new(250, 189, 47),
        syntax_highlight: SyntaxHighlightTheme {
            keyword: ThemeColor::new(251, 73, 52),
            string: ThemeColor::new(152, 151, 26),
            function: ThemeColor::new(38, 139, 210),
            variable: ThemeColor::new(235, 219, 178),
            comment: ThemeColor::new(146, 131, 116),
            type_color: ThemeColor::new(175, 161, 235),
            number: ThemeColor::new(250, 189, 47),
            operator: ThemeColor::new(251, 73, 52),
            punctuation: ThemeColor::new(251, 73, 52),
            constant: ThemeColor::new(250, 189, 47),
            attribute: ThemeColor::new(175, 161, 235),
            tag: ThemeColor::new(215, 95, 0),
            special: ThemeColor::new(38, 139, 210),
        },
        ui: UiTheme {
            border: ThemeColor::new(60, 56, 54),
            border_active: ThemeColor::new(146, 131, 116),
            title: ThemeColor::new(146, 131, 116),
            title_active: ThemeColor::new(250, 189, 47),
            command_palette: ThemeColor::new(60, 56, 54),
            file_explorer: ThemeColor::new(60, 56, 54),
        },
    }
}
