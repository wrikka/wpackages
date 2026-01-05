import { createHistory } from "../core/history";
import { createBrowserSource } from "../services/browser";
import type { History } from "../types/history";

export function createBrowserHistory(): History {
	return createHistory(createBrowserSource());
}
