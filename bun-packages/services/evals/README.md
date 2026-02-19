# Evals Service

Evaluation services for AI responses and benchmarks.

## Features

- Core Evaluation Engine
- Benchmark Runner
- Metrics Collection
- Evaluation Templates
- Result Storage

## Usage

```typescript
import { EvaluationEngine } from '@wai/evals'

const engine = new EvaluationEngine()
const result = await engine.evaluate({
  input: 'What is the capital of Thailand?',
  output: 'Bangkok',
  expected: 'Bangkok'
})
```

## Development

```bash
bun install
bun dev
bun test
bun build
```
