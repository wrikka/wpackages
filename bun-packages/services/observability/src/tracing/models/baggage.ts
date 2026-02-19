export type BaggageEntry = {
	value: string;
	metadata?: string;
};

/**
 * A map of key-value pairs for propagating context across service boundaries.
 */
export interface Baggage {
	/**
	 * Gets an entry from the baggage.
	 */
	getEntry(key: string): BaggageEntry | undefined;

	/**
	 * Gets all entries from the baggage.
	 */
	getAllEntries(): [string, BaggageEntry][];

	/**
	 * Sets an entry in the baggage.
	 */
	setEntry(key: string, entry: BaggageEntry): Baggage;

	/**
	 * Removes an entry from the baggage.
	 */
	removeEntry(key: string): Baggage;

	/**
	 * Clears all entries from the baggage.
	 */
	clear(): Baggage;
}

class BaggageImpl implements Baggage {
	private readonly _entries: Map<string, BaggageEntry>;

	constructor(entries?: Map<string, BaggageEntry>) {
		this._entries = entries ? new Map(entries) : new Map();
	}

	getEntry(key: string): BaggageEntry | undefined {
		return this._entries.get(key);
	}

	getAllEntries(): [string, BaggageEntry][] {
		return Array.from(this._entries.entries());
	}

	setEntry(key: string, entry: BaggageEntry): Baggage {
		const newEntries = new Map(this._entries);
		newEntries.set(key, entry);
		return new BaggageImpl(newEntries);
	}

	removeEntry(key: string): Baggage {
		const newEntries = new Map(this._entries);
		newEntries.delete(key);
		return new BaggageImpl(newEntries);
	}

	clear(): Baggage {
		return new BaggageImpl();
	}
}

export function createBaggage(entries?: Record<string, BaggageEntry>): Baggage {
	return new BaggageImpl(entries ? new Map(Object.entries(entries)) : new Map());
}
