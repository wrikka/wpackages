export type PortStatus = "open" | "closed";

export type PortInfo = {
	readonly port: number;
	readonly url: string;
	readonly status: PortStatus;
};
