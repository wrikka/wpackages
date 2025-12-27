/**
 * GraphQL Parser - Usage Examples
 */

import { parseGraphQL, Result } from "../index";

// Example 1: Parse GraphQL query
const query = `
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`;

const result = parseGraphQL(query, "users.graphql");
if (Result.isOk(result)) {
	console.log("Language:", result.value.language);
	console.log("Definitions:", result.value.data.definitions?.length);
}

// Example 2: Parse GraphQL mutation
const mutation = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
    }
  }
`;

const mutationResult = parseGraphQL(mutation, "create-user.graphql");
console.log("Mutation parsed:", Result.isOk(mutationResult));

// Example 3: Parse GraphQL schema
const schema = `
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Query {
    user(id: ID!): User
    users: [User!]!
  }
`;

const schemaResult = parseGraphQL(schema, "schema.graphql");
console.log("Schema parsed:", Result.isOk(schemaResult));
