import { describe, it, expect, vi } from 'bun:test';
import { withDebugging } from './withDebugging';

describe('withDebugging', () => {
  it('should call the original selector and return its result', () => {
    const selector = (x: number) => x * 2;
    const debuggedSelector = withDebugging(selector);
    expect(debuggedSelector(10)).toBe(20);
  });

  it('should call the logger with input and output', () => {
    const logger = vi.fn();
    const selector = (x: { val: number }) => ({ result: x.val * 2 });
    const debuggedSelector = withDebugging(selector, 'testSelector', logger);

    debuggedSelector({ val: 10 });

    expect(logger).toHaveBeenCalledTimes(2);
    expect(logger).toHaveBeenCalledWith('[testSelector] Input: {\n  "val": 10\n}');
    expect(logger).toHaveBeenCalledWith('[testSelector] Output: {\n  "result": 20\n}');
  });

  it('should use the default selector name if not provided', () => {
    const logger = vi.fn();
    const selector = (x: number) => x + 1;
    const debuggedSelector = withDebugging(selector, undefined, logger);

    debuggedSelector(5);

    expect(logger).toHaveBeenCalledWith('[selector] Input: 5');
    expect(logger).toHaveBeenCalledWith('[selector] Output: 6');
  });

  it('should use console.log by default if no logger is provided', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const selector = (x: number) => x * 2;
    const debuggedSelector = withDebugging(selector, 'mySelector');

    debuggedSelector(100);

    expect(consoleLogSpy).toHaveBeenCalledWith('[mySelector] Input: 100');
    expect(consoleLogSpy).toHaveBeenCalledWith('[mySelector] Output: 200');

    consoleLogSpy.mockRestore();
  });
});
