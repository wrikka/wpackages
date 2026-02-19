/**
 * GraphQL Parser tests
 */
/* eslint-disable jest/no-conditional-expect */

import { describe, expect, it } from "vitest";
import { Result } from "../utils";
import { parseGraphQL } from "./graphql.parser";

describe("GraphQL Parser", () => {
	it("should parse GraphQL query", () => {
		const query = `
      query GetUser {
        user(id: "1") {
          id
          name
          email
        }
      }
    `;

		const result = parseGraphQL(query, "query.graphql");
		expect(Result.isOk(result)).toBe(true);
		if (Result.isOk(result)) {
			expect(result.value.language).toBe("graphql");
			expect(result.value.data.type).toBe("Document");
		}
	});

	it("should parse GraphQL mutation", () => {
		const mutation = `
      mutation CreateUser($name: String!) {
        createUser(name: $name) {
          id
          name
        }
      }
    `;

		const result = parseGraphQL(mutation, "mutation.graphql");
		expect(Result.isOk(result)).toBe(true);
	});

	it("should parse GraphQL schema", () => {
		const schema = `
      type User {
        id: ID!
        name: String!
        email: String
      }

      type Query {
        user(id: ID!): User
      }
    `;

		const result = parseGraphQL(schema, "schema.graphql");
		expect(Result.isOk(result)).toBe(true);
		if (Result.isOk(result)) {
			expect(result.value.data.definitions?.length).toBeGreaterThan(0);
		}
	});
});
