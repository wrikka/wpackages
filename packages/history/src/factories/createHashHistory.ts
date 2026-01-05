import { createHistory } from "../core/history";
import { createHashSource } from "../services/hash";
import type { History } from "../types/history";

export function createHashHistory(): History {
	return createHistory(createHashSource());
}
