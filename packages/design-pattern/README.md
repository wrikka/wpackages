# design-pattern

Pure functional design patterns library with TypeScript - includes all GoF patterns in functional style

## Features

- ✨ **Pure Functional** - All patterns implemented using pure functions
- 🎯 **Type-Safe** - Full TypeScript support with type inference
- 🔥 **Tree-Shakeable** - Import only what you need
- 📦 **Zero Dependencies** - Lightweight and fast
- 🧪 **Well Tested** - Comprehensive test coverage
- 📚 **Complete** - All 23 GoF design patterns

## Installation

```bash
bun add design-pattern
```

## Design Patterns

### Creational Patterns

Object creation mechanisms

- **Factory** - Creates objects without specifying exact classes
- **Builder** - Constructs complex objects step by step
- **Singleton** - Ensures only one instance exists
- **Prototype** - Creates new objects by cloning existing ones

### Structural Patterns

Object composition and relationships

- **Adapter** - Converts interface of a class into another interface
- **Decorator** - Adds new functionality to objects dynamically
- **Facade** - Provides a simplified interface to a complex subsystem
- **Proxy** - Provides a surrogate or placeholder for another object
- **Composite** - Composes objects into tree structures
-   **Reactivity**: Integrates with `reactivity` for state management.
- **Bridge** - Separates abstraction from implementation
- **Flyweight** - Shares common state between multiple objects

### Behavioral Patterns

Object collaboration and responsibility

- **Observer** - Defines a one-to-many dependency between objects
- **Strategy** - Defines a family of algorithms
- **Command** - Encapsulates a request as an object
- **Chain of Responsibility** - Passes requests along a chain of handlers
- **Iterator** - Accesses elements of a collection sequentially
- **Mediator** - Defines simplified communication between classes
- **State** - Alters behavior when internal state changes
- **Template Method** - Defines skeleton of algorithm in base class
- **Visitor** - Separates algorithm from object structure
- **Memento** - Captures and restores object state

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
