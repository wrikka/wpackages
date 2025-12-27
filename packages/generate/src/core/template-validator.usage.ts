import { validateTemplate, validateTemplateWithDefaults, assertTemplateValid } from "./template-validator";
import { createTemplateHelpers } from "../utils";

/**
 * Example 1: Validate template with context
 */
export const example1 = () => {
	const template = "{{ pascal name }} - {{ description }}";
	const context = {
		variables: { name: "user", description: "User service" },
		helpers: createTemplateHelpers(),
	};

	const result = validateTemplate(template, context);
	console.log("Valid:", result.valid);
	console.log("Missing variables:", result.missingVariables);
	console.log("Invalid helpers:", result.invalidHelpers);
};

/**
 * Example 2: Validate template with defaults
 */
export const example2 = () => {
	const template = "export const {{ camel name }} = () => {}";
	const variables = { name: "MyService" };

	const result = validateTemplateWithDefaults(template, variables);

	if (result.valid) {
		console.log("Template is valid!");
	} else {
		console.log("Validation errors:", result);
	}
};

/**
 * Example 3: Detect missing variables
 */
export const example3 = () => {
	const template = "{{ pascal name }} - {{ description }} - {{ author }}";
	const variables = { name: "Component", description: "My component" };

	const result = validateTemplateWithDefaults(template, variables);

	console.log("Missing variables:", result.missingVariables); // ['author']
};

/**
 * Example 4: Assert template validity
 */
export const example4 = () => {
	const template = "{{ pascal name }}";
	const context = {
		variables: { name: "service" },
		helpers: createTemplateHelpers(),
	};

	try {
		assertTemplateValid(template, context);
		console.log("Template is valid!");
	} catch (error) {
		console.error("Template validation failed:", error);
	}
};

/**
 * Example 5: Validate complex template
 */
export const example5 = () => {
	const template = `
export interface {{ pascal name }}Props {
  id: string;
  name: string;
}

export const {{ camel name }} = (props: {{ pascal name }}Props) => {
  // Implementation
}
`;

	const variables = { name: "Button" };
	const result = validateTemplateWithDefaults(template, variables);

	console.log("Template valid:", result.valid);
	console.log("Errors:", result.errors);
};
