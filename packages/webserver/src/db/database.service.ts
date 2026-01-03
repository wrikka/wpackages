import { Context, Layer } from "effect";
import { db } from "./client";

// Define the service interface
export interface Database {
	readonly db: typeof db;
}

// Create a Tag for the service
export const Database = Context.GenericTag<Database>("Database");

// Implement the live service layer
export const DatabaseLive = Layer.succeed(Database, Database.of({ db }));
