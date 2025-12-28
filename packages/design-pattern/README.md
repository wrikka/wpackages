# design-pattern

Pure functional design patterns library with Effect-TS - includes all GoF patterns in functional style

## Features

- ✨ **Pure Functional** - All patterns implemented using pure, composable functions powered by Effect-TS.
- 🎯 **Type-Safe** - Full TypeScript support with robust type inference.
- 🔥 **Tree-Shakeable** - Import only what you need, keeping your bundles small.
- 🚀 **Effect-TS Powered** - Leverages the power of Effect-TS for robust error handling, context management, and asynchronous operations.
- 🧪 **Well Tested** - Comprehensive test coverage
- 📚 **Complete** - All 23 GoF design patterns

## Installation

```bash
bun add design-pattern
```

## Design Patterns Overview

| Pattern | Category | Paradigm | Style | Environment | Use Case |
|---|---|---|---|---|---|
| **Abstract-factory** | creational | fp | functional | client | Providing an interface for creating families of related or dependent objects without specifying their concrete classes |
| **Adapter** | structural | fp | functional | both | Translating one interface for another, integrating legacy code, or mapping data between different models |
| **Bridge** | structural | fp | functional | both | Decoupling an abstraction from its implementation so that the two can vary independently |
| **Builder** | creational | fp | functional | both | Constructing complex objects step by step, allowing for different representations of an object using the same construction process |
| **Chain** | behavioral | fp | functional | both | Passing a request along a chain of handlers |
| **Command** | behavioral | fp | functional | both | Encapsulating a request as an object, thereby letting you parameterize clients with different requests, queue or log requests, and support undoable operations |
| **Composite** | structural | fp | functional | both | Composing objects into tree structures to represent part-whole hierarchies |
| **Decorator** | structural | fp | functional | both | Attaching additional responsibilities to an object or function dynamically |
| **Facade** | structural | fp | functional | both | Providing a simplified, high-level interface to a complex subsystem of components |
| **Factory** | creational | fp | functional | both | Creating objects without specifying the exact class of object that will be created |
| **Flyweight** | structural | fp | functional | both | Minimizing memory usage by sharing as much data as possible with other similar objects; it is a way to use objects in large numbers when a simple repeated representation would use an unacceptable amount of memory |
| **Interpreter** | behavioral | fp | functional | both | Given a language, define a representation for its grammar along with an interpreter that uses the representation to interpret sentences in the language |
| **Iterator** | behavioral | fp | functional | both | Providing a way to access the elements of an aggregate object sequentially without exposing its underlying representation |
| **Mediator** | behavioral | fp | functional | both | Defining an object that encapsulates how a set of objects interact |
| **Memento** | behavioral | fp | stateful | both | Capturing and externalizing an object's internal state so that the object can be restored to this state later, without violating encapsulation |
| **Observer** | behavioral | reactive | stateful | both | Defining a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically |
| **Prototype** | creational | fp | functional | both | Creating new objects by copying an existing object, known as the prototype |
| **Proxy** | structural | fp | functional | both | Providing a surrogate or placeholder for another object to control access to it |
| **Singleton** | creational | fp | stateful | both | Ensuring that a class has only one instance and providing a global point of access to it |
| **State** | behavioral | reactive | stateful | both | Allowing an object to alter its behavior when its internal state changes |
| **Strategy** | behavioral | fp | functional | both | Defining a family of algorithms, encapsulating each one, and making them interchangeable |
| **Template** | behavioral | fp | functional | both | Defining the skeleton of an algorithm in an operation, deferring some steps to subclasses or client functions |
| **Visitor** | behavioral | fp | functional | both | Representing an operation to be performed on the elements of an object structure |

## Usage Examples

### Factory Pattern

```typescript
import { createFactory } from 'design-pattern';

interface User {
  id: number;
  name: string;
  role: string;
}

const userFactory = createFactory<Partial<User>, User>((input) => ({
  id: input.id ?? 0,
  name: input.name ?? 'Guest',
  role: input.role ?? 'user',
}));

const user = userFactory({ name: 'Alice', role: 'admin' });
```

### Observer Pattern

```typescript
import { createObservable } from 'design-pattern';

const observable = createObservable<number>();

const unsubscribe = observable.subscribe((value) => {
  console.log('Received:', value);
});

observable.notify(42);
unsubscribe();
```

### Strategy Pattern

```typescript
import { createConditionalStrategy } from 'design-pattern';

const calculator = createConditionalStrategy(
  [
    { condition: (op) => op === 'add', strategy: ([a, b]) => a + b },
    { condition: (op) => op === 'multiply', strategy: ([a, b]) => a * b },
  ],
  ([a, b]) => a - b
);

const result = calculator([5, 3]); // Using default: 2
```

### Builder Pattern

