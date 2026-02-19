// Git config
export type GitConfig = {
	readonly cwd?: string;
	readonly author?: {
		readonly name: string;
		readonly email: string;
	};
};
