# File Naming Conventions

## File Suffix Rules

| Type | Suffix | Example |
|------|--------|---------|
| Service | `.service.ts` | `evaluation.service.ts` |
| Adapter | `.adapter.ts` | `openai.adapter.ts` |
| Library | `.lib.ts` | `metrics.lib.ts` |
| Utility | `.util.ts` | `string-manipulation.util.ts` |
| Type | `.type.ts` | `evaluation-result.type.ts` |
| Component | `.component.ts` | `result-display.component.ts` |
| Controller | `.controller.ts` | `evaluation.controller.ts` |
| CLI | `.cli.ts` | `run-benchmark.cli.ts` |
| Web | `.web.ts` | `dashboard.web.ts` |
| Config | `.config.ts` | `database.config.ts` |
| Test | `.test.ts` | `evaluation-engine.test.ts` |
| Tool | `.tool.ts` | `data-processor.tool.ts` |
| Repository | `.repository.ts` | `evaluation.repository.ts` |

## Naming Rules

1. **Use lowercase and kebab-case**
   - ✅ `user-auth.service.ts`
   - ❌ `UserAuthService.ts`
   - ❌ `user_auth.service.ts`

2. **Name must describe functionality**
   - ✅ `accuracy-calculator.util.ts`
   - ❌ `helper.util.ts`

3. **Be specific but concise**
   - ✅ `evaluation-metrics.service.ts`
   - ❌ `eval-metrics.svc.ts`

## Examples

### Services
```typescript
// evaluation.service.ts
export class EvaluationService {
  // Core evaluation logic
}

// benchmark.service.ts
export class BenchmarkService {
  // Benchmark execution logic
}
```

### Utilities
```typescript
// string-similarity.util.ts
export function calculateSimilarity(a: string, b: string): number {
  // String similarity calculation
}

// time-tracker.util.ts
export class TimeTracker {
  // Performance tracking
}
```

### Types
```typescript
// evaluation-result.type.ts
export interface EvaluationResult {
  score: number
  metrics: Record<string, number>
  timestamp: Date
}

// benchmark-config.type.ts
export interface BenchmarkConfig {
  models: string[]
  datasets: string[]
  metrics: string[]
}
```

### Repositories
```typescript
// evaluation.repository.ts
export class EvaluationRepository {
  // Database operations for evaluations
}

// benchmark.repository.ts
export class BenchmarkRepository {
  // Database operations for benchmarks
}
```
