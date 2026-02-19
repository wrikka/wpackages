# Import Rules and Dependencies

## Import Direction Rules

```
types ← constants ← utils ← lib ← integrations
services ← repositories ← adapter ← app ← cli/web
```

## Special Folders Rules

- **error**: สามารถ import จากทุก layer
- **config**: สามารถ import จาก types เท่านั้น
- **tests**: สามารถ import จากทุก layer

## Import Order

1. External libraries (node_modules)
2. Internal modules (@wai/*)
3. Relative imports (./, ../)

## Barrel Exports

แต่ละโฟลเดอร์ควรมี `index.ts` สำหรับ barrel exports:

```typescript
// src/types/index.ts
export * from './evaluation.types'
export * from './metrics.types'
export * from './benchmark.types'
```

## Examples

```typescript
// ✅ Correct
import { z } from 'zod'
import { EvaluationResult } from '@wai/types'
import { calculateAccuracy } from '../utils'
import { EvaluationEngine } from './evaluation-engine'

// ❌ Wrong
import { EvaluationEngine } from './evaluation-engine'
import { z } from 'zod'
import { calculateAccuracy } from '../utils'
import { EvaluationResult } from '@wai/types'
```
