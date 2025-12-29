import { computed, effect, reactive, readonly, ref, signal, watch, watchEffect } from "../src/index";

describe("palse reactivity", () => {
	it("signal triggers effect", () => {
		const count = signal(0);
		const seen: number[] = [];

		effect(() => {
			seen.push(count.get());
			return undefined;
		});

		count.set(1);
		count.set(2);

		expect(seen).toEqual([0, 1, 2]);
	});

	it("effect cleanup runs", () => {
		const count = signal(0);
		const log: string[] = [];

		effect(() => {
			log.push(`run:${count.get()}`);
			return () => {
				log.push(`cleanup:${count.get()}`);
			};
		});

		count.set(1);
		count.set(2);

		expect(log[0]).toBe("run:0");
		expect(log).toContain("cleanup:1");
		expect(log).toContain("run:1");
		expect(log).toContain("run:2");
	});

	it("computed updates when dependencies change", () => {
		const a = signal(1);
		const b = signal(2);
		const sum = computed(() => a.get() + b.get());

		expect(sum.get()).toBe(3);
		a.set(5);
		expect(sum.get()).toBe(7);
	});

	it("ref exposes .value and triggers effect", () => {
		const count = ref(0);
		const seen: number[] = [];

		effect(() => {
			seen.push(count.value);
			return undefined;
		});

		count.value = 1;
		count.value = 2;

		expect(seen).toEqual([0, 1, 2]);
	});

	it("computed exposes .value", () => {
		const a = ref(1);
		const plusOne = computed(() => a.value + 1);
		expect(plusOne.value).toBe(2);
		a.value = 10;
		expect(plusOne.value).toBe(11);
	});

	it("writable computed supports setting .value", () => {
		const base = ref(1);
		const plusOne = computed({
			get: () => base.value + 1,
			set: (v) => {
				base.value = v - 1;
			},
		});

		expect(plusOne.value).toBe(2);
		plusOne.value = 10;
		expect(base.value).toBe(9);
	});

	it("reactive triggers watchEffect", () => {
		const state = reactive({ count: 0 });
		const seen: number[] = [];

		const stop = watchEffect(() => {
			seen.push(state.count);
		});

		state.count = 1;
		state.count = 2;
		stop();
		state.count = 3;

		expect(seen).toEqual([0, 1, 2]);
	});

	it("readonly throws on set", () => {
		const state = readonly({ count: 0 });
		expect(() => {
			(state as { count: number }).count = 1;
		}).toThrow("Cannot set on readonly reactive object");
	});

	it("watch supports immediate and once", () => {
		const count = ref(0);
		const seen: Array<[number, number]> = [];

		watch(
			() => count.value,
			(v, old) => {
				seen.push([v, old]);
			},
			{ immediate: true, once: true },
		);

		count.value = 1;
		count.value = 2;

		expect(seen.length).toBe(1);
	});

	it("watchEffect pause/resume works", () => {
		const count = ref(0);
		const seen: number[] = [];

		const h = watchEffect(() => {
			seen.push(count.value);
		});

		count.value = 1;
		h.pause();
		count.value = 2;
		h.resume();
		count.value = 3;
		h.stop();
		count.value = 4;

		expect(seen).toEqual([0, 1, 3]);
	});
});
