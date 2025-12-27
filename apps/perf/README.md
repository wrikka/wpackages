# perf

A simple and powerful performance benchmarking tool for your JavaScript and TypeScript projects.

## Usage

To use the performance tool, you can import the `runBenchmark` function and use it in your code:

```typescript
import { runBenchmark } from 'perf';

const myFn = () => {
  // Your code to benchmark
};

runBenchmark('myFunction', myFn).then(result => {
  console.log(result);
});
```

### CLI (Coming Soon)

An interactive CLI is planned for a future release, allowing you to easily benchmark different files and functions.
