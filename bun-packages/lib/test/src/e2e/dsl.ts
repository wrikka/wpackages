export type TestContext = {
  page: {
    goto: (path: string) => Promise<void>;
    title: () => Promise<string>;
    text: () => Promise<string>;
  };
};

export type TestFn = (ctx: TestContext) => Promise<void> | void;

export type TestCase = {
  name: string;
  fn: TestFn;
};

const tests: TestCase[] = [];

export function test(name: string, fn: TestFn): void {
  tests.push({ name, fn });
}

export function getRegisteredTests(): readonly TestCase[] {
  return tests;
}

export type Expectation = {
  toBe: (expected: unknown) => void;
  toContain: (expected: string) => void;
  toMatch: (re: RegExp) => void;
};

export function expect(actual: unknown): Expectation {
  return {
    toBe(expected) {
      if (!Object.is(actual, expected)) {
        throw new Error(`Expected ${String(actual)} to be ${String(expected)}`);
      }
    },
    toContain(expected) {
      if (typeof actual !== "string") {
        throw new Error(`Expected value to be string but got ${typeof actual}`);
      }
      if (!actual.includes(expected)) {
        throw new Error(`Expected "${actual}" to contain "${expected}"`);
      }
    },
    toMatch(re) {
      if (typeof actual !== "string") {
        throw new Error(`Expected value to be string but got ${typeof actual}`);
      }
      if (!re.test(actual)) {
        throw new Error(`Expected "${actual}" to match ${String(re)}`);
      }
    },
  };
}
