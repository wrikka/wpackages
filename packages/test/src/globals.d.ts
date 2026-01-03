import { expect } from './utils';
import { w } from './core/w';

type TestFunction = () => void | Promise<void>;

declare global {
    function describe(name: string, fn: () => void): void;
    function it(name: string, fn: TestFunction): void;
    function test(name: string, fn: TestFunction): void;
    function beforeAll(fn: TestFunction): void;
    function afterAll(fn: TestFunction): void;
    const expect: typeof expect;
    const w: typeof w;
}
