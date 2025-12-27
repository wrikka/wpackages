export type Handler = (req: Request) => Response | Promise<Response>;

export interface ServerConfig {
	port: number;
	hostname: string;
}

export interface VitextServer {
	port: number;
	fetch: (req: Request) => Response | Promise<Response>;
}
