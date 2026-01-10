# @wpackages/design-pattern

## Introduction

`@wpackages/design-pattern` is a comprehensive collection of design patterns implemented in TypeScript. The library focuses on correctness, type safety, and practical application of classic design patterns.

## Features

- 📚 **Wide Range**: A comprehensive library of design patterns from various categories including creational, structural, and behavioral patterns.
- 🛡️ **Type-Safe**: Fully implemented in TypeScript to leverage static typing and prevent common errors.
- 🧪 **Thoroughly Tested**: Each pattern is accompanied by a robust test suite using Vitest to ensure correctness.
- 💡 **Usage Examples**: Clear `.usage.ts` files are provided for every pattern to demonstrate practical application.
- 🧱 **Well-Structured**: Patterns are organized into logical categories for easy navigation and discoverability.

## Goal

- 🎯 **Correctness**: To provide reference implementations of classic design patterns that are correct and reliable.
- 🧑‍💻 **Educational**: To serve as a learning resource for developers studying design patterns.
- 🧩 **Reusable**: To offer a set of reusable, high-quality pattern implementations for use in other packages.

## Design Principles

- **Clarity**: Implementations are written to be as clear and readable as possible without sacrificing performance.
- **Purity**: Patterns are implemented as pure functions where possible.
- **Well-Tested**: A strong emphasis is placed on comprehensive testing to guarantee correctness.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

Import the desired pattern from the package and use it in your code.

```typescript
import { singleton } from "@wpackages/design-pattern";

const instance = singleton(() => new MyClass());
```

## Available Patterns

| Pattern                     | Category   | Purpose                                           | Mathematical Concept                                                   | Time Complexity | Space Complexity |
| --------------------------- | ---------- | ------------------------------------------------- | ---------------------------------------------------------------------- | --------------- | ---------------- |
| **Singleton**               | Creational | Ensure a class has only one instance              | $f(x) = x$ (idempotent function)                                       | $O(1)$          | $O(1)$           |
| **Factory**                 | Creational | Create objects without specifying exact class     | $f: \emptyset \to T$ (creation function)                               | $O(1)$          | $O(1)$           |
| **Builder**                 | Creational | Construct complex objects step by step            | $f(x_1, x_2, \dots, x_n) = \{x_1, x_2, \dots, x_n\}$ (aggregation)     | $O(n)$          | $O(n)$           |
| **Prototype**               | Creational | Clone existing objects                            | $f(x) = x'$ (copy function)                                            | $O(1)$          | $O(1)$           |
| **Abstract Factory**        | Creational | Create families of related objects                | $F: S \to \{f_s\}$ where $s \in S$ (family of functions)               | $O(1)$          | $O(1)$           |
| **Adapter**                 | Structural | Convert interface of a class into another         | $f: A \to B$ (function mapping)                                        | $O(1)$          | $O(1)$           |
| **Decorator**               | Structural | Add responsibilities to objects dynamically       | $g(f(x))$ (function composition)                                       | $O(1)$          | $O(1)$           |
| **Facade**                  | Structural | Provide simplified interface to complex subsystem | $f(g(x), h(x))$ (aggregation)                                          | $O(1)$          | $O(1)$           |
| **Proxy**                   | Structural | Control access to an object                       | $f(x) = p(x)$ (proxy function)                                         | $O(1)$          | $O(1)$           |
| **Bridge**                  | Structural | Separate abstraction from implementation          | $f: A \times I \to R$ (bilinear mapping)                               | $O(1)$          | $O(1)$           |
| **Composite**               | Structural | Compose objects into tree structures              | $f(x_1, \dots, x_n) = [f(x_1), \dots, f(x_n)]$ (recursive composition) | $O(n)$          | $O(n)$           |
| **Flyweight**               | Structural | Share common state between objects                | $f: K \to S$ where $                                                   | K               | \ll              |
| **Observer**                | Behavioral | Define one-to-many dependency                     | $S \to \{f_i(x)\}$ (set of functions)                                  | $O(n)$          | $O(n)$           |
| **Strategy**                | Behavioral | Define family of algorithms                       | $f_s(x)$ where $s \in S$ (parameterized function)                      | $O(1)$          | $O(1)$           |
| **Command**                 | Behavioral | Encapsulate request as object                     | $f(x) = y, g(y) = x$ (inverse function)                                | $O(1)$          | $O(1)$           |
| **State**                   | Behavioral | Allow object to alter behavior when state changes | $f(x, s)$ where $s \in S$ (state function)                             | $O(1)$          | $O(1)$           |
| **Iterator**                | Behavioral | Access elements sequentially                      | $f_i: A \to A_i$ (projection)                                          | $O(1)$          | $O(1)$           |
| **Mediator**                | Behavioral | Define centralized communication                  | $M: P \times P \to \mathbb{B}$ (relation)                              | $O(1)$          | $O(n)$           |
| **Memento**                 | Behavioral | Capture and restore internal state                | $f: S \to M, g: M \to S$ (bijection)                                   | $O(1)$          | $O(k)$           |
| **Chain of Responsibility** | Behavioral | Pass request along chain                          | $f_1 \circ f_2 \circ \dots \circ f_n$ (function composition)           | $O(n)$          | $O(1)$           |
| **Template Method**         | Behavioral | Define skeleton of algorithm                      | $f = g_1 \circ g_2 \circ \dots \circ g_n$ (fixed composition)          | $O(n)$          | $O(1)$           |
| **Visitor**                 | Behavioral | Separate algorithm from object structure          | $V: O \to R$ (visitor function)                                        | $O(1)$          | $O(1)$           |

