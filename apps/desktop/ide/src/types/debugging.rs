#[derive(Debug, Clone, Default)]
pub struct DebugSessionState {
    pub id: String,
    pub name: String,
    pub active: bool,
    pub breakpoints: Vec<Breakpoint>,
    pub variables: Vec<Variable>,
}

impl DebugSessionState {
    pub fn new() -> Self {
        Self {
            id: String::new(),
            name: String::new(),
            active: false,
            breakpoints: Vec::new(),
            variables: Vec::new(),
        }
    }

    pub fn with_id(mut self, id: String) -> Self {
        self.id = id;
        self
    }

    pub fn with_name(mut self, name: String) -> Self {
        self.name = name;
        self
    }

    pub fn with_active(mut self, active: bool) -> Self {
        self.active = active;
        self
    }

    pub fn with_breakpoints(mut self, breakpoints: Vec<Breakpoint>) -> Self {
        self.breakpoints = breakpoints;
        self
    }

    pub fn with_variables(mut self, variables: Vec<Variable>) -> Self {
        self.variables = variables;
        self
    }
}

#[derive(Debug, Clone)]
pub struct Breakpoint {
    pub id: String,
    pub file: String,
    pub line: usize,
    pub enabled: bool,
}

impl Breakpoint {
    pub fn new(id: String, file: String, line: usize) -> Self {
        Self {
            id,
            file,
            line,
            enabled: true,
        }
    }
}

#[derive(Debug, Clone)]
pub struct Variable {
    pub name: String,
    pub value: String,
    pub type_name: Option<String>,
}

impl Variable {
    pub fn new(name: String, value: String) -> Self {
        Self {
            name,
            value,
            type_name: None,
        }
    }
}
