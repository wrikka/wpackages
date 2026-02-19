# Reasoning Engine

An advanced, agent-based reasoning engine for Rust that combines LLM-based and symbolic reasoning strategies.

## Features

- **Hybrid Reasoning**: Seamlessly combines LLM-based and symbolic reasoning
- **Knowledge Base**: Supports facts, rules, and unification for logical inference
- **Multiple Strategies**:
  - Forward Chaining (data-driven)
  - Backward Chaining (goal-driven)
  - Chain of Thought (LLM-based)
  - Tree of Thoughts (exploratory)
- **Reflection**: Meta-cognitive capabilities for self-improvement
- **Tool Integration**: Extensible tool system for external actions

## Quick Start

```rust
use reasoning::prelude::*;

#[tokio::main]
async fn main() {
    // Create an agent with default configuration
    let agent = ReasoningAgent::default();
    
    let input = ReasoningInput {
        query: "What is the capital of France?".to_string(),
    };
    
    match agent.reason(&input).await {
        Ok(output) => println!("Result: {}", output.result),
        Err(e) => eprintln!("Error: {}", e),
    }
}
```

## Symbolic Reasoning Example

```rust
use reasoning::prelude::*;

#[tokio::main]
async fn main() {
    // Create a knowledge base
    let mut kb = KnowledgeBase::new();
    kb.add_fact(Fact::binary("is", Term::constant("Socrates"), Term::constant("man")));
    kb.add_rule(Rule::simple(
        Fact::binary("is", Term::variable("X"), Term::constant("man")),
        Fact::binary("is", Term::variable("X"), Term::constant("mortal")),
    ));
    
    // Create agent with knowledge base
    let agent = ReasoningAgentBuilder::new(AgentConfiguration::default())
        .with_knowledge_base(kb)
        .build();
    
    // Run forward chaining
    let mut state = State::default();
    agent.reason_symbolic("ForwardChaining", &mut state).await.unwrap();
    
    // Check derived facts
    let mortal = Fact::binary("is", Term::constant("Socrates"), Term::constant("mortal"));
    assert!(state.knowledge_base.contains_fact(&mortal));
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ReasoningAgent                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Planner   │  │  Evaluator  │  │    Reflector        │ │
│  │  (LLM-based)│  │  (Judge)    │  │  (Meta-cognitive)   │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Reasoning Strategies                    │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │   │
│  │  │ Forward  │ │ Backward │ │  Chain   │ │  Tree   │ │   │
│  │  │ Chaining │ │ Chaining │ │ of Thought│ │of Thoughts│ │
│  │  └──────────┘ └──────────┘ └──────────┘ └─────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Knowledge Base                          │   │
│  │  • Facts (ground truths)                             │   │
│  │  • Rules (implications)                             │   │
│  │  • Unification Engine                               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Core Types

| Type | Description |
|------|-------------|
| `Term` | Building blocks: Constant, Variable, Number, Boolean, Complex |
| `Fact` | Structured assertions: `predicate(arg1, arg2, ...)` |
| `Rule` | Implications: `consequent :- antecedent1, antecedent2, ...` |
| `KnowledgeBase` | Container for facts and rules |
| `State` | Complete reasoning state with trace and KB |
| `Substitution` | Variable bindings from unification |

## Running Tests

```bash
cargo test
```

## License

MIT
