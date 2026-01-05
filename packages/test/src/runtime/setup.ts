import {
	afterAll as wAfterAll,
	afterEach as wAfterEach,
	beforeAll as wBeforeAll,
	beforeEach as wBeforeEach,
	describe as wDescribe,
	it as wIt,
	test as wTest,
} from "../core/globals";
import { w as wW } from "../core/w";
import { expect as wExpect } from "../utils/assertions";

declare global {
	interface GlobalThis {
		describe: typeof wDescribe;
		it: typeof wIt;
		test: typeof wTest;
		beforeAll: typeof wBeforeAll;
		beforeEach: typeof wBeforeEach;
		afterAll: typeof wAfterAll;
		afterEach: typeof wAfterEach;
		expect: typeof wExpect;
		w: typeof wW;
	}
}

(globalThis as any).describe = wDescribe;
(globalThis as any).it = wIt;
(globalThis as any).test = wTest;
(globalThis as any).beforeAll = wBeforeAll;
(globalThis as any).beforeEach = wBeforeEach;
(globalThis as any).afterAll = wAfterAll;
(globalThis as any).afterEach = wAfterEach;
(globalThis as any).expect = wExpect;
(globalThis as any).w = wW;

export {};
