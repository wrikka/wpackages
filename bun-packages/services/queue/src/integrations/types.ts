/**
 * Integration adapter types
 */

export type IntegrationAdapter = {
	name: string;
	version: string;
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	isConnected(): boolean;
};
