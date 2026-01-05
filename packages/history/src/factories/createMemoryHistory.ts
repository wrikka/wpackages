import { createHistory } from "../core/history";
import { createMemorySource } from "../services/memory";
import type { History } from "../types/history";

export function createMemoryHistory(initialEntries: string[] = ["/"]): History {
	return createHistory(createMemorySource(initialEntries));
}
