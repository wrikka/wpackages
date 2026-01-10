import { defineTable } from "../src/schema/schema";
import { createQueryBuilder, createInsertBuilder, createConditionBuilder } from "../src/query/query-builder";
import { SQLBuilder } from "../src/core/sql-builder";
import { ORMService, ORMServiceLive } from "../src/effect/database.service";
import { Effect } from "effect";

interface User {
	id: number;
	name: string;
	email: string;
	createdAt: Date;
}

const usersTable = defineTable<User>("users")
	.int("id").primaryKey().autoIncrement()
	.varchar("name", 255).notNull()
	.varchar("email", 255).unique()
	.timestamp("createdAt").default("CURRENT_TIMESTAMP")
	.build();

const sqlBuilder = new SQLBuilder("postgresql");

console.log("=== @wpackages/orm - Custom SQL Builder Engine ===\n");

console.log("1. Schema Definition:");
console.log(JSON.stringify(usersTable, null, 2));

console.log("\n2. SELECT Query:");
const selectQuery = createQueryBuilder<User>("users")
	.select("id", "name", "email")
	.where(createConditionBuilder().column("id").eq(1))
	.orderBy("name", "ASC")
	.limit(10)
	.build();
console.log(sqlBuilder.build(selectQuery));

console.log("\n3. INSERT Query:");
const insertQuery = createInsertBuilder<User>("users")
	.values({ name: "John Doe", email: "john@example.com" })
	.returning("id", "name")
	.build();
console.log(sqlBuilder.build(insertQuery));

const config = {
	type: "sqlite" as const,
	connectionString: ":memory:",
};

const layer = ORMServiceLive(config);

const main = Effect.gen(function* () {
	const orm = yield* ORMService;
	const query = sqlBuilder.build(selectQuery);
	console.log("\n4. Execute Query with Effect:");
	const users = yield* orm.query<User>(query);
	console.log("Users:", users);
});

Effect.runPromise(Effect.provide(main, layer)).catch(console.error);
