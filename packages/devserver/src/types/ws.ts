/**
 * Core types for @wpackages/devserver WebSocket protocol
 * No Vite coupling - pure devserver types
 */

export interface WsMessage {
	readonly type: string;
	readonly data?: unknown;
}

export interface WsClientReadyMessage extends WsMessage {
	readonly type: "wdev:client-ready";
}

export interface WsConfigMessage extends WsMessage {
	readonly type: "wdev:config";
	readonly data: {
		readonly root: string;
		readonly port: number;
		readonly hostname: string;
	};
}

export interface WsPackageInfoMessage extends WsMessage {
	readonly type: "wdev:package-info";
	readonly data: Record<string, unknown>;
}

export interface WsModuleGraphRequestMessage extends WsMessage {
	readonly type: "wdev:get-module-graph";
	readonly data: {
		readonly file: string;
	};
}

export interface WsModuleGraphResponseMessage extends WsMessage {
	readonly type: "wdev:module-graph";
	readonly data: {
		readonly nodes: Array<{ readonly id: string; readonly label: string }>;
		readonly edges: Array<{ readonly from: string; readonly to: string }>;
	};
}

export interface WsHmrUpdateMessage extends WsMessage {
	readonly type: "wdev:hmr-update";
	readonly data: {
		readonly type: "full-reload" | "update";
		readonly url?: string;
		readonly timestamp: number;
	};
}

export interface WsErrorMessage extends WsMessage {
	readonly type: "wdev:error";
	readonly data: {
		readonly message: string;
		readonly stack?: string;
		readonly file?: string;
		readonly line?: number;
		readonly column?: number;
	};
}

export type AnyWsMessage =
	| WsClientReadyMessage
	| WsConfigMessage
	| WsPackageInfoMessage
	| WsModuleGraphRequestMessage
	| WsModuleGraphResponseMessage
	| WsHmrUpdateMessage
	| WsErrorMessage;

export interface DevServerWs {
	readonly on: (
		event: "connection",
		listener: (ws: WebSocket & { on: (event: "message", listener: (data: Buffer) => void) => void }) => void,
	) => void;
	readonly send: (type: string, data: unknown) => void;
	readonly broadcast: (message: WsMessage) => void;
}

export interface DevServerContext {
	readonly root: string;
	readonly port: number;
	readonly hostname: string;
	readonly ws: DevServerWs;
}
