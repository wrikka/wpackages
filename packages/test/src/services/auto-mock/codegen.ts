import type { TypeDefinition, TypeMethod } from "./types";

// Generate mock code from type definition
export function generateMockCode(typeDef: TypeDefinition): string {
	let mockCode = `// Auto-generated mock for ${typeDef.name}\n`;
	mockCode += `const mock${typeDef.name} = {\n`;

	// Generate properties
	for (const [propName, prop] of Object.entries(typeDef.properties)) {
		const mockValue = generateMockValue(prop.type, prop.optional);
		mockCode += `  ${propName}: ${mockValue},\n`;
	}

	// Generate methods
	for (const [methodName, method] of Object.entries(typeDef.methods)) {
		const mockMethod = generateMockMethod(method);
		mockCode += `  ${methodName}: ${mockMethod},\n`;
	}

	mockCode += `};\n\n`;
	mockCode += `export default mock${typeDef.name};\n`;

	return mockCode;
}

export function generateMockValue(type: string, optional: boolean): string {
	const valueMap: Record<string, string> = {
		string: optional ? "\"\"" : "\"mock-string\"",
		number: optional ? "0" : "42",
		boolean: optional ? "false" : "true",
		object: optional ? "{}" : "{ mock: true }",
		array: optional ? "[]" : "[1, 2, 3]",
		function: "() => {}",
		Date: optional ? "new Date()" : "new Date(\"2023-01-01\")",
		RegExp: optional ? "/./" : "/mock/",
	};

	return valueMap[type] || "null";
}

export function generateMockMethod(method: TypeMethod): string {
	const paramNames = method.parameters.map((p) => p.name).join(", ");
	const returnValue = generateMockValue(method.returnType, false);

	let mockMethod = `(${paramNames}) => ${returnValue}`;

	if (method.async) {
		mockMethod = `async ${mockMethod}`;
	}

	if (method.generator) {
		mockMethod = `function* ${mockMethod}`;
	}

	return mockMethod;
}
