# AI Agent 🤖

A high-performance, modular framework in Rust for building autonomous AI agents. It provides a structured, inspectable, and extensible reasoning core that allows developers to create sophisticated agents with complex decision-making capabilities.

This framework is for you if you want to build agents that go beyond simple prompt-response cycles and require a deliberate, step-by-step thought process.

## The `AgentCore` Philosophy

The heart of the framework is `AgentCore`, a generic reasoning engine that orchestrates an agent's decision-making process. It formalizes the agent's thought process into a nine-step cycle, making behavior predictable, debuggable, and easy to customize.

1.  **Analyze**: Understand the input and current state.
2.  **Model**: Update the internal world model based on new information.
3.  **Plan**: Formulate a high-level strategy to achieve goals.
4.  **Search**: Expand the search space for potential actions or solutions.
5.  **Simulate**: Project the outcomes of potential actions.
6.  **Evaluate**: Critique the simulations to find the best path forward.
7.  **Decide**: Select the final, concrete action to take.
8.  **Execute**: Perform the chosen action in the environment.
9.  **Learn**: Update the agent's internal state based on the outcome.

This entire process is driven by your implementation of the `TranscendentAgentOps` trait, giving you full control over the agent's "brain".

## Core Components Explained

`AgentCore` is generic over several components. Here's what each one does:

- `ops: O`: **Operations**. This is your logic. You implement the `TranscendentAgentOps` trait to define how the agent performs each of the nine reasoning steps.
- `state: S`: **State**. A custom struct that holds the agent's long-term internal state. This is where the agent's knowledge and character persist between steps.
- `memory: AgentMemory`: **Memory**. Provides a short-term scratchpad or conversational buffer. Can be integrated with more complex memory systems (vector stores, etc.) within your `ops`.
- `budget: Budget`: **Budget**. Manages operational constraints, such as limiting the number of tokens, API calls, or execution time per step.
- `critics: Critics`: **Critics**. A component responsible for evaluating different simulated outcomes during the `Evaluate` phase, helping the agent to critique its own plans.
- `policy: Policy`: **Policy**. A set of rules or guiding principles that constrain the agent's planning and decision-making, ensuring it operates within desired boundaries.

## Quick Start: Building a Math Agent

```rust
use ai_agent::components::AgentCore;
use ai_agent::types::core::*;
use ai_agent::types::error::AgentCoreError;
use ai_agent::types::traits::*;
use std::marker::PhantomData;

// 1. Define types for the agent's world
struct MockState { counter: u32 }
struct MockInput { text: String }
#[derive(Debug, Clone)] struct MockContext(String);
#[derive(Debug, Clone)] struct MockWorldModel(String);
#[derive(Debug, Clone)] struct MockPlan(String);
#[derive(Debug, Clone)] struct MockSearchSpace(String);
#[derive(Debug, Clone)] struct MockSimulation(String);
#[derive(Debug, Clone)] struct MockEvaluation(String);
#[derive(Debug, Clone)] struct MockDecision(String);
#[derive(Debug, Clone)] struct MockExecutionResult(String);

// 2. Mock implementations for dependencies
struct MockMemory; 
impl AgentMemory for MockMemory {}

struct MockBudget; 
impl BudgetManager for MockBudget {}

struct MockPolicy; 
impl Policy for MockPolicy {}

struct MyCritic; 
impl Critic<MockSimulation> for MyCritic {
    type Evaluation = MockEvaluation;
    fn evaluate(&self, sim: MockSimulation) -> Self::Evaluation {
        MockEvaluation(format!("Evaluated: {}", sim.0))
    }
            println!("Agent learned! New state last_result: {}", state.last_result);
        }
    }
}

fn main() -> Result<(), AgentCoreError> {
    // 3. Initialize the AgentCore with its components
    let mut agent_core = AgentCore {
        ops: MyMathOps,
        state: MathAgentState { last_result: 0.0 },
        memory: AgentMemory, // Using default placeholder
        budget: Budget,       // Using default placeholder
        critics: Critics,     // Using default placeholder
        policy: Policy,       // Using default placeholder
    };

    // 4. Run a reasoning step
    let input = MathInput { command: "10 * 4.2".to_string() };
    let result = agent_core.step(&input)?;

    if let AgentStepResult::Continue(MathContext::Executed { result }) = result {
        println!("Agent step finished. Final result: {}", result);
        assert_eq!(result, 42.0);
    }

    // The agent's internal state has been updated
    assert_eq!(agent_core.state.last_result, 42.0);

    Ok(())
}
```

## Integrating Other Features

The true power of `AgentCore` comes from integrating other capabilities (like LLM providers, tools, and memory) inside your `TranscendentAgentOps` implementation.

- **Using LLMs**: Call an LLM provider (like `ai-models`) inside `plan_strategy` or `analyze_codebase` to make intelligent decisions.
- **Using Tools**: Use a `ToolRegistry` inside `execute` to perform actions in the real world.
- **Using Memory**: Interact with a `MemoryManager` inside `update_world_model` to recall past conversations or information.

## License

This project is licensed under the MIT License.