```typescript
import { createBuilder } from 'design-pattern';

const userBuilder = createBuilder({
  id: 0,
  name: '',
  email: '',
});

const user = userBuilder
  .setId(1)
  .setName('Bob')
  .setEmail('bob@example.com')
  .build();
```

### Command Pattern

```typescript
import { createCommand, createCommandInvoker } from 'design-pattern';

let count = 0;

const increment = createCommand(
  () => ++count,
  () => --count
);

const invoker = createCommandInvoker();
invoker.execute(increment); // count = 1
invoker.undo();             // count = 0
invoker.redo();             // count = 1
```

### Abstract Factory Pattern

```typescript
import { WinFactory, MacFactory, createApplication } from 'design-pattern/creational';

const app = createApplication(process.platform === 'win32' ? WinFactory : MacFactory);
const ui = app.createUI();

console.log(ui.button.paint());
console.log(ui.checkbox.paint());
```

### Interpreter Pattern

```typescript
import { interpret, add, number } from 'design-pattern/behavioral';

// Represents the expression: 5 + (10 + 2)
const expression = add(number(5), add(number(10), number(2)));

const result = interpret(expression);

console.log(`Result: ${result}`); // Result: 17
```

## API Reference

### Creational

#### Factory
- `createFactory<TInput, TOutput>(creator)`
- `createFactoryWithDefaults<TInput, TOutput>(creator, defaults)`
- `createConditionalFactory<TInput, TOutput>(factories, defaultFactory)`
- `createMemoizedFactory<TInput, TOutput>(factory)`

#### Builder
- `createBuilder<TState>(initialState)`
- `createPipelineBuilder<TState>(initialState)`
- `createValidatedBuilder<TState>(initialState, validators)`

#### Singleton
- `createSingleton<T>(factory)`
- `createLazySingleton<T>(factory)`
- `createResettableSingleton<T>(factory)`
- `createSingletonRegistry<T>()`

#### Prototype
- `clone<T>(obj)`
- `shallowClone<T>(obj)`
- `createPrototype<T>(prototype)`
- `createPrototypeRegistry<T>()`

#### Abstract Factory
- `createApplication(factory)` - Creates an application instance with a given factory.
- `WinFactory` / `MacFactory` - Concrete factory objects.

### Structural

#### Adapter
- `createAdapter<TSource, TTarget>(transform)`
- `createBidirectionalAdapter<TSource, TTarget>(toTarget, toSource)`
- `createPropertyAdapter<TSource, TTarget>(mapping)`

#### Decorator
- `createDecorator<T, TResult>(baseFunction, decorator)`
- `createDecoratorChain<T, TResult>(baseFunction, ...decorators)`
- `createLoggingDecorator<TArgs, TResult>(fn, logger?)`
- `createCachingDecorator<TArgs, TResult>(fn)`

#### Facade
- `createFacade<TSubsystems, TOperations>(subsystems, operations)`
- `createLazyFacade<TSubsystems, TOperations>(subsystemsFactory, operations)`

#### Proxy
- `createProxy<T>(target, handler)`
- `createLazyProxy<T>(factory)`
- `createLoggingProxy<T>(target, logger?)`
- `createCachingProxy<T>(target, keyGenerator?)`

### Behavioral

#### Observer
- `createObservable<T>()`
- `createSubject<T>(initialValue)`

#### Strategy
- `createStrategy<TInput, TOutput>(strategy)`
- `createStrategySelector<TInput, TOutput>(strategies, defaultStrategy)`
- `createConditionalStrategy<TInput, TOutput>(strategies, defaultStrategy)`

#### Command
- `createCommand<TResult>(execute, undo?)`
- `createCommandInvoker<TResult>()`
- `createMacroCommand<TResult>(commands)`

#### Chain of Responsibility
- `createChain<TInput, TOutput>(handlers, defaultValue?)`
- `composeHandlers<TInput, TOutput>(...handlers)`

#### Interpreter
- `interpret(expression)` - Evaluates an expression tree.
- `number(value)` - Creates a number expression.
- `add(left, right)` - Creates an addition expression.

## TypeScript Support

All patterns are fully typed with TypeScript:

```typescript
import { createFactory } from 'design-pattern';

// Type inference works automatically
const factory = createFactory((input: number) => ({ value: input * 2 }));
const result = factory(5); // type: { value: number }
```

## Best Practices

1. **Use Pure Functions** - All patterns are designed to be pure and side-effect free
2. **Compose Patterns** - Combine multiple patterns for complex scenarios
3. **Type Safety** - Leverage TypeScript for compile-time guarantees
4. **Immutability** - Patterns work with immutable data structures

## Contributing

Contributions are welcome! Please read our contributing guidelines.

## License

MIT

## Related Packages

- `utils` - Functional utilities
- `schema` - Schema validation
- `signals` - Reactive programming

---

Made with ❤️ by Wrikka Team
