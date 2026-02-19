import { isEmail, isNumber, isUrl } from "./validation.utils";

// Example 1: Email validation
console.log("Email Validation:");
console.log(isEmail("user@example.com")); // true
console.log(isEmail("invalid-email")); // false
console.log(isEmail("test@domain")); // false

// Example 2: URL validation
console.log("\nURL Validation:");
console.log(isUrl("https://example.com")); // true
console.log(isUrl("http://localhost:3000")); // true
console.log(isUrl("not-a-url")); // false

// Example 3: Number validation
console.log("\nNumber Validation:");
console.log(isNumber(42)); // true
console.log(isNumber("42")); // false
console.log(isNumber(Number.NaN)); // false

// Example 4: Form validation
const formData = {
	email: "user@example.com",
	website: "https://example.com",
	age: 25,
};

console.log("\nForm Validation:");
console.log(`Email valid: ${isEmail(formData.email)}`);
console.log(`Website valid: ${isUrl(formData.website)}`);
console.log(`Age valid: ${isNumber(formData.age)}`);
