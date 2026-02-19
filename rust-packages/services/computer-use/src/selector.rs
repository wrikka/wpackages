#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SelectorChain {
    pub steps: Vec<SelectorStep>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SelectorStep {
    pub clauses: Vec<Clause>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Clause {
    pub key: String,
    pub value: String,
}

pub fn parse_selector(input: &str) -> Result<SelectorChain, String> {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return Err("Empty selector".to_string());
    }

    let steps = trimmed
        .split(" >> ")
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .map(parse_step)
        .collect::<Result<Vec<_>, _>>()?;

    if steps.is_empty() {
        return Err("Empty selector".to_string());
    }

    Ok(SelectorChain { steps })
}

fn parse_step(step: &str) -> Result<SelectorStep, String> {
    let clauses = step
        .split(" && ")
        .map(|c| c.trim())
        .filter(|c| !c.is_empty())
        .map(parse_clause)
        .collect::<Result<Vec<_>, _>>()?;

    if clauses.is_empty() {
        return Err("Empty selector step".to_string());
    }

    Ok(SelectorStep { clauses })
}

fn parse_clause(clause: &str) -> Result<Clause, String> {
    // key:value
    let (key, value) = clause
        .split_once(':')
        .ok_or_else(|| format!("Invalid clause: {}", clause))?;

    let key = key.trim();
    let value = value.trim();

    if key.is_empty() || value.is_empty() {
        return Err(format!("Invalid clause: {}", clause));
    }

    Ok(Clause {
        key: key.to_string(),
        value: value.to_string(),
    })
}

pub fn get_index_from_screen_selector(input: &str) -> Option<usize> {
    // Supports:
    // - screen:1
    // - screen:index=1
    // - role:screen && index:1
    // - role:screen && name:"screen 0 (primary)" && index:0

    let s = input.trim();

    if let Some(rest) = s.strip_prefix("screen:") {
        if let Some(eq_rest) = rest.trim().strip_prefix("index=") {
            return eq_rest.trim().parse::<usize>().ok();
        }
        return rest.trim().parse::<usize>().ok();
    }

    let chain = parse_selector(s).ok()?;
    let last = chain.steps.last()?;

    let mut role_is_screen = false;
    let mut index: Option<usize> = None;

    for c in &last.clauses {
        match c.key.to_lowercase().as_str() {
            "role" => {
                if c.value.eq_ignore_ascii_case("screen") {
                    role_is_screen = true;
                }
            }
            "index" => {
                index = c.value.parse::<usize>().ok();
            }
            _ => {}
        }
    }

    if role_is_screen {
        return index;
    }

    None
}

pub fn get_process_exact_from_selector(input: &str) -> Option<String> {
    let s = input.trim();
    if s.is_empty() {
        return None;
    }

    // Fast path: allow single clause process_exact:<name>
    if let Some(rest) = s.strip_prefix("process_exact:") {
        let v = rest.trim();
        if v.is_empty() {
            return None;
        }
        return Some(v.to_string());
    }

    let chain = parse_selector(s).ok()?;
    for step in &chain.steps {
        for c in &step.clauses {
            if c.key.eq_ignore_ascii_case("process_exact") {
                return Some(c.value.clone());
            }
        }
    }

    None
}

pub fn get_pid_from_selector(input: &str) -> Option<u32> {
    let s = input.trim();
    if s.is_empty() {
        return None;
    }

    // Fast path: allow single clause pid:<u32>
    if let Some(rest) = s.strip_prefix("pid:") {
        return rest.trim().parse::<u32>().ok();
    }

    let chain = parse_selector(s).ok()?;
    for step in &chain.steps {
        for c in &step.clauses {
            if c.key.eq_ignore_ascii_case("pid") {
                return c.value.trim().parse::<u32>().ok();
            }
        }
    }

    None
}

pub fn get_hwnd_from_selector(input: &str) -> Option<u64> {
    let s = input.trim();
    if s.is_empty() {
        return None;
    }

    fn parse_hwnd_value(v: &str) -> Option<u64> {
        let v = v.trim();
        if v.is_empty() {
            return None;
        }
        if let Some(hex) = v.strip_prefix("0x").or_else(|| v.strip_prefix("0X")) {
            return u64::from_str_radix(hex.trim(), 16).ok();
        }
        v.parse::<u64>().ok()
    }

    // Fast path: allow single clause hwnd:<u64>
    if let Some(rest) = s.strip_prefix("hwnd:") {
        return parse_hwnd_value(rest);
    }

    let chain = parse_selector(s).ok()?;
    for step in &chain.steps {
        for c in &step.clauses {
            if c.key.eq_ignore_ascii_case("hwnd") {
                return parse_hwnd_value(&c.value);
            }
        }
    }

    None
}

pub fn get_title_exact_from_selector(input: &str) -> Option<String> {
    let s = input.trim();
    if s.is_empty() {
        return None;
    }

    // Fast path: allow single clause title_exact:<value>
    if let Some(rest) = s.strip_prefix("title_exact:") {
        let v = rest.trim();
        if v.is_empty() {
            return None;
        }
        return Some(v.to_string());
    }

    let chain = parse_selector(s).ok()?;
    for step in &chain.steps {
        for c in &step.clauses {
            if c.key.eq_ignore_ascii_case("title_exact") {
                return Some(c.value.clone());
            }
        }
    }

    None
}

pub fn get_title_from_selector(input: &str) -> Option<String> {
    let s = input.trim();
    if s.is_empty() {
        return None;
    }

    // Fast path: allow single clause title:<value>
    if let Some(rest) = s.strip_prefix("title:") {
        let v = rest.trim();
        if v.is_empty() {
            return None;
        }
        return Some(v.to_string());
    }

    let chain = parse_selector(s).ok()?;
    for step in &chain.steps {
        for c in &step.clauses {
            if c.key.eq_ignore_ascii_case("title") {
                return Some(c.value.clone());
            }
        }
    }

    None
}

pub fn get_process_from_selector(input: &str) -> Option<String> {
    let s = input.trim();
    if s.is_empty() {
        return None;
    }

    // Fast path: allow single clause process:<name>
    if let Some(rest) = s.strip_prefix("process:") {
        let v = rest.trim();
        if v.is_empty() {
            return None;
        }
        return Some(v.to_string());
    }

    let chain = parse_selector(s).ok()?;
    for step in &chain.steps {
        for c in &step.clauses {
            if c.key.eq_ignore_ascii_case("process") {
                return Some(c.value.clone());
            }
        }
    }
    None
}
