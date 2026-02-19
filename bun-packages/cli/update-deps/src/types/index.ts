export interface OutdatedDependency {
	[key: string]: string;
}

export interface VulnerabilityInfo {
	summary: string;
	count: number;
}

export interface Choice {
	title: string;
	value: any;
}
