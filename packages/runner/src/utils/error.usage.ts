import { createRunnerError, formatErrorMessage, isExitCodeError, isSignalError, isTimeoutError } from "./error";

// Example 1: Create a RunnerError for failed command
const error1 = createRunnerError({
	command: "npm install",
	exitCode: 1,
	stdout: "Installing packages...",
	stderr: "Error: Package not found",
	signal: null,
	timedOut: false,
	killed: false,
});

console.log("Error 1:", error1.message);

// Example 2: Create a timeout error
const error2 = createRunnerError({
	command: "long-running-task",
	exitCode: null,
	stdout: "",
	stderr: "",
	signal: "SIGTERM",
	timedOut: true,
	killed: true,
	message: "Command timed out after 5000ms",
});

console.log("Error 2:", error2.message);

// Example 3: Format error message for logging
const formatted = formatErrorMessage(error1);
console.log("Formatted error:\n", formatted);

// Example 4: Check error types
console.log("\nError type checks:");
console.log("Is timeout error?", isTimeoutError(error2));
console.log("Is signal error?", isSignalError(error2));
console.log("Is exit code error?", isExitCodeError(error1));

// Example 5: Handle different error types
const handleError = (error: unknown) => {
	if (isTimeoutError(error)) {
		console.log("Command timed out - consider increasing timeout");
	} else if (isSignalError(error)) {
		console.log("Command was terminated by signal");
	} else if (isExitCodeError(error)) {
		console.log("Command failed with non-zero exit code");
	}
};

handleError(error1);
handleError(error2);

// Example 6: Create custom error messages
const error3 = createRunnerError({
	command: "git push",
	exitCode: 128,
	stdout: "",
	stderr: "fatal: repository not found",
	signal: null,
	timedOut: false,
	killed: false,
	message: "Failed to push to remote repository",
});

console.log("\nCustom error:", error3.message);
console.log(formatErrorMessage(error3));