### Pattern Details

#### Creational Patterns

**Singleton**

- Ensures only one instance exists
- Lazy initialization
- Thread-safe in single-threaded JS

**Factory**

- Creates objects without specifying exact class
- Encapsulates object creation logic
- Supports parameterized creation

**Builder**

- Constructs complex objects step by step
- Fluent interface for configuration
- Separates construction from representation

**Prototype**

- Clones existing objects
- Avoids costly object creation
- Supports deep cloning

**Abstract Factory**

- Creates families of related objects
- Ensures consistency across products
- Supports multiple product families

#### Structural Patterns

**Adapter**

- Converts interface of one class to another
- Enables incompatible classes to work together
- Wrapper pattern for interface compatibility

**Decorator**

- Adds behavior dynamically without affecting other objects
- Alternative to subclassing
- Supports multiple decorators

**Facade**

- Provides simplified interface to complex subsystem
- Hides complexity from client
- Reduces dependencies

**Proxy**

- Controls access to an object
- Lazy loading, access control, logging
- Placeholder for expensive objects

**Bridge**

- Separates abstraction from implementation
- Allows independent variation
- Reduces binding at compile time

**Composite**

- Composes objects into tree structures
- Treats individual and composite objects uniformly
- Recursive structure support

**Flyweight**

- Shares common state between objects
- Reduces memory usage
- Intrinsic vs extrinsic state

#### Behavioral Patterns

**Observer**

- One-to-many dependency
- Automatic notification on state changes
- Pub/sub pattern

**Strategy**

- Encapsulates interchangeable algorithms
- Runtime algorithm selection
- Eliminates conditional statements

**Command**

- Encapsulates request as object
- Supports undo/redo operations
- Queuing and logging

**State**

- Allows object to change behavior based on internal state
- State transitions
- Eliminates large conditional statements

**Iterator**

- Access elements sequentially
- Uniform interface for different collections
- Supports multiple traversals

**Mediator**

- Defines centralized communication
- Reduces coupling between objects
- Broadcast and point-to-point communication

**Memento**

- Captures and restores internal state
- Undo functionality
- State persistence

**Chain of Responsibility**

- Passes request along chain
- Decouples sender from receiver
- Dynamic chain configuration

**Template Method**

- Defines skeleton of algorithm
- Allows subclasses to redefine steps
- Code reuse and consistency

**Visitor**

- Separates algorithm from object structure
- Adds operations without modifying classes
- Double dispatch pattern

## Project Structure

```
src/
├── utils/          # Pure functions for each pattern
├── types/          # Type definitions
├── constant/       # Constants
├── lib/            # External library wrappers
├── index.ts        # Public API
test/               # Test files
examples/           # Usage examples
```

## License

This project is licensed under the MIT License.
