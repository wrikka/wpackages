export interface SimpleGraph {
	[key: string]: string[];
}

export interface Edge {
	from: string;
	to: string;
	weight: number;
}

export interface EdgeWithCapacity {
	from: string;
	to: string;
	capacity: number;
}
