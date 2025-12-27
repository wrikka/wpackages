/**
 * Usage example for template-renderer utility
 */
import { createTemplateHelpers, renderTemplate, validateTemplateVariables } from "./template-renderer.util";

// Example 1: Simple variable replacement
const simpleTemplate = "Hello {{ name }}!";
const simpleContext = {
	variables: { name: "World" },
	helpers: createTemplateHelpers(),
};
console.log("Simple:", renderTemplate(simpleTemplate, simpleContext));

// Example 2: Using helper functions
const componentTemplate = `
export const {{ pascal name }} = () => {
  return <div className="{{ kebab name }}">{{ description }}</div>
}
`;
const componentContext = {
	variables: {
		name: "user profile",
		description: "User profile component",
	},
	helpers: createTemplateHelpers(),
};
console.log("Component:");
console.log(renderTemplate(componentTemplate, componentContext));

// Example 3: Validate required variables
const required = ["name", "type", "description"];
const variables = { name: "test", type: "component" };
const missing = validateTemplateVariables(variables, required);

if (missing.length > 0) {
	console.log("Missing variables:", missing);
}

// Example 4: Pluralization
const helpers = createTemplateHelpers();
console.log("\nPluralization:");
console.log("user ->", helpers.plural("user"));
console.log("category ->", helpers.plural("category"));
console.log("users ->", helpers.singular("users"));
