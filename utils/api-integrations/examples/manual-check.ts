/**
 * Manual check script to verify the refactored code works correctly
 * This doesn't require external dependencies
 */

// Import error helpers
import {
	createAuthenticationError,
	createConfigurationError,
	createNetworkError,
	createRateLimitError,
	createTimeoutError,
	createUnknownError,
	createValidationError,
	isIntegrationError,
	toIntegrationError,
} from "../src/index";

console.log("🧪 Testing Error Helpers...\n");

// Test 1: Authentication Error
const authError = createAuthenticationError("Invalid API key", "AUTH_001", {
	userId: "123",
});
console.log("✅ Authentication Error:", authError);
console.assert(authError.type === "authentication", "Auth error type mismatch");
if (authError.type === "authentication") {
	console.assert(authError.code === "AUTH_001", "Auth error code mismatch");
}

// Test 2: Rate Limit Error
const rateLimitError = createRateLimitError("Too many requests", {
	retryAfter: 60,
	limit: 100,
	remaining: 0,
});
console.log("✅ Rate Limit Error:", rateLimitError);
console.assert(
	rateLimitError.type === "rate_limit",
	"Rate limit error type mismatch",
);

// Test 3: Network Error
const networkError = createNetworkError("Connection failed", 503);
console.log("✅ Network Error:", networkError);
console.assert(networkError.type === "network", "Network error type mismatch");
if (networkError.type === "network") {
	console.assert(networkError.statusCode === 503, "Status code mismatch");
}

// Test 4: Validation Error
const validationError = createValidationError("Invalid email", "email", [
	"Email is required",
]);
console.log("✅ Validation Error:", validationError);
console.assert(
	validationError.type === "validation",
	"Validation error type mismatch",
);

// Test 5: Timeout Error (NEW)
const timeoutError = createTimeoutError("Request timeout", 5000, "fetchUser");
console.log("✅ Timeout Error:", timeoutError);
console.assert(timeoutError.type === "timeout", "Timeout error type mismatch");
if (timeoutError.type === "timeout") {
	console.assert(timeoutError.timeout === 5000, "Timeout value mismatch");
	console.assert(
		timeoutError.operation === "fetchUser",
		"Operation name mismatch",
	);
}

// Test 6: Configuration Error (NEW)
const configError = createConfigurationError("Invalid API key", "apiKey");
console.log("✅ Configuration Error:", configError);
console.assert(
	configError.type === "configuration",
	"Configuration error type mismatch",
);

// Test 7: Unknown Error
const unknownError = createUnknownError("Something went wrong");
console.log("✅ Unknown Error:", unknownError);
console.assert(unknownError.type === "unknown", "Unknown error type mismatch");

// Test 8: toIntegrationError
const jsError = new Error("Native JS error");
const convertedError = toIntegrationError(jsError);
console.log("✅ Converted Error:", convertedError);
console.assert(
	convertedError.type === "unknown",
	"Converted error type mismatch",
);

// Test 9: isIntegrationError type guard
console.log("\n🔍 Testing Type Guards...\n");
console.log("Is authError valid?", isIntegrationError(authError));
console.log("Is rateLimitError valid?", isIntegrationError(rateLimitError));
console.log("Is timeoutError valid?", isIntegrationError(timeoutError));
console.log("Is configError valid?", isIntegrationError(configError));
console.log("Is null valid?", isIntegrationError(null));
console.log("Is plain object valid?", isIntegrationError({ foo: "bar" }));

console.assert(
	isIntegrationError(authError) === true,
	"authError should be valid",
);
console.assert(
	isIntegrationError(timeoutError) === true,
	"timeoutError should be valid",
);
console.assert(
	isIntegrationError(configError) === true,
	"configError should be valid",
);
console.assert(isIntegrationError(null) === false, "null should be invalid");
console.assert(
	isIntegrationError({ foo: "bar" }) === false,
	"plain object should be invalid",
);

console.log("\n✨ All manual checks passed! ✨\n");
