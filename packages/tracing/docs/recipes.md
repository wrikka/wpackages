# Recipes

This document provides practical examples for common use cases.

## Basic Setup for a Node.js Service

This is the recommended setup for any Node.js backend service.

```typescript
// src/tracing.ts
import { init } from '@wpackages/tracing';

export const provider = await init();
```

Import this file at the very top of your application's entry point:

```typescript
// src/index.ts
import './tracing';

// Your application code starts here
import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

With this setup, all incoming Express requests and outgoing `http` and `fetch` requests will be traced automatically.

## Configuring Sampling for Production

In production, you'll likely want to sample only a fraction of your traces to reduce overhead. Here's how to sample 20% of traces:

```typescript
// src/tracing.ts
import { init, ParentBasedSampler, TraceIdRatioBasedSampler } from '@wpackages/tracing';

export const provider = await init({
  sampler: new ParentBasedSampler(new TraceIdRatioBasedSampler(0.2))
});
```

## Adding Trace IDs to Logs

To correlate logs with traces, you can use the `getTraceContext` helper.

```typescript
import { getTraceContext } from '@wpackages/tracing';

function myLogger(level: string, message: string) {
  const traceContext = getTraceContext();
  console.log(JSON.stringify({ level, message, ...traceContext }));
}

myLogger('info', 'Doing some work...');
// Output: {"level":"info","message":"Doing some work...","traceId":"...","spanId":"..."}
```

## Using Baggage for Business Data

Baggage allows you to propagate key-value pairs across service boundaries.

```typescript
import { getActiveBaggage, withActiveBaggage, createBaggage } from '@wpackages/tracing';

const baggage = createBaggage({ 'user.id': { value: '123' } });

withActiveBaggage(baggage, () => {
  // Any spans or outgoing requests created within this function
  // will carry the 'user.id' baggage.

  const currentBaggage = getActiveBaggage();
  console.log(currentBaggage?.getEntry('user.id')?.value); // '123'
});
```
