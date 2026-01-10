import { Context, Effect, Layer } from "effect";
import type { DatabaseType } from "../core/types";
import type { Pool } from "pg";
import type { Pool as MySQLPool } from "mysql2/promise";
import Database from "better-sqlite3";

export interface DatabaseConnection {
	type: DatabaseType;
	connectionString: string;
	pool?: Pool | MySQLPool;
	db?: Database.Database;
}

export interface ORMService {
	readonly connection: DatabaseConnection;
	readonly query: <T>(sql: string, params?: unknown[]) => Effect.Effect<T[], Error>;
	readonly transaction: <A>(f: (conn: DatabaseConnection) => Effect.Effect<A, Error>) => Effect.Effect<A, Error>;
}

export const ORMService = Context.GenericTag<ORMService>("ORMService");

export const ORMServiceLive = (config: DatabaseConnection) =>
	Layer.scoped(
		ORMService,
		Effect.acquireRelease(
			Effect.sync(() => {
				return ORMService.of({
					connection: config,
					query: <T>(sql: string, params?: unknown[]) => {
						return Effect.tryPromise({
							try: async () => {
								if (config.type === "postgresql" && config.pool) {
									const result = await (config.pool as Pool).query(sql, params);
									return result.rows as T[];
								}
								if (config.type === "mysql" && config.pool) {
									const [rows] = await (config.pool as MySQLPool).query(sql, params);
									return rows as T[];
								}
								if (config.type === "sqlite" && config.db) {
									const stmt = config.db.prepare(sql);
									const result = stmt.all(...(params || []));
									return result as T[];
								}
								throw new Error("Unsupported database type");
							},
							catch: (error) => new Error(`Query failed: ${error}`),
						});
					},
					transaction: <A>(f: (conn: DatabaseConnection) => Effect.Effect<A, Error>) => {
						return Effect.tryPromise({
							try: async () => {
								if (config.type === "postgresql" && config.pool) {
									const client = await (config.pool as Pool).connect();
									try {
										await client.query("BEGIN");
										const result = await Effect.runPromise(f({ ...config, pool: client }));
										await client.query("COMMIT");
										return result;
									} catch (error) {
										await client.query("ROLLBACK");
										throw error;
									} finally {
										client.release();
									}
								}
								if (config.type === "sqlite" && config.db) {
									const transaction = config.db.transaction(() => {
										return Effect.runPromise(f(config));
									});
									return transaction();
								}
								throw new Error("Transactions not supported for this database type");
							},
							catch: (error) => new Error(`Transaction failed: ${error}`),
						});
					},
				});
			}),
			({ connection }) =>
				Effect.orDie(
					Effect.tryPromise(async () => {
						if (connection.pool && "end" in connection.pool) {
							await (connection.pool as Pool).end();
						}
						if (connection.db && "close" in connection.db) {
							(connection.db as Database.Database).close();
						}
					}),
				),
		),
	);
