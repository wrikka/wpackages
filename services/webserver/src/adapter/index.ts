export type DatabaseAdapter = {
	query: (sql: string, params?: unknown[]) => Promise<unknown[]>;
};

export const createDatabaseAdapter = (connectionString: string): DatabaseAdapter => ({
	query: async (sql, params = []) => {
		console.log(`Executing: ${sql}`, params);
		return [];
	},
});
